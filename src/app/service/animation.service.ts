import { Injectable } from '@angular/core';
import { StatType, AnimationState } from '../models/dashboard.types';
import { ANIMATION_CONFIG } from '../constants/dashboard.constants';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private animationStates: AnimationState = {
    totalUsers: null,
    activeUsers: null,
    realtimeTraffic: null,
    totalRevenue: null
  };

  private callbacks: { [key in StatType]?: (value: number) => void } = {};

  // 애니메이션 콜백 등록
  registerCallback(statType: StatType, callback: (value: number) => void): void {
    this.callbacks[statType] = callback;
  }

  // 숫자 애니메이션 실행
  animateNumber(
    statType: StatType, 
    startValue: number, 
    endValue: number,
    onComplete?: () => void
  ): void {
    // 기존 애니메이션 중단
    this.stopAnimation(statType);

    // 증가량이 너무 작으면 애니메이션 생략
    const difference = endValue - startValue;
    if (Math.abs(difference) < ANIMATION_CONFIG.minDifference) {
      if (this.callbacks[statType]) {
        this.callbacks[statType]!(endValue);
      }
      if (onComplete) onComplete();
      return;
    }

    const stepDuration = ANIMATION_CONFIG.duration / ANIMATION_CONFIG.steps;
    const increment = difference / ANIMATION_CONFIG.steps;
    
    let currentStep = 0;
    let currentValue = startValue;

    // CSS 클래스 추가 (시각적 효과)
    this.addAnimationClass(statType);

    const animation = setInterval(() => {
      currentStep++;
      currentValue += increment;

      // 마지막 단계에서는 정확한 목표 값으로 설정
      if (currentStep >= ANIMATION_CONFIG.steps) {
        currentValue = endValue;
        clearInterval(animation);
        this.animationStates[statType] = null;
        this.removeAnimationClass(statType);
        if (onComplete) onComplete();
      }

      // 콜백을 통해 값 업데이트
      if (this.callbacks[statType]) {
        this.callbacks[statType]!(Math.round(currentValue));
      }

    }, stepDuration);

    this.animationStates[statType] = animation;
  }

  // 애니메이션 중단
  stopAnimation(statType: StatType): void {
    if (this.animationStates[statType]) {
      clearInterval(this.animationStates[statType]!);
      this.animationStates[statType] = null;
      this.removeAnimationClass(statType);
    }
  }

  // 모든 애니메이션 중단
  stopAllAnimations(): void {
    Object.keys(this.animationStates).forEach(key => {
      this.stopAnimation(key as StatType);
    });
  }

  // CSS 클래스 추가
  private addAnimationClass(statType: StatType): void {
    const element = this.getStatElement(statType);
    if (element) {
      element.classList.add('rolling');
      setTimeout(() => {
        if (element) {
          element.classList.remove('rolling');
        }
      }, 800);
    }
  }

  // CSS 클래스 제거
  private removeAnimationClass(statType: StatType): void {
    const element = this.getStatElement(statType);
    if (element) {
      element.classList.remove('rolling');
    }
  }

  // 통계 요소 가져오기
  private getStatElement(statType: StatType): HTMLElement | null {
    const selectors = {
      realtimeTraffic: '.stat-card:nth-child(1) .stat-number',
      activeUsers: '.stat-card:nth-child(2) .stat-number',
      totalUsers: '.stat-card:nth-child(3) .stat-number',
      totalRevenue: '.stat-card:nth-child(4) .stat-number'
    };

    return document.querySelector(selectors[statType]) as HTMLElement;
  }

  // 서비스 정리
  destroy(): void {
    this.stopAllAnimations();
    this.callbacks = {};
  }
} 