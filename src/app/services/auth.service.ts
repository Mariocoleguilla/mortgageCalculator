import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, User, Auth, onAuthStateChanged } from 'firebase/auth';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  
  private _user = new BehaviorSubject<any | null>(null);
  user$ = this._user.asObservable();
  
  isMockMode = false;

  constructor() {
    const config = environment.firebase;
    if (!config || !config.apiKey || config.apiKey.startsWith('TU_') || config.apiKey === '') {
      console.warn('Firebase config is not set. Running in Mock Mode. Please update environments/environment.ts to use real Firebase services.');
      this.isMockMode = true;
      // Restore mock session from localStorage
      const savedMockUser = localStorage.getItem('mock_user');
      if (savedMockUser) {
        try {
          this._user.next(JSON.parse(savedMockUser));
        } catch {
          localStorage.removeItem('mock_user');
        }
      }
    } else {
      try {
        this.app = getApps().length === 0 ? initializeApp(config) : getApp();
        this.auth = getAuth(this.app);
        
        onAuthStateChanged(this.auth, (firebaseUser) => {
          this._user.next(firebaseUser);
        });
      } catch (error) {
        console.error('Failed to initialize Firebase Auth, falling back to Mock Mode:', error);
        this.isMockMode = true;
        const savedMockUser = localStorage.getItem('mock_user');
        if (savedMockUser) {
          try {
            this._user.next(JSON.parse(savedMockUser));
          } catch {
            localStorage.removeItem('mock_user');
          }
        }
      }
    }
  }

  get currentUser(): any {
    return this._user.value;
  }

  async loginWithGoogle(): Promise<void> {
    if (this.isMockMode) {
      const mockUser = {
        uid: 'demo_user_123',
        displayName: 'Usuario Demostración',
        email: 'demo@example.com',
        photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=demoUser'
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      this._user.next(mockUser);
      return;
    }

    if (!this.auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (this.isMockMode) {
      localStorage.removeItem('mock_user');
      this._user.next(null);
      return;
    }

    if (!this.auth) return;
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error during sign-out:', error);
      throw error;
    }
  }
}
