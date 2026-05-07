/**
 * Zenist Local NLP Parser v4 — The Omnipotent Local Brain
 * 
 * Replaces the LLM (Gemini) with a zero-cost, on-device, rule-based intent engine.
 * Supports all 12 app actions with keyword detection, entity extraction, and template responses.
 */

// ─── Keyword Maps ───────────────────────────────────────────────
const ACTION_KEYWORDS = {
  ADD_TASK: ['add', 'create', 'new', 'make', 'set up'],
  TOGGLE_TASK: ['complete', 'finish', 'done', 'mark', 'check', 'tick', 'uncheck', 'undo'],
  DELETE_TASK: ['delete', 'remove', 'trash', 'discard', 'get rid of'],
  CLEAR_ALL: ['clear all', 'delete everything', 'wipe', 'remove all', 'clear everything', 'delete all'],
  SEARCH: ['search', 'find', 'look for', 'look up', 'where is'],
  NAVIGATE: ['go to', 'open', 'navigate', 'show', 'take me to', 'switch to'],
  CHANGE_THEME: ['dark mode', 'light mode', 'auto mode', 'system mode', 'switch theme', 'change theme'],
  SET_ALARM: ['set alarm', 'remind', 'set reminder', 'set timer', 'alarm', 'reminder'],
  ADD_SUBTASKS: ['add step', 'add subtask', 'add steps', 'with steps', 'with subtasks'],
  LIST_TASKS: ['what are my tasks', 'list my tasks', 'show my tasks', 'tell me my tasks', 'how many tasks', 'what do i have'],
  LIST_SUBTASKS: ['what are the subtasks', 'list subtasks', 'show subtasks', 'what steps', 'subtasks in', 'subtasks of', 'subtasks for'],
};

const SCREEN_KEYWORDS = {
  Home: ['home', 'dashboard', 'main'],
  Projects: ['project', 'projects', 'workspace', 'workspaces'],
  Timeline: ['timeline', 'upcoming', 'schedule', 'calendar'],
  Search: ['search'],
  Profile: ['profile', 'settings', 'account', 'me'],
};

const PROJECT_KEYWORDS = {
  Work: ['work', 'office', 'business', 'job'],
  Personal: ['personal', 'private', 'me', 'myself'],
  Inbox: ['inbox', 'default', 'general'],
};

const THEME_KEYWORDS = {
  dark: ['dark', 'night', 'black'],
  light: ['light', 'day', 'white', 'bright'],
  system: ['system', 'auto', 'automatic', 'default'],
};

// ─── Filler Words to Strip ──────────────────────────────────────
const FILLER_WORDS = [
  'please', 'can you', 'could you', 'would you', 'i want to', 'i want you to',
  'i need to', 'i need you to', 'just', 'um', 'uh', 'like', 'okay', 'hey',
  'hey zenist', 'zenist', 'the', 'a', 'an', 'my', 'that', 'this',
];

// ─── Time Parsing ───────────────────────────────────────────────
const parseTime = (text) => {
  const now = new Date();
  
  // "at 5pm", "at 5:30pm", "at 17:00"
  const timeMatch = text.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3]?.toLowerCase();
    
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    const date = new Date();
    
    // Check for "tomorrow"
    if (text.includes('tomorrow')) {
      date.setDate(date.getDate() + 1);
    }
    
    date.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today and no "tomorrow", set for tomorrow
    if (date <= now && !text.includes('tomorrow')) {
      date.setDate(date.getDate() + 1);
    }
    
    return date.toISOString();
  }
  
  // "in 2 hours", "in 30 minutes"
  const inMatch = text.match(/in\s+(\d+)\s*(hour|hours|minute|minutes|min|mins)/i);
  if (inMatch) {
    const amount = parseInt(inMatch[1]);
    const unit = inMatch[2].toLowerCase();
    const date = new Date();
    if (unit.startsWith('hour')) date.setHours(date.getHours() + amount);
    else date.setMinutes(date.getMinutes() + amount);
    return date.toISOString();
  }
  
  // "today" / "tomorrow" without specific time
  if (text.includes('today')) {
    const date = new Date();
    date.setHours(date.getHours() + 1, 0, 0, 0); // 1 hour from now
    return date.toISOString();
  }
  if (text.includes('tomorrow')) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0); // Default to 9 AM tomorrow
    return date.toISOString();
  }
  
  return null;
};

