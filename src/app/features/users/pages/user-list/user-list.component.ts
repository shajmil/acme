import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTableComponent } from '../../components/user-table/user-table.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserTableComponent],
  templateUrl: './user-list.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UserListComponent {}
