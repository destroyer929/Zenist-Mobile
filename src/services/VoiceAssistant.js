/**
 * VoiceAssistant.js — DEPRECATED (LLM-based)
 * 
 * This file previously handled audio-to-intent via the Gemini LLM API.
 * It has been replaced by the local rule-based parser in ../utils/nlpParser.js
 * and native speech recognition in expo-speech-recognition.
 * 
 * Kept as a backup for future re-integration if needed.
 * 
 * To re-enable LLM mode:
 * 1. Import processAudioCommand in VoiceOrb.js
 * 2. Use expo-audio to record, then call processAudioCommand(uri, tasks)
 */

import * as FileSystem from 'expo-file-system/legacy';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const getSystemPrompt = () => `You are Zenist AI, an omnipotent voice assistant for a productivity app.
Your job is to listen to the user's audio command and figure out what they want to do.

Available actions: ADD_TASK, TOGGLE_TASK, DELETE_TASK, UPDATE_TASK, CLEAR_ALL, SEARCH, CHANGE_THEME, NAVIGATE.

Return ONLY JSON: { "action": "...", "title": "...", "project": "Inbox", "dueDate": null, "subtasks": [], "query": null, "theme": null, "screen": null, "responseSpeech": "..." }`;

/**
 * @deprecated Use parseVoiceCommand from ../utils/nlpParser.js instead.
 */
export const processAudioCommand = async (uri, tasksContext = []) => {
  try {
    if (!uri) return null;

    const taskSummary = tasksContext.map(t => 
      `- ${t.title} (${t.completed ? 'Done' : 'Active'}): ${t.subtasks?.map(s => s.title).join(', ') || 'No subtasks'}`
    ).join('\n');

    const fullPrompt = `${getSystemPrompt()}\n\nCURRENT TASKS:\n${taskSummary || 'No tasks.'}`;

    const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    await FileSystem.deleteAsync(uri, { idempotent: true });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContent([
      fullPrompt,
      { inlineData: { mimeType: "audio/mp4", data: base64Audio } }
    ]);

    const text = result.response.text();
    console.log('[DEPRECATED] Gemini raw response:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('[DEPRECATED] Gemini Error:', error.message);
    return null;
  }
};