// ─── Project Extraction ─────────────────────────────────────────
const extractProject = (text) => {
  // Check for #hashtag notation first
  const hashMatch = text.match(/#(\w+)/);
  if (hashMatch) {
    const tag = hashMatch[1].toLowerCase();
    for (const [project, keywords] of Object.entries(PROJECT_KEYWORDS)) {
      if (keywords.includes(tag)) return project;
    }
    return hashMatch[1].charAt(0).toUpperCase() + hashMatch[1].slice(1);
  }
  
  // Check for "to work", "in personal", "to inbox"
  const prepMatch = text.match(/(?:to|in|for|under)\s+(work|personal|inbox)/i);
  if (prepMatch) {
    return prepMatch[1].charAt(0).toUpperCase() + prepMatch[1].slice(1);
  }
  
  return 'Inbox';
};

// ─── Screen Extraction ──────────────────────────────────────────
const extractScreen = (text) => {
  for (const [screen, keywords] of Object.entries(SCREEN_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return screen;
    }
  }
  return 'Home';
};

// ─── Theme Extraction ───────────────────────────────────────────
const extractTheme = (text) => {
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return theme;
    }
  }
  return 'dark';
};

// ─── Subtask Extraction ─────────────────────────────────────────
const extractSubtasks = (text) => {
  // "with steps do coding and do project and implement agent"
  // "steps: coding, project, agent"
  const stepsMatch = text.match(/(?:with\s+)?(?:steps?|subtasks?)\s*:?\s*(.+)/i);
  if (stepsMatch) {
    return stepsMatch[1]
      .split(/\s*(?:,|and)\s*/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
  return [];
};

// ─── Title Extraction ───────────────────────────────────────────
const extractTitle = (text, actionVerb) => {
  let title = text;
  
  // Remove the action verb phrase
  if (actionVerb) {
    const verbIdx = title.indexOf(actionVerb);
    if (verbIdx !== -1) {
      title = title.substring(verbIdx + actionVerb.length);
    }
  }
  
  // Remove project references
  title = title.replace(/#\w+/g, '');
  title = title.replace(/(?:to|in|for|under)\s+(?:work|personal|inbox)/gi, '');
  
  // Remove time references
  title = title.replace(/at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '');
  title = title.replace(/in\s+\d+\s*(?:hour|hours|minute|minutes|min|mins)/gi, '');
  title = title.replace(/\b(?:today|tomorrow)\b/gi, '');
  
  // Remove subtask references
  title = title.replace(/(?:with\s+)?(?:steps?|subtasks?)\s*:?\s*.*/gi, '');
  
  // Remove "as done", "as complete", "as completed"
  title = title.replace(/\s+as\s+(?:done|complete|completed|finished)/gi, '');
  
  // Remove "task" word at the end
  title = title.replace(/\s+task\s*$/i, '');
  
  // Clean up
  title = title.replace(/\s+/g, ' ').trim();
  
  // Remove leading prepositions
  title = title.replace(/^(?:the|a|an|to|for|in|my)\s+/i, '');
  
  return title;
};

// ─── Parent Task Extraction (for subtask operations) ────────────
const extractParentTask = (text) => {
  // "in study", "for study", "of study", "in task study"
  const parentMatch = text.match(/(?:in|for|of|from)\s+(?:task\s+)?([a-zA-Z0-9\s]+?)(?:\s+(?:task|as|$))/i);
  if (parentMatch) {
    return parentMatch[1].trim();
  }
  
  // Fallback: "study subtasks" or similar
  const fallback = text.match(/([a-zA-Z0-9\s]+?)\s+(?:subtasks?|steps?)/i);
  if (fallback) {
    return fallback[1].trim();
  }
  
  return null;
};

// ─── Normalize Input ────────────────────────────────────────────
const normalize = (text) => {
  let cleaned = text.toLowerCase().trim();
  
  // Remove filler words (only at the start or as standalone)
  for (const filler of FILLER_WORDS) {
    cleaned = cleaned.replace(new RegExp(`^${filler}\\s+`, 'i'), '');
  }
  
  return cleaned;
};

// ─── Main Intent Parser ─────────────────────────────────────────
export const parseVoiceCommand = (rawText, tasks = []) => {
  if (!rawText || rawText.trim().length === 0) {
    return { action: 'UNKNOWN', responseSpeech: "I didn't catch that, try again." };
  }
  
  const text = normalize(rawText);
  
  // ── Priority 1: CLEAR_ALL (must check before DELETE) ──
  for (const kw of ACTION_KEYWORDS.CLEAR_ALL) {
    if (text.includes(kw)) {
      return {
        action: 'CLEAR_ALL',
        responseSpeech: "Okay, clearing all tasks.",
      };
    }
  }
  
  // ── Priority 2: LIST_SUBTASKS (must check before LIST_TASKS) ──
  for (const kw of ACTION_KEYWORDS.LIST_SUBTASKS) {
    if (text.includes(kw)) {
      const parentName = extractParentTask(text);
      if (parentName) {
        const parent = tasks.find(t => t.title.toLowerCase().includes(parentName.toLowerCase()));
        if (parent && parent.subtasks && parent.subtasks.length > 0) {
          const names = parent.subtasks.map(s => s.title).join(', ');
          return {
            action: 'LIST_SUBTASKS',
            title: parent.title,
            responseSpeech: `Your subtasks for ${parent.title} are: ${names}.`,
          };
        } else if (parent) {
          return {
            action: 'LIST_SUBTASKS',
            title: parent.title,
            responseSpeech: `${parent.title} has no subtasks.`,
          };
        }
      }
      // Try extracting from end of text
      const words = text.split(/\s+/);
      const lastWord = words[words.length - 1];
      const guessParent = tasks.find(t => t.title.toLowerCase().includes(lastWord));
      if (guessParent && guessParent.subtasks && guessParent.subtasks.length > 0) {
        const names = guessParent.subtasks.map(s => s.title).join(', ');
        return {
          action: 'LIST_SUBTASKS',
          title: guessParent.title,
          responseSpeech: `Your subtasks for ${guessParent.title} are: ${names}.`,
        };
      }
      return {
        action: 'LIST_SUBTASKS',
        responseSpeech: "I couldn't find that task.",
      };
    }
  }
  
  // ── Priority 3: LIST_TASKS ──
  for (const kw of ACTION_KEYWORDS.LIST_TASKS) {
    if (text.includes(kw)) {
      const active = tasks.filter(t => !t.completed);
      if (active.length === 0) {
        return {
          action: 'LIST_TASKS',
          responseSpeech: "You have no active tasks. Your sanctuary is clear!",
        };
      }
      const names = active.slice(0, 5).map(t => t.title).join(', ');
      const extra = active.length > 5 ? `, and ${active.length - 5} more` : '';
      return {
        action: 'LIST_TASKS',
        responseSpeech: `You have ${active.length} active tasks: ${names}${extra}.`,
      };
    }
  }
  
  // ── Priority 4: CHANGE_THEME ──
  for (const kw of ACTION_KEYWORDS.CHANGE_THEME) {
    if (text.includes(kw)) {
      const theme = extractTheme(text);
      return {
        action: 'CHANGE_THEME',
        theme,
        responseSpeech: `Switching to ${theme} mode.`,
      };
    }
  }
  
  // ── Priority 5: NAVIGATE ──
  for (const kw of ACTION_KEYWORDS.NAVIGATE) {
    if (text.includes(kw)) {
      const screen = extractScreen(text);
      return {
        action: 'NAVIGATE',
        screen,
        responseSpeech: `Opening ${screen}.`,
      };
    }
  }
  
  // ── Priority 6: SEARCH ──
  for (const kw of ACTION_KEYWORDS.SEARCH) {
    if (text.includes(kw)) {
      let query = text;
      // Remove the keyword
      query = query.replace(new RegExp(`${kw}\\s*(?:for)?\\s*`, 'i'), '').trim();
      return {
        action: 'SEARCH',
        query: query || text,
        responseSpeech: `Searching for ${query || text}.`,
      };
    }
  }
  
  // ── Priority 7: SET_ALARM ──
  for (const kw of ACTION_KEYWORDS.SET_ALARM) {
    if (text.includes(kw)) {
      const dueDate = parseTime(text);
      // Extract the task name this alarm is for
      let taskTitle = text;
      taskTitle = taskTitle.replace(new RegExp(`${kw}\\s*(?:for)?\\s*`, 'i'), '');
      taskTitle = taskTitle.replace(/at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '');
      taskTitle = taskTitle.replace(/in\s+\d+\s*(?:hour|hours|minute|minutes|min|mins)/gi, '');
      taskTitle = taskTitle.replace(/\b(?:today|tomorrow)\b/gi, '');
      taskTitle = taskTitle.replace(/\s+/g, ' ').trim();
      taskTitle = taskTitle.replace(/^(?:the|a|an|to|for|in|my)\s+/i, '');
      
      if (dueDate && taskTitle) {
        return {
          action: 'UPDATE_TASK',
          title: taskTitle,
          dueDate,
          subtasks: [],
          responseSpeech: `Setting alarm for ${taskTitle}.`,
        };
      } else if (dueDate) {
        return {
          action: 'UNKNOWN',
          responseSpeech: "Which task should I set the alarm for?",
        };
      }
    }
  }
  
  // ── Priority 8: ADD_SUBTASKS ──
  for (const kw of ACTION_KEYWORDS.ADD_SUBTASKS) {
    if (text.includes(kw)) {
      const subs = extractSubtasks(text);
      let taskTitle = text.substring(0, text.indexOf(kw)).trim();
      taskTitle = taskTitle.replace(/^(?:add|create|to|for|in|my)\s+/i, '');
      
      // Try to find the parent task
      if (!taskTitle) {
        const parentName = extractParentTask(text);
        if (parentName) taskTitle = parentName;
      }
      
      return {
        action: 'UPDATE_TASK',
        title: taskTitle || '',
        subtasks: subs,
        dueDate: null,
        responseSpeech: subs.length > 0 
          ? `Adding ${subs.length} steps to ${taskTitle || 'your task'}.`
          : "What steps would you like to add?",
      };
    }
  }
  
  // ── Priority 9: DELETE_TASK ──
  let matchedDeleteVerb = null;
  for (const kw of ACTION_KEYWORDS.DELETE_TASK) {
    if (text.includes(kw)) {
      matchedDeleteVerb = kw;
      break;
    }
  }
  if (matchedDeleteVerb) {
    const title = extractTitle(text, matchedDeleteVerb);
    return {
      action: 'DELETE_TASK',
      title,
      responseSpeech: title ? `Deleting ${title}.` : "Which task should I delete?",
    };
  }
  
  // ── Priority 10: TOGGLE_TASK ──
  let matchedToggleVerb = null;
  for (const kw of ACTION_KEYWORDS.TOGGLE_TASK) {
    if (text.includes(kw)) {
      matchedToggleVerb = kw;
      break;
    }
  }
  if (matchedToggleVerb) {
    // Check for subtask toggle: "mark do coding as done in study"
    const parentName = extractParentTask(text);
    if (parentName) {
      const parent = tasks.find(t => t.title.toLowerCase().includes(parentName.toLowerCase()));
      if (parent) {
        // Extract subtask names from the text
        let subPart = text;
        subPart = subPart.replace(new RegExp(`${matchedToggleVerb}\\s*`, 'i'), '');
        subPart = subPart.replace(/(?:in|for|of|from)\s+(?:task\s+)?[a-zA-Z0-9\s]+$/i, '');
        subPart = subPart.replace(/\s+as\s+(?:done|complete|completed|finished)/gi, '');
        
        const subNames = subPart.split(/\s*(?:,|and)\s*/).map(s => s.trim()).filter(s => s.length > 0);
        
        if (subNames.length > 0) {
          return {
            action: 'TOGGLE_TASK',
            title: parent.title,
            subtasks: subNames,
            responseSpeech: `Marking ${subNames.join(' and ')} as done in ${parent.title}.`,
          };
        }
      }
    }
    
    // Regular task toggle
    const title = extractTitle(text, matchedToggleVerb);
    return {
      action: 'TOGGLE_TASK',
      title,
      subtasks: [],
      responseSpeech: title ? `Marking ${title} as done.` : "Which task should I complete?",
    };
  }
  
  // ── Priority 11: ADD_TASK ──
  let matchedAddVerb = null;
  for (const kw of ACTION_KEYWORDS.ADD_TASK) {
    if (text.includes(kw)) {
      matchedAddVerb = kw;
      break;
    }
  }
  if (matchedAddVerb) {
    const title = extractTitle(text, matchedAddVerb);
    const project = extractProject(text);
    const dueDate = parseTime(text);
    const subtasks = extractSubtasks(text);
    
    return {
      action: 'ADD_TASK',
      title: title || rawText,
      project,
      dueDate,
      subtasks,
      responseSpeech: title 
        ? `Adding ${title} to ${project}.`
        : "What task would you like to add?",
    };
  }
  
  // ── Fallback: Try to detect intent from task names ──
  // If the user just says a task name, try to toggle it
  const matchedTask = tasks.find(t => text.includes(t.title.toLowerCase()));
  if (matchedTask) {
    return {
      action: 'TOGGLE_TASK',
      title: matchedTask.title,
      subtasks: [],
      responseSpeech: `Marking ${matchedTask.title} as done.`,
    };
  }
  
  // ── Ultimate Fallback ──
  return {
    action: 'UNKNOWN',
    responseSpeech: "I didn't understand that. Try saying add, complete, delete, or search.",
  };
};

// Keep backward compatibility with old import
export const parseTaskCommand = (text) => {
  const result = {
    title: text,
    project: 'Inbox',
    dueDate: null,
    subtasks: []
  };

  // Extract Project (#work)
  const projectMatch = text.match(/#(\w+)/);
  if (projectMatch) {
    result.project = projectMatch[1].charAt(0).toUpperCase() + projectMatch[1].slice(1);
    result.title = result.title.replace(projectMatch[0], '').trim();
  }

  // Extract Due Dates (today, tomorrow)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  if (text.toLowerCase().includes('today')) {
    result.dueDate = today;
    result.title = result.title.replace(/today/i, '').trim();
  } else if (text.toLowerCase().includes('tomorrow')) {
    result.dueDate = tomorrow;
    result.title = result.title.replace(/tomorrow/i, '').trim();
  }

  return result;
};
