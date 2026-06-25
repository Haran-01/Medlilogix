import { mockPatients } from './mockData';

export async function getPatients() {
  return Promise.resolve(mockPatients);
}

export async function getPatientById(id: string) {
  return Promise.resolve(mockPatients.find((patient) => patient.id === id) ?? null);
}
