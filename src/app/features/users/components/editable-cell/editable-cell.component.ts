import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editable-cell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <input
      class="form-control form-control-sm"
      [ngModel]="value"
      (ngModelChange)="onChange($event)"
      (blur)="onBlur()"
      (keyup.enter)="onBlur()"
      (click)="$event.stopPropagation()"
      #input
    />
  `,
  styles: [`
    :host {
      display: block;
    }
    .form-control {
      min-width: 100px;
    }
  `]
})
export class EditableCellComponent {
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();
  @Output() blur = new EventEmitter<void>();

  onChange(newValue: any) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  onBlur() {
    this.blur.emit();
  }
} 