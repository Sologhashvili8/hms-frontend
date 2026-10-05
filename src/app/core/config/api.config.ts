import { isDevMode } from '@angular/core';

// dev (ng serve): API პირდაპირ 5080-ზე; prod build: იგივე დომენი, nginx აგზავნის /api -> API-ზე
export const API_BASE_URL = isDevMode() ? 'http://localhost:5080/api' : '/api';
