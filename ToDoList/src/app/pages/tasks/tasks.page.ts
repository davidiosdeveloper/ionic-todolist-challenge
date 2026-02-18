import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { IonList, IonItem, IonIcon, IonLabel, IonCheckbox, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButtons, IonModal } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { LocalStorageService } from '../../services/local-storage.service';
import { Category } from 'src/app/models/category.model';
import { AlertController } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonList, 
    IonItem, 
    IonIcon,
    IonInput,
    IonLabel, 
    IonCheckbox,
    IonButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons,
    IonModal,
    CommonModule, 
    FormsModule, 
    TaskItemComponent,
    ScrollingModule,
  ]
})
export class TasksPage implements OnInit {
  tasks$ = this.localStorage.tasks$;
  categories$ = this.localStorage.categories$;

  selectedTask: Task | null = null;
  newTaskTitle: string = '';
  showCategoryModal = false;
  newCategoryTitle: string = '';

  showFilterModal = false;
  filterPending = false;
  selectedCategories: number[] = [];

  enableCategories$ = from(
    this.featureFlagService.isFeatureEnabled('enableCategories')
  );

  constructor(
    private localStorage: LocalStorageService,
    private alertController: AlertController,
    private featureFlagService: FeatureFlagService,
  ) {}

  async ngOnInit() {
    await this.localStorage.init();
  }

  async addTask(title: string) {
    if (!title || title.trim() === '') return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      categoryId: [],
      createdAt: new Date()
    };

    await this.localStorage.addTask(newTask);
    this.newTaskTitle = '';
  }

  async deleteTask(taskId: string) {
    await this.localStorage.deleteTask(taskId);
  }

  async toggleTask(task: Task) {
    task.completed = !task.completed;
    await this.localStorage.updateTask(task);
  }

  // -------------------------------
  // MARK: - Gestion de Categories
  // -------------------------------
  async updateCategories(updatedTask: Task) {
    await this.localStorage.updateTask(updatedTask);
  }

  async addCategory(categoryName: string) {
    const categories = await this.localStorage.getCategories();
    const lastId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) : 0;
    const newCategory: Category = {
      id: lastId + 1,
      name: categoryName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.localStorage.addCategory(newCategory);
    this.newCategoryTitle = '';
  }

  openCategoryModal(task: Task) { 
    this.selectedTask = task; 
    this.showCategoryModal = true; 
  }

  async toggleCategory(categoryId: number) { 
    if (!this.selectedTask) return; 
    if (!this.selectedTask.categoryId) this.selectedTask.categoryId = [];

    if (this.selectedTask.categoryId.includes(categoryId)) { // Delete category
      this.selectedTask.categoryId = this.selectedTask.categoryId.filter(c => c !== categoryId); 
    } else { // add category
      this.selectedTask.categoryId.push(categoryId); 
    } 

    await this.localStorage.updateTask(this.selectedTask);
  }
  
  async confirmDeleteCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Eliminar categoría',
      message: `¿Seguro que deseas eliminar la categoría "${category.name}"? 
                Todas las tareas que la tengan asignada serán afectadas.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteCategory(category)
        }
      ]
    });

    await alert.present();
  }

    async deleteCategory(category: Category) {
    await this.localStorage.deleteCategory(category.id);

    let tasks = await this.localStorage.getTasks();
    tasks = tasks.map(task => {
      if (task.categoryId?.includes(category.id)) {
        task.categoryId = task.categoryId.filter(c => c !== category.id);
      }
      return task;
    });

    for (const task of tasks) {
      await this.localStorage.updateTask(task);
    }
  }
  
  closeCategoryModal() { 
    this.showCategoryModal = false; 
    this.selectedTask = null; 
  }

  // -------------------------------
  // MARK: - Filtro
  // -------------------------------
  openFilterModal() {
    this.showFilterModal = true;
  }

  closeFilterModal() {
    this.showFilterModal = false;
  }

  togglePendingFilter() {
    this.filterPending = !this.filterPending;
    this.applyFilters();
  }

  toggleCategoryFilter(categoryId: number) {
    if (this.selectedCategories.includes(categoryId)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== categoryId);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.applyFilters();
  }

  async applyFilters() {
    let allTasks = await this.localStorage.getTasks();

    if (this.filterPending) {
      allTasks = allTasks.filter(t => !t.completed);
    }

    if (this.selectedCategories.length > 0) {
      allTasks = allTasks.filter(t => 
        t.categoryId?.some(c => this.selectedCategories.includes(c))
      );
    }
    this.localStorage['tasksSubject'].next(allTasks);
  }

}









