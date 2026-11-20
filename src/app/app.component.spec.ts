import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [provideRouter([])],
      // Child components (header, sidebar, footer) are covered by their own specs
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should render the layout landmarks', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('header.app-header-bar')).toBeTruthy();
    expect(el.querySelector('main#main-content router-outlet')).toBeTruthy();
    expect(el.querySelector('footer app-footer')).toBeTruthy();
  });

  it('should toggle the sidebar from the hamburger button', () => {
    const button = fixture.nativeElement.querySelector('.hamburger-menu') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();
    expect(app.isSidebarOpen).toBeTrue();
    expect(button.getAttribute('aria-expanded')).toBe('true');

    button.click();
    fixture.detectChanges();
    expect(app.isSidebarOpen).toBeFalse();
  });

  it('should close the sidebar with Escape', () => {
    app.isSidebarOpen = true;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(app.isSidebarOpen).toBeFalse();
  });

  it('should close the sidebar when clicking the overlay', () => {
    app.isSidebarOpen = true;
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.sidebar-overlay') as HTMLElement).click();
    expect(app.isSidebarOpen).toBeFalse();
  });
});
