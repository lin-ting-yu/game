import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesktopItemComponent } from './desktop-item.component';

describe('DesktopItemComponent', () => {
  let component: DesktopItemComponent;
  let fixture: ComponentFixture<DesktopItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesktopItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesktopItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
