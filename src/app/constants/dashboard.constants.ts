import { TimeUnitOption, AnimationConfig } from '../models/dashboard.types';

export const TIME_UNIT_OPTIONS: TimeUnitOption[] = [
  { value: 'second', label: '초단위', interval: 1000 },
  { value: 'minute', label: '분단위', interval: 60000 },
  { value: 'hour', label: '시단위', interval: 3600000 }
];

export const ANIMATION_CONFIG: AnimationConfig = {
  duration: 1500,
  steps: 20,
  minDifference: 1
};

export const DATA_GENERATION_CONFIG = {
  TRAFFIC: {
    BASE_MIN: 40,
    BASE_MAX: 80,
    NOISE_RANGE: 10
  },
  ACTIVE_USERS: {
    MIN_RATIO: 0.6,
    MAX_RATIO: 0.8,
    REALTIME_MIN_RATIO: 0.7,
    REALTIME_MAX_RATIO: 1.0
  },
  REVENUE: {
    BASE_MIN: 10000,
    BASE_MAX: 30000,
    NOISE_RANGE: 5000,
    PER_TRAFFIC: 50000
  },
  DATA_POINTS: 60,
  MIN_UPDATE_INTERVAL: 2000
};

export const CHART_COLORS = {
  TRAFFIC: '#FF4757',
  ACTIVE_USERS: '#2ED573',
  REVENUE: '#3742FA',
  DARK_MODE: {
    TEXT: '#ffffff',
    GRID: '#404040',
    BACKGROUND: '#404040'
  },
  LIGHT_MODE: {
    TEXT: '#2c3e50',
    GRID: '#e9ecef',
    BACKGROUND: '#f8f9fa'
  }
};

export const LOCAL_STORAGE_KEYS = {
  DARK_MODE: 'isDarkMode'
};

export const CHART_CONFIG = {
  MAX_TICKS: 12,
  MAX_ROTATION: 45,
  POINT_RADIUS: 2,
  POINT_HOVER_RADIUS: 4,
  LINE_TENSION: 0.4,
  BORDER_WIDTH: 2
}; 