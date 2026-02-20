import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Task } from '@models/task.model';
import { Category } from '@models/category.model';
import { BehaviorSubject, from, Observable, forkJoin } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private _storage!: Storage;

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  readonly tasks$ = this.tasksSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  readonly categories$ = this.categoriesSubject.asObservable();

  constructor(private storage: Storage) {}

  // -------------------------------
  // INIT
  // -------------------------------

  init(): Observable<Storage> {
    return from(this.storage.create()).pipe(
      tap(storage => this._storage = storage),
      tap(() => this.loadInitialData())
    );
  }

  private loadInitialData(): void {
    forkJoin([
      this.loadTasks(),
      this.loadCategories()
    ]).subscribe();
  }

  // -------------------------------
  // MARK: - TASKS
  // -------------------------------

  private loadTasks(): Observable<Task[]> {
    return from(this._storage.get('tasks')).pipe(
      map(tasks => tasks || []),
      tap(tasks => this.tasksSubject.next(tasks))
    );
  }

  private saveTasks(tasks: Task[]): Observable<void> {
    return from(this._storage.set('tasks', tasks)).pipe(
      tap(() => this.tasksSubject.next(tasks))
    );
  }

  addTask(task: Task): Observable<void> {
    const updated = [...this.tasksSubject.getValue(), task];
    return this.saveTasks(updated);
  }

  updateTask(updatedTask: Task): Observable<void> {
    const updated = this.tasksSubject.getValue().map(t =>
      t.id === updatedTask.id ? updatedTask : t
    );
    return this.saveTasks(updated);
  }

  deleteTask(taskId: string): Observable<void> {
    const updated = this.tasksSubject.getValue()
      .filter(t => t.id !== taskId);
    return this.saveTasks(updated);
  }

  removeCategoryFromTasks(categoryId: number): Observable<void> {
    const updatedTasks = this.tasksSubject.getValue().map(task => {
      if (task.categoryId?.includes(categoryId)) {
        return {
          ...task,
          categoryId: task.categoryId.filter(c => c !== categoryId),
          updatedAt: new Date()
        };
      }
      return task;
    });

    return this.saveTasks(updatedTasks);
  }

  // -------------------------------
  // MARK: - CATEGORIES
  // -------------------------------
  getCurrentCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  private loadCategories(): Observable<Category[]> {
    return from(this._storage.get('categories')).pipe(
      map(categories => categories || []),
      tap(categories => this.categoriesSubject.next(categories))
    );
  }

  private saveCategories(categories: Category[]): Observable<void> {
    return from(this._storage.set('categories', categories)).pipe(
      tap(() => this.categoriesSubject.next(categories))
    );
  }

  addCategory(category: Category): Observable<void> {
    const updated = [...this.categoriesSubject.getValue(), category];
    return this.saveCategories(updated);
  }

  updateCategory(updatedCategory: Category): Observable<void> {
    const updated = this.categoriesSubject.getValue().map(c =>
      c.id === updatedCategory.id ? updatedCategory : c
    );
    return this.saveCategories(updated);
  }

  deleteCategory(categoryId: number): Observable<void> {
    const updated = this.categoriesSubject.getValue()
      .filter(c => c.id !== categoryId);

    return this.saveCategories(updated);
  }
}
