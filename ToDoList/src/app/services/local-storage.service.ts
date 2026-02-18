import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Task } from '../models/task.model';
import { Category } from '../models/category.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private _storage: Storage | null = null;

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(private storage: Storage) {}

  async init() {
    this._storage = await this.storage.create();
    await this.loadTasks();
    await this.loadCategories();
  }

  // -------------------------------
  // MARK: - Gestion de TASKS
  // -------------------------------
  async loadTasks() {
    const tasks = await this._storage?.get('tasks');
    this.tasksSubject.next(tasks || []);
  }

  async getTasks(): Promise<Task[]> {
    return (await this._storage?.get('tasks')) || [];
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    await this._storage?.set('tasks', tasks);
    this.tasksSubject.next(tasks);
  }

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this.saveTasks(tasks);
  }

  async updateTask(updatedTask: Task): Promise<void> {
    let tasks = await this.getTasks();
    tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    await this.saveTasks(tasks);
  }

  async deleteTask(taskId: string): Promise<void> {
    let tasks = await this.getTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    await this.saveTasks(tasks);
  }

  // -------------------------------
  // MARK: - Gestion de Categories
  // -------------------------------
  async loadCategories() {
    const categories = await this._storage?.get('categories');
    this.categoriesSubject.next(categories || []);
  }

  async getCategories(): Promise<Category[]> {
    return (await this._storage?.get('categories')) || [];
  }

  private async saveCategories(categories: Category[]): Promise<void> {
    await this._storage?.set('categories', categories);
    this.categoriesSubject.next(categories);
  }

  async addCategory(category: Category): Promise<void> {
    const categories = await this.getCategories();
    categories.push(category);
    await this.saveCategories(categories);
  }

  async updateCategory(updatedCategory: Category): Promise<void> {
    let categories = await this.getCategories();
    categories = categories.map(c => c.id === updatedCategory.id ? updatedCategory : c);
    await this.saveCategories(categories);
  }

  async deleteCategory(categoryId: number): Promise<void> {
    let categories = await this.getCategories();
    categories = categories.filter(c => c.id !== categoryId);
    await this.saveCategories(categories);
  }
}
