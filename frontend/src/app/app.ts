import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from './task';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  tasks: Task[] = [];

  // form fields for adding a new task
  newTitle = '';
  newDescription = '';
  newDueDate = '';
  newPriority: 'Low' | 'Medium' | 'High' = 'Medium';

  // filter state
  statusFilter = 'All';
  priorityFilter = 'All';

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks(this.statusFilter, this.priorityFilter).subscribe({
      next: (data) => (this.tasks = data),
      error: (err) => console.error('Failed to load tasks', err)
    });
  }

  onFilterChange() {
    this.loadTasks();
  }

  addTask() {
    if (!this.newTitle.trim()) {
      alert('Title is required');
      return;
    }

    const task: Task = {
      title: this.newTitle.trim(),
      description: this.newDescription.trim() || undefined,
      due_date: this.newDueDate || null,
      priority: this.newPriority
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        this.newTitle = '';
        this.newDescription = '';
        this.newDueDate = '';
        this.newPriority = 'Medium';
        this.loadTasks();
      },
      error: (err) => console.error('Failed to create task', err)
    });
  }

  toggleDone(task: Task) {
    const updated: Task = { ...task, is_done: !task.is_done };
    this.taskService.updateTask(task.id!, updated).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Failed to update task', err)
    });
  }

  deleteTask(task: Task) {
    const confirmed = confirm(`Delete task "${task.title}"? This cannot be undone.`);
    if (!confirmed) return;

    this.taskService.deleteTask(task.id!).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Failed to delete task', err)
    });
  }

  get pendingCount(): number {
    return this.tasks.filter((t) => !t.is_done).length;
  }

  get doneCount(): number {
    return this.tasks.filter((t) => t.is_done).length;
  }
}