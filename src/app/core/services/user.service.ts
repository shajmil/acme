import { Injectable, inject } from '@angular/core';
import { User } from '../models/user.model';
import { Observable, map, of } from 'rxjs';
import { UserStore } from '../store/user.store';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private store = inject(UserStore);

  fetchUsers() {
    return this.store.fetchUsers();
  }

  getUserById(id: any): Observable<User | undefined> {
    if (this.store.users().length > 0) {
      return of(this.store.users().find(user => user.id === id));
    }
    return this.fetchUsers().pipe(
      map(users => users.find(user => user.id === id))
    );
  }

  updateUser(updatedUser: User) {
    this.store.updateUser(updatedUser);
  }
} 