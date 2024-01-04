import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditWorkoutComponent } from './add-or-edit-workout.component';

describe('AddOrEditWorkoutComponent', () => {
  let component: AddOrEditWorkoutComponent;
  let fixture: ComponentFixture<AddOrEditWorkoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddOrEditWorkoutComponent]
    });
    fixture = TestBed.createComponent(AddOrEditWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
