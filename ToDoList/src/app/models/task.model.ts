export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId?: number[];
  createdAt: Date;
  updatedAt?: Date;
}
