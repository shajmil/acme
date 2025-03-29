import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable, map, tap } from 'rxjs';

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private http = inject(HttpClient);
  private apiUrl = 'https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json';

  private state = signal<UserState>({
    users: [],
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    searchQuery: ''
  });

  users = computed(() => this.state().users);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  currentPage = computed(() => this.state().currentPage);

  totalPages = computed(() => 
    Math.ceil(this.filteredUsers().length / this.state().pageSize)
  );

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  filteredUsers = computed(() => {
    const query = this.state().searchQuery.toLowerCase();
    return query 
      ? this.state().users.filter(user => 
          Object.values(user).some(value => 
            String(value).toLowerCase().includes(query)
          )
        )
      : this.state().users;
  });

  paginatedUsers = computed(() => {
    const { currentPage, pageSize } = this.state();
    const filtered = this.filteredUsers();
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  });

  fetchUsers(): Observable<User[]> {
    if (this.state().users.length) {
      return new Observable(subscriber => {
        subscriber.next(this.state().users);
        subscriber.complete();
      });
    }

    this.setLoading(true);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap({
        next: (users) => {
          this.state.update(state => ({
            ...state,
            users,
            loading: false,
            error: null
          }));
        },
        error: () => {
          this.state.update(state => ({
            ...state,
            loading: false,
            error: 'Failed to fetch users'
          }));
        }
      })
    );
  }

  updateUser(updatedUser: User): void {
    this.state.update(state => ({
      ...state,
      users: state.users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    }));
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.state.update(state => ({ ...state, currentPage: page }));
    }
  }

  setSearchQuery(query: string): void {
    this.state.update(state => ({ 
      ...state, 
      searchQuery: query,
      currentPage: 1 
    }));
  }

  private setLoading(loading: boolean): void {
    this.state.update(state => ({ ...state, loading }));
  }
} 