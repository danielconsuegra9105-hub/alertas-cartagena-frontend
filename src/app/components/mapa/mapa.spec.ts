import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapaComponent } from './mapa';

describe('MapaComponent', () => {
  let component: MapaComponent;
  let fixture: ComponentFixture<MapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});