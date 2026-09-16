import { Injectable, computed, inject } from '@angular/core';
import { MockStore } from './mock-store';
import { User } from '../../shared/models/models';
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private store = inject(MockStore);
  readonly user = computed(() => this.store.state().user);
  save(user: User) {
    this.store.update((s) => ({ ...s, user }));
  }
}
