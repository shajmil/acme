import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editable-cell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container [ngSwitch]="fieldType">
      <textarea 
        *ngSwitchCase="'textarea'" 
        #input
        class="form-control form-control-sm"
        rows="3"
        [(ngModel)]="editValue"
        (blur)="onBlur()"
        (keydown.enter)="$event.preventDefault(); onBlur()"
        (keydown.escape)="onCancel()"
        style="resize: none;"
      ></textarea>
      
      <input 
        *ngSwitchCase="'number'"
        #input
        type="number"
        class="form-control form-control-sm"
        [(ngModel)]="editValue"
        (blur)="onBlur()"
        (keydown.enter)="onBlur()"
        (keydown.escape)="onCancel()"
        step="0.01"
      />
      
      <input 
        *ngSwitchDefault
        #input
        type="text"
        class="form-control form-control-sm"
        [(ngModel)]="editValue"
        (blur)="onBlur()"
        (keydown.enter)="onBlur()"
        (keydown.escape)="onCancel()"
      />
    </ng-container>
  `,
  styles: [`
    .form-control:focus {
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.1);
      border-color: #80bdff;
    }
  `]
})
export class EditableCellComponent {
  @Input() value: any;
  @Input() fieldType: string = 'text';
  @Input() field: string = '';
  @Output() valueChange = new EventEmitter<any>();
  
  editValue: any;
  initialValue: any;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit() {
    this.editValue = this.value;
    this.initialValue = this.value;
  }
  
  ngAfterViewInit() {
    const inputElement = this.elementRef.nativeElement.querySelector('input, textarea');
    if (inputElement) {
      inputElement.focus();
      
      if (this.fieldType !== 'textarea') {
        inputElement.select();
      }
    }
  }
  
  onBlur() {
    if (this.editValue !== this.initialValue) {
      if (this.fieldType === 'number' && typeof this.editValue === 'string') {
        this.valueChange.emit(parseFloat(this.editValue));
      } else {
        this.valueChange.emit(this.editValue);
      }
    }
  }
  
  onCancel() {
    this.editValue = this.initialValue;
    this.valueChange.emit(this.editValue);
  }
}