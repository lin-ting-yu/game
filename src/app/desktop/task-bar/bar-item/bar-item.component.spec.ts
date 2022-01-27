import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarItemComponent } from './bar-item.component';

describe('BarItemComponent', () => {
  let component: BarItemComponent;
  let fixture: ComponentFixture<BarItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
