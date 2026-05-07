import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { nanoid } from 'nanoid/non-secure';

const TaskContext = createContext();
const TASKS_FILE = `${FileSystem.documentDirectory}zenist_ultra_v4.json`;

export const useTasks = () => useContext(TaskContext);

const initialState = {
  tasks: [],
  projects: [
    { id: 'inbox', name: 'Inbox', color: '#3498db', icon: 'Inbox' },
    { id: 'work', name: 'Work', color: '#efb02e', icon: 'Briefcase' },
    { id: 'personal', name: 'Personal', color: '#e74c3c', icon: 'User' },
  ],
  history: [],
  loading: true,
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, tasks: action.payload.tasks || [], history: action.payload.history || [], loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t)
      };
    case 'TOGGLE_TASK':
      const isCompleting = !state.tasks.find(t => t.id === action.payload)?.completed;
      let newHistory = [...state.history];
      if (isCompleting) {
        const today = new Date().toISOString().split('T')[0];
        const historyIdx = newHistory.findIndex(h => h.date === today);
        if (historyIdx > -1) newHistory[historyIdx].count += 1;
        else newHistory.push({ date: today, count: 1 });
      }
      return {
        ...state,
        history: newHistory,
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t)
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'CLEAR_TASKS':
      return { ...state, tasks: [] };
    default:
      return state;
  }
}

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(TASKS_FILE);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(TASKS_FILE);
          dispatch({ type: 'SET_DATA', payload: JSON.parse(content) });
        } else {
          dispatch({ type: 'SET_DATA', payload: { tasks: [] } });
        }
      } catch (e) {
        dispatch({ type: 'SET_DATA', payload: { tasks: [] } });
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      FileSystem.writeAsStringAsync(TASKS_FILE, JSON.stringify({ tasks: state.tasks, history: state.history }));
    }
  }, [state.tasks, state.history, state.loading]);

  return (
    <TaskContext.Provider value={{ 
      ...state,
      addTask: (t) => {
        const newTask = { 
          id: nanoid(), 
          completed: false, 
          subtasks: [],
          project: 'Inbox',
          createdAt: new Date().toISOString(),
          ...t 
        };
        dispatch({ type: 'ADD_TASK', payload: newTask });
      },
      updateTask: (id, updates) => {
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
      },
      toggleTask: (id) => dispatch({ type: 'TOGGLE_TASK', payload: id }),
      deleteTask: (id) => dispatch({ type: 'DELETE_TASK', payload: id }),
      clearTasks: () => dispatch({ type: 'CLEAR_TASKS' }),
    }}>
      {children}
    </TaskContext.Provider>
  );
};
