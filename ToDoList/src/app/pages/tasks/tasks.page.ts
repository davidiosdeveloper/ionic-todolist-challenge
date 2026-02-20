import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '@models/task.model';
import { IonList, IonItem, IonIcon, IonLabel, IonCheckbox, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButtons, IonModal } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TaskItemComponent } from '@components/task-item/task-item.component';
import { LocalStorageService } from '@services/local-storage.service';
import { Category } from '@models/category.model';
import { AlertController } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FeatureFlagService } from '@services/feature-flag.service';
import { BehaviorSubject, from, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

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
  newCategoryTitle: string = '';
  showCategoryModal = false;
  showFilterModal = false;

  private filterPendingSubject = new BehaviorSubject<boolean>(false);
  private selectedCategoriesSubject = new BehaviorSubject<number[]>([]);

  filteredTasks$ = combineLatest([
    this.localStorage.tasks$,
    this.filterPendingSubject,
    this.selectedCategoriesSubject
  ]).pipe(
    map(([tasks, filterPending, selectedCategories]) => {

      let filtered = tasks;

      if (filterPending) {
        filtered = filtered.filter(t => !t.completed);
      }

      if (selectedCategories.length > 0) {
        filtered = filtered.filter(t =>
          t.categoryId?.some(c =>
            selectedCategories.includes(c)
          )
        );
      }

      return filtered;
    })
  );

  enableCategories$ = from(
    this.featureFlagService.isFeatureEnabled('enableCategories')
  );

  constructor(
    private localStorage: LocalStorageService,
    private alertController: AlertController,
    private featureFlagService: FeatureFlagService,
  ) {}

  ngOnInit() {
    this.localStorage.init().subscribe();
  }

  addTask(title: string) {
    if (!title?.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      categoryId: [],
      createdAt: new Date()
    };

    this.localStorage.addTask(newTask).subscribe();
    this.newTaskTitle = '';
  }

  deleteTask(taskId: string) {
    this.localStorage.deleteTask(taskId).subscribe();
  }

  toggleTask(task: Task) {
    const updated = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date()
    };
    this.localStorage.updateTask(updated).subscribe();
  }

  // -------------------------------
  // MARK: - Gestion de Categories
  // -------------------------------
  updateCategories(updatedTask: Task) {
    this.localStorage.updateTask(updatedTask).subscribe();
  }

  openCategoryModal(task: Task) { 
    this.selectedTask = task; 
    this.showCategoryModal = true; 
  }

  addCategory(categoryName: string) {
    const categories = this.localStorage.getCurrentCategories();

    const lastId =
      categories.length > 0
        ? Math.max(...categories.map(c => c.id))
        : 0;

    const newCategory: Category = {
      id: lastId + 1,
      name: categoryName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.localStorage.addCategory(newCategory).subscribe();
    this.newCategoryTitle = '';
  }

  toggleCategory(categoryId: number) {
    if (!this.selectedTask) return;

    const currentCategories = this.selectedTask.categoryId || [];

    const updatedCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(c => c !== categoryId)
      : [...currentCategories, categoryId];

    const updatedTask: Task = {
      ...this.selectedTask,
      categoryId: updatedCategories,
      updatedAt: new Date()
    };

    this.localStorage.updateTask(updatedTask).subscribe();
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

  deleteCategory(category: Category) {
    this.localStorage.deleteCategory(category.id).subscribe();
    this.localStorage.removeCategoryFromTasks(category.id).subscribe();
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
    this.filterPendingSubject.next(!this.filterPendingSubject.value);
  }

  toggleCategoryFilter(categoryId: number) {
    const current = this.selectedCategoriesSubject.value;

    const updated = current.includes(categoryId)
      ? current.filter(c => c !== categoryId)
      : [...current, categoryId];

    this.selectedCategoriesSubject.next(updated);
  }

  get filterPending(): boolean {
    return this.filterPendingSubject.value;
  }

  get selectedCategories(): number[] {
    return this.selectedCategoriesSubject.value;
  }
}
