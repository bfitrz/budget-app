import { create } from 'zustand';

export interface StickyNote {
  id: string;
  text: string;
  color: string;
  done: boolean;
  createdAt: string;
}

interface NotesState {
  notes: StickyNote[];
  addNote: () => void;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  toggleDone: (id: string) => void;
  reorderNotes: (fromIndex: number, toIndex: number) => void;
}

const STORAGE_KEY = 'budget-app-notes';
const NOTE_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa'];

function loadNotes(): StickyNote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: StickyNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Error saving notes:', e);
  }
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: loadNotes(),

  addNote: () => {
    const notes = [
      ...get().notes,
      {
        id: crypto.randomUUID(),
        text: '',
        color: NOTE_COLORS[get().notes.length % NOTE_COLORS.length],
        done: false,
        createdAt: new Date().toISOString(),
      },
    ];
    saveNotes(notes);
    set({ notes });
  },

  updateNote: (id, updates) => {
    const notes = get().notes.map((n) => (n.id === id ? { ...n, ...updates } : n));
    saveNotes(notes);
    set({ notes });
  },

  deleteNote: (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    saveNotes(notes);
    set({ notes });
  },

  toggleDone: (id) => {
    const notes = get().notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n));
    saveNotes(notes);
    set({ notes });
  },

  reorderNotes: (fromIndex, toIndex) => {
    const notes = [...get().notes];
    const [moved] = notes.splice(fromIndex, 1);
    notes.splice(toIndex, 0, moved);
    saveNotes(notes);
    set({ notes });
  },
}));

export { NOTE_COLORS };
