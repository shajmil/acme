import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { Observable, switchMap } from 'rxjs';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  protected Object = Object;
  isLoading = true;

  user$ = this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id');
      console.log('id: ', id);
      return this.userService.getUserById(id);
    })
  );
}
