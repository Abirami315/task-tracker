import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  due_date?: string | null;
  priority: 'Low' | 'Medium' | 'High';
  is_done?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks(status?: string, priority?: string): Observable<Task[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (status && status !== 'All') params.push(`status=${status.toLowerCase()}`);
    if (priority && priority !== 'All') params.push(`priority=${priority}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<Task[]>(url);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}