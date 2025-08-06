import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../constants/dashboard.constants';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();

  constructor() {
    this.loadDarkModeSetting();
  }

  // 다크모드 토글
  toggleDarkMode(): void {
    const newMode = !this.isDarkModeSubject.value;
    this.setDarkMode(newMode);
  }

  // 다크모드 설정
  setDarkMode(isDarkMode: boolean): void {
    this.isDarkModeSubject.next(isDarkMode);
    this.saveDarkModeSetting();
    this.applyDarkMode();
  }

  // 현재 다크모드 상태 가져오기
  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  // 다크모드 설정 로드
  private loadDarkModeSetting(): void {
    const savedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);
    const isDarkMode = savedMode === 'true';
    this.isDarkModeSubject.next(isDarkMode);
    this.applyDarkMode();
  }

  // 다크모드 설정 저장
  private saveDarkModeSetting(): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, this.isDarkModeSubject.value.toString());
  }

  // 다크모드 적용
  private applyDarkMode(): void {
    if (this.isDarkModeSubject.value) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
} 