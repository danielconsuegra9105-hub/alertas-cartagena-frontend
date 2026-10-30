import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertasPublicasComponent } from './alertas-publicas'; // 👈 Nombre corregido

describe('AlertasPublicasComponent', () => {
  let component: AlertasPublicasComponent;
  let fixture: ComponentFixture<AlertasPublicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasPublicasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertasPublicasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});