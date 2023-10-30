import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExercisesComponent } from './view-exercises.component';

describe('ViewExercisesComponent', () => {
  let component: ViewExercisesComponent;
  let fixture: ComponentFixture<ViewExercisesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewExercisesComponent]
    });
    fixture = TestBed.createComponent(ViewExercisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
