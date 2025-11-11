import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService, Task } from '../task.service';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="header">
      <h2>Tasks</h2>
      <a class="btn" routerLink="/tasks/0">+ New Task</a>
    </div>

    <div class="toolbar">
      <input [formControl]="q" placeholder="Search tasks..." />
      <label class="chk">
        <input type="checkbox" [formControl]="onlyIncomplete" />
        Show only incomplete
      </label>
    </div>

    <ul class="list">
      <li class="item" *ngFor="let t of filtered$ | async">
        <a [routerLink]="['/tasks', t.id]">
          <span class="title">{{ t.title }}</span>
          <span class="badge" [class.done]="t.completed">{{ t.completed ? 'Done' : 'Open' }}</span>
        </a>
      </li>
    </ul>
  `,
  styles: `
    .header { display: flex; align-items: center; justify-content: space-between; }
    .btn { padding: 6px 10px; background:#1976d2; color:#fff; border-radius:4px; text-decoration:none; }
    .toolbar { margin: 10px 0; display:flex; gap:12px; align-items:center; }
    .toolbar input { padding:6px 8px; border:1px solid #ccc; border-radius:4px; width: 260px; }
    .chk { display:flex; align-items:center; gap:6px; color:#444; }
    .list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px; }
    .item a { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border:1px solid #eee; border-radius:6px; text-decoration:none; color:inherit; background:#fafafa; }
    .item a:hover { background:#f2f7ff; border-color:#cfe3ff; }
    .badge { font-size:12px; padding:2px 8px; border-radius:999px; background:#ffe6e6; color:#a33; }
    .badge.done { background:#e8f5e9; color:#2e7d32; }
  `
})
export class TaskListComponent {

  private svc = inject(TaskService);
  private tasks$: Observable<Task[]> = this.svc.list();

  q = new FormControl('', { nonNullable: true });
  onlyIncomplete = new FormControl(false, { nonNullable: true });

  filtered$: Observable<Task[]> = combineLatest([
    this.tasks$,
    this.q.valueChanges.pipe(startWith(this.q.value)),
    this.onlyIncomplete.valueChanges.pipe(startWith(this.onlyIncomplete.value))
  ]).pipe(
    map(([tasks, q, onlyIncomplete]) => {
      const term = q.trim().toLowerCase();
      return tasks.filter(t => {
        const match = !term || t.title.toLowerCase().includes(term);
        const status = !onlyIncomplete || !t.completed;
        return match && status;
      });
    })
  );
}
