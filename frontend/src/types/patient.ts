export type PatientStatus = 'stable' | 'review' | 'critical';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  condition: string;
  status: PatientStatus;
  lastVisit: string;
  careTeam: string;
}
