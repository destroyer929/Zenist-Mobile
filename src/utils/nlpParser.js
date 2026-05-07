/**
 * Zenist NLP Parser v3 (Minimalist)
 * Extracts: 
 * - Projects: #work
 * - Due Dates: today, tomorrow
 */

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
