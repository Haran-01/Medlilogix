import type { Doctor } from '../types/doctor';
import { apiClient } from './apiClient';

interface LoginResponse {
  doctor: Doctor;
  token: string;
}

export async function loginDoctor(email: string, password: string) {
  const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });

  return response.data;
}

export async function getCurrentDoctor() {
  const response = await apiClient.get<{ doctor: Doctor }>('/auth/me');

  return response.data.doctor;
}
