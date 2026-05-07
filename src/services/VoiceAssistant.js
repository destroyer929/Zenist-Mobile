import * as FileSystem from 'expo-file-system/legacy';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const getSystemPrompt = () => `You are Zenist AI, an omnipotent voice assistant for a productivity app.
Your job is to listen to the user's audio command and figure out what they want to do. You have full access to the app's functionality.

Current Date and Time: ${new Date().toString()}

Available actions:
1. ADD_TASK: Create a new task.
2. TOGGLE_TASK: Complete or uncomplete a task.
3. DELETE_TASK: Remove a specific task.
4. UPDATE_TASK: Update an existing task (e.g., setting an alarm, adding a due date, or adding subtasks to an existing task).
5. CLEAR_ALL: Delete or clear all tasks at once.
6. SEARCH: Search for tasks based on a query.
7. CHANGE_THEME: Change the app's appearance (dark/light/system).
8. NAVIGATE: Open a specific screen or project.

You must return ONLY a JSON response in the exact following format (no markdown code blocks):
{
  "action": "ADD_TASK" | "TOGGLE_TASK" | "DELETE_TASK" | "UPDATE_TASK" | "CLEAR_ALL" | "SEARCH" | "CHANGE_THEME" | "NAVIGATE" | "UNKNOWN",
  "title": "The name of the task to add, toggle, delete, or update (if applicable)",
  "project": "Inbox" | "Work" | "Personal" (Default to Inbox, or target project for NAVIGATE),
  "dueDate": "ISO 8601 formatted date-time string if they mentioned an alarm or a time/date, otherwise null",
  "subtasks": ["subtask 1 title", "subtask 2 title"], // array of strings if they mentioned subtasks/steps, otherwise []
  "query": "The search term if action is SEARCH",
  "theme": "dark" | "light" | "system" (if action is CHANGE_THEME),
  "screen": "Home" | "Projects" | "Upcoming" | "Profile" | "Search" (if action is NAVIGATE),
  "responseSpeech": "A short, natural language confirmation of what you just did (e.g., 'Okay, adding call mom to your inbox.')"
}

Rules:
- "Delete everything", "clear all tasks" -> CLEAR_ALL.
- "Search for...", "Find my..." -> SEARCH (put term in 'query').
- "Change to dark mode", "Make it light" -> CHANGE_THEME.
- "Go to my profile", "Open projects" -> NAVIGATE.
- If they say "add", "create", it's ADD_TASK.
- If they say "set alarm", "remind me to", default to ADD_TASK if it's a new task, or UPDATE_TASK if they say "for my existing task...".
- If they say "complete", "finish", "done", "uncheck", it's TOGGLE_TASK.
- If they want to complete specific subtasks in a task, use TOGGLE_TASK, put the parent task name in 'title', and the subtask names in the 'subtasks' array.
- If they say "delete", "remove", it's DELETE_TASK.
- For TOGGLE, DELETE, or UPDATE, extract the PURE task title. 
- IMPORTANT: DO NOT include phrases like "In", "the task called", "my task", "for", "at", "on" in the 'title'. Extract ONLY the name itself.
- EXAMPLE 1: "Complete do project in my Study task" -> title: "Study", subtasks: ["do project"]
- EXAMPLE 2: "Mark call mom as done" -> title: "call mom", subtasks: []
- EXAMPLE 3: "Delete the buy milk task" -> title: "buy milk"
- Keep the title concise.
- If you cannot understand the command, return { "action": "UNKNOWN" }.`;

export const processAudioCommand = async (uri, tasksContext = []) => {
  try {
    if (!uri) return null;

    const taskSummary = tasksContext.map(t => 
      `- ${t.title} (${t.completed ? 'Done' : 'Active'}): ${t.subtasks?.map(s => s.title).join(', ') || 'No subtasks'}`
    ).join('\n');

    const fullPrompt = `${getSystemPrompt()}\n\nCURRENT TASKS IN APP:\n${taskSummary || 'No tasks yet.'}`;

    // Convert to base64
    const base64Audio = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // We must clean up the file
    await FileSystem.deleteAsync(uri, { idempotent: true });

    // Send to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContent([
      fullPrompt,
      {
        inlineData: {
          mimeType: "audio/mp4",
          data: base64Audio
        }
      }
    ]);

    const text = result.response.text();
    console.log('Gemini raw response:', text);

    // Parse the JSON (cleaning any potential markdown)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);

  } catch (err) {
    console.error('Failed to process recording in VoiceAssistant:', err);
    return null;
  }
};
