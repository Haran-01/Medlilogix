import type { PatientTestRecord } from '../types/patientTest';
import { apiClient } from './apiClient';

export async function getPatientTests() {
  const response = await apiClient.get<{ records: PatientTestRecord[] }>('/patient-tests');

  return response.data.records;
}

export async function getPatientTest(recordId: string) {
  const response = await apiClient.get<{ record: PatientTestRecord }>(`/patient-tests/${encodeURIComponent(recordId)}`);

  return response.data.record;
}

export async function createPatientTest(record: PatientTestRecord) {
  const response = await apiClient.post<{ record: PatientTestRecord }>('/patient-tests', record);

  return response.data.record;
}
