import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `<div class="not-found">
    <span>404</span>
    <h1>Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a routerLink="/dashboard" class="btn primary">Back to Dashboard</a>
  </div>`,
})
export class NotFound {}
