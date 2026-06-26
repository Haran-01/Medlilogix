export interface Doctor {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  phoneNumber: string;
  serialNumber: string;
}

export interface RegisterDoctorInput {
  gmail: string;
  name: string;
  password: string;
  phoneNumber: string;
  serialNumber: string;
}
