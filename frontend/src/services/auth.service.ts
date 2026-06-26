import type { Doctor, RegisterDoctorInput } from '../types/doctor';
import { apiClient } from './apiClient';

interface LoginResponse {
  doctor: Doctor;
  token: string;
}

export async function loginDoctor(gmail: string, password: string) {
  const response = await apiClient.post<LoginResponse>('/auth/login', { gmail, password });

  return response.data;
}

export async function getCurrentDoctor() {
  const response = await apiClient.get<{ doctor: Doctor }>('/auth/me');

  return response.data.doctor;
}

export async function registerDoctor(values: RegisterDoctorInput) {
  const response = await apiClient.post<{ doctor: Doctor }>('/auth/register', values);

  return response.data.doctor;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await apiClient.post<{ message: string }>('/auth/change-password', {
    currentPassword,
    newPassword,
  });

  return response.data.message;
}
