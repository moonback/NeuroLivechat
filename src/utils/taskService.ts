/**
 * Task Service
 * Manages a simple productivity to-do list in LocalStorage.
 */

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'neuro_live_tasks';

export const taskService = {
  /**
   * Add a new task
   */
  add(text: string): Task {
    const tasks = this.getAll();
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      completed: false,
      timestamp: Date.now()
    };
    tasks.push(newTask);
    this.saveAll(tasks);
    return newTask;
  },

  /**
   * List all tasks
   */
  getAll(): Task[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  },

  /**
   * Remove a task by ID or text similarity
   */
  remove(idOrText: string): boolean {
    let tasks = this.getAll();
    const initialLength = tasks.length;
    
    // Exact ID match first
    tasks = tasks.filter(t => t.id !== idOrText && !t.text.toLowerCase().includes(idOrText.toLowerCase()));
    
    if (tasks.length !== initialLength) {
      this.saveAll(tasks);
      return true;
    }
    return false;
  },

  /**
   * Save all tasks
   */
  saveAll(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  /**
   * Count pending tasks
   */
  getPendingCount(): number {
    return this.getAll().filter(t => !t.completed).length;
  }
};
