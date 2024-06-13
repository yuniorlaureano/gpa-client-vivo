import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCycleComponent } from './stock-cycle.component';

describe('StockCycleComponent', () => {
  let component: StockCycleComponent;
  let fixture: ComponentFixture<StockCycleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockCycleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
