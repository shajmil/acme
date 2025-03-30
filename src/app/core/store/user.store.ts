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
  filters: Record<string, string>;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private http = inject(HttpClient);
  private apiUrl = 'https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json';

  private _state = signal<UserState>({
    users: [],
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    filters: {},
    sortField: 'name',
    sortDirection: 'asc'
  });

  state = computed(() => this._state());
  users = computed(() => this._state().users);
  loading = computed(() => this._state().loading);
  error = computed(() => this._state().error);
  currentPage = computed(() => this._state().currentPage);

  filteredUsers = computed(() => {
    let result = [...this._state().users];
    const { searchQuery, filters } = this._state();
    
    if (Object.keys(filters).length > 0) {
      for (const [field, value] of Object.entries(filters)) {
        if (value?.trim()) {
          result = result.filter(user => 
            String(user[field])
              .toLowerCase()
              .includes(value.toLowerCase())
          );
        }
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        Object.entries(user).some(([key, value]) => 
          String(value).toLowerCase().includes(query)
        )
      );
    }
    
    const { sortField, sortDirection } = this._state();
    if (sortField) {
      result.sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        
        if (valueA === valueB) return 0;
        
        if (sortDirection === 'asc') {
          return valueA < valueB ? -1 : 1;
        } else {
          return valueA > valueB ? -1 : 1;
        }
      });
    }
    
    return result;
  });

  totalPages = computed(() => 
    Math.max(1, Math.ceil(this.filteredUsers().length / this._state().pageSize))
  );

  paginatedUsers = computed(() => {
    const { currentPage, pageSize } = this._state();
    const filtered = this.filteredUsers();
    const startIndex = (currentPage - 1) * pageSize;
    
    return filtered.slice(startIndex, startIndex + pageSize);
  });

  fetchUsers(): Observable<User[]> {
    if (this._state().users.length) {
      return new Observable(subscriber => {
        subscriber.next(this._state().users);
        subscriber.complete();
      });
    }

    this.setLoading(true);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap({
        next: (users) => {
          this._state.update(state => ({
            ...state,
            users,
            loading: false,
            error: null
          }));
        },
        error: (err) => {
          this._state.update(state => ({
            ...state,
            loading: false,
            error: 'Failed to fetch users'
          }));
        }
      })
    );
  }

  updateUser(updatedUser: User): void {
    this._state.update(state => ({
      ...state,
      users: state.users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    }));
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._state.update(state => ({ ...state, currentPage: page }));
    }
  }

  setPageSize(size: number): void {
    this._state.update(state => ({ 
      ...state, 
      pageSize: size,
      currentPage: 1 
    }));
  }

  setSearchQuery(query: string): void {
    this._state.update(state => ({ 
      ...state, 
      searchQuery: query,
      currentPage: 1 
    }));
  }
  
  setFilters(filters: Record<string, string>): void {
    this._state.update(state => ({
      ...state,
      filters,
      currentPage: 1
    }));
  }
  
  setSorting(field: string, direction: 'asc' | 'desc'): void {
    this._state.update(state => ({
      ...state,
      sortField: field,
      sortDirection: direction
    }));
  }

  private setLoading(loading: boolean): void {
    this._state.update(state => ({ ...state, loading }));
  }
}