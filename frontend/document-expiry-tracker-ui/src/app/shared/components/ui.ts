import { Component, Injectable, inject, input } from '@angular/core';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-icon',
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="paths[name()] || paths['document']" />
  </svg>`,
  styles: [
    `
      :host {
        display: inline-flex;
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }
      svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class Icon {
  name = input('document');
  paths: Record<string, string> = {
    dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    document: 'M14 2H5v20h14V7z M14 2v6h5 M8 12h8 M8 16h6',
    categories: 'M3 4h7l2 3h9v14H3z',
    reminders: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
    profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 22v-3a8 8 0 0 1 16 0v3',
    settings:
      'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M10 2h4l1 3 3 1 3 3-2 3 2 3-3 3-3 1-1 3h-4l-1-3-3-1-3-3 2-3-2-3 3-3 3-1z',
    logout: 'M10 3H3v18h7 M8 12h13 M17 8l4 4-4 4',
    plus: 'M12 5v14 M5 12h14',
    search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6',
    menu: 'M3 6h18 M3 12h18 M3 18h18',
    arrow: 'M4 12h16 M14 6l6 6-6 6',
    check: 'M5 12l4 4L19 6',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2',
    warning: 'M12 3 2 21h20z M12 9v5 M12 17v1',
    shield: 'M12 2 3 6v7c0 5 9 9 9 9s9-4 9-9V6z M8 12l3 3 5-6',
    close: 'M6 6l12 12 M6 18 18 6',
    upload: 'M12 16V3 M7 8l5-5 5 5 M3 15v6h18v-6',
    calendar: 'M4 5h16v16H4z M8 2v6 M16 2v6 M4 11h16',
    edit: 'm4 16-1 5 5-1L21 7l-4-4z M14 6l4 4',
    trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  };
}
@Component({
  selector: 'app-page-header',
  template: `<div class="page-heading">
    <div>
      <div class="eyebrow">{{ eyebrow() }}</div>
      <h1>{{ title() }}</h1>
      <p>{{ subtitle() }}</p>
    </div>
    <div class="page-actions"><ng-content /></div>
  </div>`,
})
export class PageHeader {
  title = input.required<string>();
  subtitle = input('');
  eyebrow = input('YOUR PERSONAL DOCUMENT SPACE');
}
@Component({
  selector: 'app-status',
  template: `<span
    class="badge"
    [class.active]="status() === 'Active'"
    [class.expiring]="status() === 'Expiring Soon'"
    [class.expired]="status() === 'Expired'"
    ><span class="dot"></span>{{ status() }}</span
  >`,
})
export class StatusBadge {
  status = input.required<string>();
}
@Component({
  selector: 'app-empty',
  imports: [Icon],
  template: `<div class="empty">
    <span class="empty-icon"><app-icon name="document" /></span>
    <h3>{{ title() }}</h3>
    <p>{{ message() }}</p>
    <ng-content />
  </div>`,
})
export class EmptyState {
  title = input('Nothing here yet');
  message = input('');
}
@Component({
  selector: 'app-confirm',
  imports: [MatDialogModule, MatButtonModule],
  template: `<h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content
      ><p>{{ data.message }}</p>
      <p>This action cannot be undone.</p></mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button [mat-dialog-close]="false">Cancel</button
      ><button class="danger" mat-flat-button [mat-dialog-close]="true">
        Delete
      </button></mat-dialog-actions
    >`,
})
export class ConfirmDialog {
  data = inject<{ title: string; message: string }>(MAT_DIALOG_DATA);
}
@Injectable({ providedIn: 'root' })
export class Feedback {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  toast(message: string) {
    this.snack.open(message, 'Close', { duration: 4500, horizontalPosition: 'end' });
  }
  error(e: unknown) {
    this.toast(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
  }
  confirm(title: string, message: string) {
    return firstValueFrom(
      this.dialog
        .open(ConfirmDialog, {
          data: { title, message },
          width: '440px',
          maxWidth: 'calc(100vw - 32px)',
          autoFocus: 'first-tabbable',
        })
        .afterClosed(),
    );
  }
}
