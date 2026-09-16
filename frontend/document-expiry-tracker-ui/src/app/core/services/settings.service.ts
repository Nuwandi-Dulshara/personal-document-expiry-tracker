import { Injectable, computed, inject } from '@angular/core';
import { MockStore } from './mock-store';
import { UserSettings } from '../../shared/models/models';
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private store = inject(MockStore);
  readonly settings = computed(() => this.store.state().settings);
  save(settings: UserSettings) {
    this.store.update((s) => ({ ...s, settings }));
  }
}
