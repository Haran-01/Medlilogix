export const paths = {
  login: '/login',
  patients: '/patients',
  patientDetails: (id: string) => `/patient/${id}`,
  reports: '/reports',
  settings: '/settings',
  profile: '/profile',
} as const;
