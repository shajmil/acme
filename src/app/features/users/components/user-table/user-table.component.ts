import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { UserStore } from '../../../../core/store/user.store';
import { EditableCellComponent } from '../editable-cell/editable-cell.component';
import { User } from '../../../../core/models/user.model';

interface EditState {
  id: string | null;
  originalUser: User | null;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    EditableCellComponent,
    NgbDropdownModule
  ],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css'
})
export class UserTableComponent implements OnInit {
  private readonly store = inject(UserStore);
  private readonly router = inject(Router);
  private readonly editState = signal<EditState>({ id: null, originalUser: null });
  private readonly filtersSignal = signal<Record<string, string>>({});
  
  protected searchQueryValue = '';
  
  protected readonly state = computed(() => this.store.state());
  protected readonly users = computed(() => this.store.users());
  protected readonly loading = computed(() => this.store.loading());
  protected readonly currentPage = computed(() => this.store.currentPage());
  protected readonly totalPages = computed(() => this.store.totalPages());
  protected readonly filteredUsers = computed(() => this.store.filteredUsers());
  protected readonly paginatedUsers = computed(() => this.store.paginatedUsers());
  
  protected readonly tableHeaders = computed(() => {
    const users = this.users();
    return users.length ? Object.keys(users[0]).filter(key => key !== 'id') : [];
  });
  
  protected readonly visiblePageNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => ({ value: i + 1, index: i }));
    }
    
    if (current <= 3) {
      return [
        { value: 1, index: 0 },
        { value: 2, index: 1 },
        { value: 3, index: 2 },
        { value: 4, index: 3 },
        { value: 5, index: 4 },
        { value: 'ellipsis', index: 5 },
        { value: total, index: 6 }
      ];
    }
    
    if (current >= total - 2) {
      return [
        { value: 1, index: 0 },
        { value: 'ellipsis', index: 1 },
        { value: total - 4, index: 2 },
        { value: total - 3, index: 3 },
        { value: total - 2, index: 4 },
        { value: total - 1, index: 5 },
        { value: total, index: 6 }
      ];
    }
    
    return [
      { value: 1, index: 0 },
      { value: 'ellipsis', index: 1 },
      { value: current - 1, index: 2 },
      { value: current, index: 3 },
      { value: current + 1, index: 4 },
      { value: 'ellipsis', index: 5 },
      { value: total, index: 6 }
    ];
  });
  
  protected readonly paginationInfo = computed(() => {
    const pageSize = this.state().pageSize;
    const currentPage = this.currentPage();
    const totalItems = this.filteredUsers().length;
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);
    
    return { start, end };
  });
  
  protected readonly isEditing = (userId: string) => this.editState().id === userId;

  get searchQuery(): string {
    return this.searchQueryValue;
  }

  set searchQuery(value: string) {
    this.searchQueryValue = value;
    this.store.setSearchQuery(value);
  }

  protected get filters(): Record<string, string> {
    return this.filtersSignal();
  }

  protected set filters(value: Record<string, string>) {
    this.filtersSignal.set(value);
  }

  protected readonly activeFilters = computed(() => {
    const currentFilters = this.filtersSignal();
    console.log('Current filters in computed:', currentFilters);
    return Object.entries(currentFilters)
      .filter(([_, value]) => value?.trim().length > 0)
      .map(([field, value]) => ({ field, value }));
  });

  ngOnInit(): void {
    this.store.fetchUsers().subscribe();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  applyFilters(): void {
    const newFilters = { ...this.filtersSignal() };
    this.filtersSignal.set(newFilters);
    this.store.setFilters(newFilters);
  }
  
  removeFilter(field: string): void {
    const currentFilters = { ...this.filtersSignal() };
    delete currentFilters[field];
    this.filtersSignal.set(currentFilters);
    this.store.setFilters(currentFilters);
  }
  
  resetFilters(): void {
    this.filtersSignal.set({});
    this.searchQuery = '';
    this.store.setSearchQuery('');
    this.store.setFilters({});
  }
  
  sortBy(field: string): void {
    const currentSort = this.state().sortField;
    const currentDirection = this.state().sortDirection;
    
    const direction: 'asc' | 'desc' = 
      (currentSort === field && currentDirection === 'asc') ? 'desc' : 'asc';
    
    this.store.setSorting(field, direction);
  }
  
  setPage(page: number | string): void {
    if (typeof page === 'number') {
      this.store.setPage(page);
    }
  }
  
  setPageSize(size: number): void {
    this.store.setPageSize(size);
  }

  handleRowClick(id: string): void {
    if (!this.editState().id) {
      this.viewDetails(id);
    }
  }

  startEdit(id: string): void {
    const user = this.users().find(u => u.id === id);
    if (user) {
      this.editState.set({ id, originalUser: { ...user } });
    }
  }

  cancelEdit(): void {
    const { originalUser } = this.editState();
    if (originalUser) {
      this.store.updateUser(originalUser);
    }
    this.editState.set({ id: null, originalUser: null });
  }

  saveEdit(): void {
    this.editState.set({ id: null, originalUser: null });
  }

  updateField(user: User, field: string, value: any): void {
    this.store.updateUser({ ...user, [field]: value });
  }
  
  viewDetails(id: string): void {
    this.router.navigate(['/users', id]);
  }
  
  
  
  getUserColor(id: string): string {
    const colors = [
      '#4285F4', '#34A853', '#FBBC05', '#EA4335', 
      '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', 
      '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
      '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
    ];
    
    const hash = id.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0);
    
    return colors[hash % colors.length];
  }
  
  getUserInitials(name: string): string {
    if (!name) return '?';
    
    return name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }
  
  getVersionClass(version: number): string {
    if (version >= 2) return 'bg-success';
    if (version >= 1) return 'bg-primary';
    return 'bg-secondary';
  }
  
  formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    
    return String(value);
  }

  protected readonly filterableFields = computed(() => {
    const users = this.users();
    if (!users.length) return [];
    
    return Object.keys(users[0])
      .filter(key => key !== 'id' && !['bio', 'image', 'avatar'].includes(key));
  });

  updateFilter(header: string, value: string): void {
    const currentFilters = { ...this.filtersSignal() };
    currentFilters[header] = value;
    this.filtersSignal.set(currentFilters);
    this.applyFilters();
  }
}