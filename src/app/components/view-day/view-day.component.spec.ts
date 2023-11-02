import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDayComponent } from './view-day.component';

describe('ViewDayComponent', () => {
  let component: ViewDayComponent;
  let fixture: ComponentFixture<ViewDayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDayComponent]
    });
    fixture = TestBed.createComponent(ViewDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
