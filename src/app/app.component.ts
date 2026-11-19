import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    standalone: false
})
export class AppComponent {
  isSidebarOpen = false;

  constructor(router: Router) {
    // Scroll to top on every page change and close the drawer on small screens
    router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo({ top: 0 });
      if (window.innerWidth < 1024) {
        this.isSidebarOpen = false;
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.isSidebarOpen = false;
  }
}
