export type PatientTestStatus = 'Pending' | 'Completed';

export interface PsiSample {
  time?: string;
  timestamp?: string;
  psi: number;
}

export interface PatientTestRecord {
  id: string;
  patientName: string;
  gender: '' | 'Female' | 'Male' | 'Other';
  age: string;
  description: string;
  testDate: string;
  testDuration: string;
  peakPsi: number;
  averagePsi?: number;
  minimumPsi?: number;
  sampleCount?: number;
  importedAt: string;
  status: PatientTestStatus;
  samples: PsiSample[];
}

export interface PatientMetadataFormValues {
  patientName: string;
  gender: '' | 'Female' | 'Male' | 'Other';
  age: string;
  description: string;
}
