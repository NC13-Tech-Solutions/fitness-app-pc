import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExerciseDialogComponent } from './add-exercise-dialog.component';

describe('AddExerciseDialogComponent', () => {
  let component: AddExerciseDialogComponent;
  let fixture: ComponentFixture<AddExerciseDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExerciseDialogComponent]
    });
    fixture = TestBed.createComponent(AddExerciseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
