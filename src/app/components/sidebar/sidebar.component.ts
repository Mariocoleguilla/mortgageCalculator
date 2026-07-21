import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  user: any = null;
  private authSub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService.user$.subscribe(u => {
      this.user = u;
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  
    if (!this.isOpen) {
      this.closeSidebar.emit();
    }
  }

  async login(): Promise<void> {
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Sidebar Google Login failed:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      if (this.isOpen) {
        this.toggleSidebar();
      }
    } catch (error) {
      console.error('Sidebar Logout failed:', error);
    }
  }
}