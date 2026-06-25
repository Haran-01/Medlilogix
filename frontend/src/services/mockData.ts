import type { Patient } from '../types/patient';

export const mockPatients: Patient[] = [
  {
    id: 'P-1001',
    name: 'Aarav Mehta',
    age: 42,
    gender: 'Male',
    condition: 'Post-operative recovery',
    status: 'stable',
    lastVisit: '2026-06-18',
    careTeam: 'Surgical Care',
  },
  {
    id: 'P-1002',
    name: 'Nisha Rao',
    age: 36,
    gender: 'Female',
    condition: 'Cardiac monitoring',
    status: 'review',
    lastVisit: '2026-06-20',
    careTeam: 'Cardiology',
  },
  {
    id: 'P-1003',
    name: 'Kabir Singh',
    age: 58,
    gender: 'Male',
    condition: 'Diabetes management',
    status: 'critical',
    lastVisit: '2026-06-21',
    careTeam: 'Endocrinology',
  },
];

export const analyticsTrend = [
  { month: 'Jan', admissions: 126, discharges: 111 },
  { month: 'Feb', admissions: 132, discharges: 120 },
  { month: 'Mar', admissions: 148, discharges: 136 },
  { month: 'Apr', admissions: 141, discharges: 139 },
  { month: 'May', admissions: 156, discharges: 145 },
  { month: 'Jun', admissions: 164, discharges: 152 },
];
