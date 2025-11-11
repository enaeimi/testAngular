import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TaskService, Task } from '../task.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="header">
      <button type="button" class="link" (click)="back()">&larr; Back</button>
      <h2>{{ isNew ? 'New Task' : 'Edit Task' }}</h2>
    </div>
    <form [formGroup]="form" (ngSubmit)="save()">
      <label>Title <input formControlName="title" /></label>
      <label>
        <input type="checkbox" formControlName="completed" /> Completed
      </label>
      <div class="actions">
        <button type="submit">Save</button>
        <button type="button" (click)="cancel()">Cancel</button>
        <button type="button" (click)="delete()" *ngIf="!isNew">Delete</button>
      </div>
    </form>
  `,
  styles: `
    .header { display:flex; align-items:center; gap:12px; }
    .link { background:none; border:none; color:#1976d2; cursor:pointer; padding:0; }
    form { display:flex; flex-direction:column; gap:10px; max-width:420px; }
    input[type="text"], input:not([type]) { padding:6px 8px; border:1px solid #ccc; border-radius:4px; }
    .actions { margin-top:8px; display:flex; gap:8px; }
    .actions button { padding:6px 10px; }
  `
})
export class TaskDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private svc = inject(TaskService);
  private location = inject(Location);

  isNew = true;
  id = 0;
  form = this.fb.nonNullable.group({ title: '', completed: false });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.id = Number(params.get('id'));
        this.isNew = this.id === 0;
        return this.isNew ? of<Task>({ id: 0, title: '', completed: false }) : this.svc.get(this.id);
      })
    ).subscribe(task => this.form.patchValue({ title: task.title, completed: task.completed }));
  }

  save(): void {
    const value = this.form.getRawValue();
    const req = this.isNew ? this.svc.create(value) : this.svc.update(this.id, value);
    req.subscribe(() => this.router.navigate(['/tasks']));
  }

  delete(): void {
    if (this.isNew) return;
    if (confirm('Delete this task? This cannot be undone.')) {
      this.svc.remove(this.id).subscribe(() => this.router.navigate(['/tasks']));
    }
  }

  back(): void {
    this.location.back();
  }

  cancel(): void {
    this.location.back();
  }
}
