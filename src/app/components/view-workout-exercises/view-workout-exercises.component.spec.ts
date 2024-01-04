import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWorkoutExercisesComponent } from './view-workout-exercises.component';

describe('ViewWorkoutExercisesComponent', () => {
  let component: ViewWorkoutExercisesComponent;
  let fixture: ComponentFixture<ViewWorkoutExercisesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewWorkoutExercisesComponent]
    });
    fixture = TestBed.createComponent(ViewWorkoutExercisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
