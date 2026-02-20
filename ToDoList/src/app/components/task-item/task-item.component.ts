import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonButton, IonCheckbox } from '@ionic/angular/standalone';
import { Task } from '@models/task.model';
import { Category } from '@models/category.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonItem, 
    IonLabel, 
    IonButton, 
    IonCheckbox
  ]
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() categories: Category[] | null = [];

  @Output() toggle = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<Task>();

  getCategoryNames(): string {
    if (!this.task?.categoryId || !this.categories) return '';
    return this.categories
      .filter(c => this.task.categoryId?.includes(c.id))
      .map(c => c.name)
      .join(', ');
  }

  onToggle() {
    this.toggle.emit(this.task);
  }

  onDelete() {
    this.delete.emit(this.task.id);
  }
  
  updateCategories() {
    this.categoryChange.emit(this.task);
  }
}
