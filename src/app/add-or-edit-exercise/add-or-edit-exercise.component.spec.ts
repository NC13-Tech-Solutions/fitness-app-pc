import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditExerciseComponent } from './add-or-edit-exercise.component';

describe('AddOrEditExerciseComponent', () => {
  let component: AddOrEditExerciseComponent;
  let fixture: ComponentFixture<AddOrEditExerciseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddOrEditExerciseComponent]
    });
    fixture = TestBed.createComponent(AddOrEditExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
