export interface Doctor {
  createdAt: string;
  email: string;
  hospitalLogoPath: string;
  hospitalLogoUrl: string;
  id: string;
  name: string;
  phoneNumber: string;
  serialNumber: string;
}

export interface RegisterDoctorInput {
  gmail: string;
  hospitalLogo: {
    base64: string;
    fileName: string;
    mimeType: string;
  };
  name: string;
  password: string;
  phoneNumber: string;
  serialNumber: string;
}
