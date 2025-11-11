import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private http = inject(HttpClient);
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/todos';
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();
  private nextId = 10001; // local IDs for created items

  constructor() {
    // initial load
    this.http.get<Task[]>(this.baseUrl).subscribe(tasks => {
      // keep it small and deterministic
      const initial = tasks.slice(0, 20);
      this.tasksSubject.next(initial);
    });
  }

  list(): Observable<Task[]> {
    return this.tasks$;
  }

  get(id: number): Observable<Task> {
    const current = this.tasksSubject.value;
    const found = current.find(t => t.id === id);
    if (found) return of(found);
    // fallback to API read
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(task: Partial<Task>): Observable<Task> {
    // optimistic local create
    const newTask: Task = {
      id: this.nextId++,
      title: task.title ?? '',
      completed: task.completed ?? false,
      userId: task.userId,
    };
    this.tasksSubject.next([newTask, ...this.tasksSubject.value]);
    // call API but ignore persistence result (JSONPlaceholder won't save)
    return this.http.post<Task>(this.baseUrl, newTask).pipe(map(() => newTask));
  }

  update(id: number, task: Partial<Task>): Observable<Task> {
    const updatedList = this.tasksSubject.value.map(t =>
      t.id === id ? { ...t, ...task } as Task : t
    );
    const updated = updatedList.find(t => t.id === id)!;
    this.tasksSubject.next(updatedList);
    return this.http.put<Task>(`${this.baseUrl}/${id}`, updated).pipe(map(() => updated));
  }

  remove(id: number): Observable<unknown> {
    this.tasksSubject.next(this.tasksSubject.value.filter(t => t.id !== id));
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(tap(() => {}));
  }
}

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  userId?: number;
};
