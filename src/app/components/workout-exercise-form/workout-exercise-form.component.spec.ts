import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutExerciseFormComponent } from './workout-exercise-form.component';

describe('WorkoutExerciseFormComponent', () => {
  let component: WorkoutExerciseFormComponent;
  let fixture: ComponentFixture<WorkoutExerciseFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkoutExerciseFormComponent]
    });
    fixture = TestBed.createComponent(WorkoutExerciseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
