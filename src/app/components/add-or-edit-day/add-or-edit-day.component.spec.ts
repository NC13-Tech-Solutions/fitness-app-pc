import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditDayComponent } from './add-or-edit-day.component';

describe('AddOrEditDayComponent', () => {
  let component: AddOrEditDayComponent;
  let fixture: ComponentFixture<AddOrEditDayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddOrEditDayComponent]
    });
    fixture = TestBed.createComponent(AddOrEditDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
