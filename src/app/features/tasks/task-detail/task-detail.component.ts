import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TaskService, Task } from '../task.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>{{ isNew ? 'New Task' : 'Edit Task' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <label>Title <input formControlName="title" /></label>
      <label>
        <input type="checkbox" formControlName="completed" /> Completed
      </label>
      <div style="margin-top:8px;">
        <button type="submit">Save</button>
        <button type="button" (click)="delete()" *ngIf="!isNew">Delete</button>
      </div>
    </form>
  `,
  styles: ``
})
export class TaskDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private svc = inject(TaskService);

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
    this.svc.remove(this.id).subscribe(() => this.router.navigate(['/tasks']));
  }
}
