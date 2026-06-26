export const paths = {
  login: '/login',
  signup: '/signup',
  patients: '/patients',
  patientDetails: (id: string) => `/patient/${id}`,
  profile: '/profile',
} as const;
