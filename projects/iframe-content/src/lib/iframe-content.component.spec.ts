import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeContentComponent } from './iframe-content.component';

describe('IframeContentComponent', () => {
  let component: IframeContentComponent;
  let fixture: ComponentFixture<IframeContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IframeContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
