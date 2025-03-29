import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../../../core/store/user.store';
import { EditableCellComponent } from '../editable-cell/editable-cell.component';
import { User } from '../../../../core/models/user.model';

interface EditState {
  id: number | null;
  originalUser: User | null;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EditableCellComponent],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css'
})
export class UserTableComponent implements OnInit {
  protected readonly store = inject(UserStore);
  private readonly router = inject(Router);
  private readonly editState = signal<EditState>({ id: null, originalUser: null });
  protected readonly searchQuery = signal('');

  readonly tableHeaders = computed(() => {
    const users = this.store.users();
    return users.length ? Object.keys(users[0]).filter(key => key !== 'id') : [];
  });

  readonly isEditing = (userId: number) => this.editState().id === userId;

  ngOnInit(): void {
    this.store.fetchUsers().subscribe();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.store.setSearchQuery(query);
  }

  handleRowClick(id: number): void {
    if (!this.editState().id) {
      this.router.navigate(['/users', id]);
    }
  }

  startEdit(id: number): void {
    const user = this.store.users().find(u => u.id === id);
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
}
