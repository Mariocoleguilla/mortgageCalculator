import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private db: Firestore | null = null;

  constructor(private authService: AuthService) {
    if (!this.authService.isMockMode) {
      try {
        const config = environment.firebase;
        const app = getApps().length === 0 ? initializeApp(config) : getApp();
        this.db = getFirestore(app);
      } catch (error) {
        console.error('Failed to initialize Cloud Firestore, falling back to mock storage:', error);
      }
    }
  }

  async saveMortgageData(uid: string, data: any): Promise<void> {
    if (this.authService.isMockMode || !this.db) {
      localStorage.setItem(`mock_db_${uid}_mortgage`, JSON.stringify(data));
      return;
    }

    try {
      const docRef = doc(this.db, 'users', uid, 'settings', 'mortgage');
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error('Error saving mortgage data to Firestore:', error);
      throw error;
    }
  }

  async saveSavingsData(uid: string, data: any): Promise<void> {
    if (this.authService.isMockMode || !this.db) {
      localStorage.setItem(`mock_db_${uid}_savings`, JSON.stringify(data));
      return;
    }

    try {
      const docRef = doc(this.db, 'users', uid, 'settings', 'savings');
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error('Error saving savings data to Firestore:', error);
      throw error;
    }
  }

  async getUserData(uid: string): Promise<{ mortgage: any; savings: any } | null> {
    if (this.authService.isMockMode || !this.db) {
      const mockMortgage = localStorage.getItem(`mock_db_${uid}_mortgage`);
      const mockSavings = localStorage.getItem(`mock_db_${uid}_savings`);
      return {
        mortgage: mockMortgage ? JSON.parse(mockMortgage) : null,
        savings: mockSavings ? JSON.parse(mockSavings) : null
      };
    }

    try {
      const mortgageRef = doc(this.db, 'users', uid, 'settings', 'mortgage');
      const savingsRef = doc(this.db, 'users', uid, 'settings', 'savings');

      const [mortgageSnap, savingsSnap] = await Promise.all([
        getDoc(mortgageRef),
        getDoc(savingsRef)
      ]);

      return {
        mortgage: mortgageSnap.exists() ? mortgageSnap.data() : null,
        savings: savingsSnap.exists() ? savingsSnap.data() : null
      };
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      return null;
    }
  }

  async clearUserData(uid: string): Promise<void> {
    if (this.authService.isMockMode) {
      localStorage.removeItem(`mock_db_${uid}_mortgage`);
      localStorage.removeItem(`mock_db_${uid}_savings`);
    }
  }
}
