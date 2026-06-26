import crypto from 'node:crypto';
import { hashPassword, verifyPassword } from './Auth';

export interface DoctorRecord {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  phoneNumber: string;
  serialNumber: string;
}

export interface DoctorAuthRecord extends DoctorRecord {
  passwordHash: string;
  passwordSalt: string;
}

interface DoctorRow {
  created_at: string;
  email: string;
  id: string;
  name: string;
  password_hash: string;
  password_salt: string;
  phone_number?: string;
  serial_number?: string;
}

interface PatientTestRow {
  age: number;
  average_psi: number;
  description: string;
  gender: '' | 'Female' | 'Male' | 'Other';
  id: string;
  imported_at: string;
  minimum_psi: number;
  patient_file_id: string;
  patient_name: string;
  peak_psi: number;
  sample_count: number;
  saved_at: string;
  source_file_name: string | null;
  test_date: string;
  test_duration: string;
}

interface SampleRow {
  psi: number;
  timestamp: string;
}

export interface PatientTestInput {
  age: string;
  averagePsi: number;
  description: string;
  gender: '' | 'Female' | 'Male' | 'Other';
  id: string;
  importedAt: string;
  minimumPsi: number;
  patientName: string;
  peakPsi: number;
  sampleCount: number;
  samples: Array<{ psi: number; time?: string; timestamp?: string }>;
  sourceFileName?: string;
  testDate: string;
  testDuration: string;
}

export interface PatientTestMetadataInput {
  age: string;
  description: string;
  gender: '' | 'Female' | 'Male' | 'Other';
  patientName: string;
}

export interface RegisterDoctorInput {
  gmail: string;
  name: string;
  password: string;
  phoneNumber: string;
  serialNumber: string;
}

export interface PatientTestRecord {
  age: string;
  averagePsi: number;
  description: string;
  gender: '' | 'Female' | 'Male' | 'Other';
  id: string;
  importedAt: string;
  minimumPsi: number;
  patientName: string;
  peakPsi: number;
  recordId: string;
  sampleCount: number;
  samples: Array<{ psi: number; time: string; timestamp: string }>;
  savedAt: string;
  sourceFileName?: string;
  status: 'Completed';
  testDate: string;
  testDuration: string;
}

export class MedilogixDatabase {
  private anonKey: string;
  private serviceRoleKey: string;
  private supabaseUrl: string;
  private tokenSecret: string;

  constructor() {
    this.supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? this.serviceRoleKey;
    this.tokenSecret = process.env.MEDILOGIX_JWT_SECRET ?? crypto.randomBytes(32).toString('hex');

    if (!this.supabaseUrl || !this.serviceRoleKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the MediLogiX API');
    }
  }

  async initialize() {
    await this.seedDefaultDoctor();
  }

  close() {
    return undefined;
  }

  getTokenSecret() {
    return this.tokenSecret;
  }

  async findDoctorByEmail(email: string) {
    const rows = await this.request<DoctorRow[]>('doctors', {
      query: {
        email: `eq.${email}`,
        limit: '1',
        select: '*',
      },
    });

    return rows[0] ? this.mapDoctorAuth(rows[0]) : null;
  }

  async getDoctorById(id: string) {
    const rows = await this.request<DoctorRow[]>('doctors', {
      query: {
        id: `eq.${id}`,
        limit: '1',
        select: '*',
      },
    });

    return rows[0] ? this.mapDoctor(rows[0]) : null;
  }

  async listPatientTests(doctorId: string) {
    const rows = await this.request<PatientTestRow[]>('patient_test_records', {
      query: {
        doctor_id: `eq.${doctorId}`,
        order: 'saved_at.desc',
        select: '*',
      },
    });

    return Promise.all(rows.map((row) => this.mapPatientTest(row)));
  }

  async getPatientTest(recordId: string, doctorId: string) {
    const rows = await this.request<PatientTestRow[]>('patient_test_records', {
      query: {
        doctor_id: `eq.${doctorId}`,
        id: `eq.${recordId}`,
        limit: '1',
        select: '*',
      },
    });

    return rows[0] ? this.mapPatientTest(rows[0]) : null;
  }

  async createPatientTest(doctorId: string, input: PatientTestInput) {
    const existingRecord = await this.request<Array<{ id: string }>>('patient_test_records', {
      query: {
        limit: '1',
        patient_file_id: `eq.${input.id}`,
        select: 'id',
      },
    });

    if (existingRecord.length > 0) {
      throw new Error(`Patient ID ${input.id} already exists. Duplicate patient IDs are not allowed.`);
    }

    const recordId = crypto.randomUUID();
    const savedAt = new Date().toISOString();
    let record: PatientTestRow;

    try {
      [record] = await this.request<PatientTestRow[]>('patient_test_records', {
        body: {
          age: Number(input.age),
          average_psi: input.averagePsi,
          description: input.description,
          doctor_id: doctorId,
          gender: input.gender,
          id: recordId,
          imported_at: input.importedAt,
          minimum_psi: input.minimumPsi,
          patient_file_id: input.id,
          patient_name: input.patientName,
          peak_psi: input.peakPsi,
          sample_count: input.samples.length,
          saved_at: savedAt,
          source_file_name: input.sourceFileName ?? null,
          test_date: input.testDate,
          test_duration: input.testDuration,
        },
        method: 'POST',
        prefer: 'return=representation',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';

      if (message.includes('duplicate key') || message.includes('23505')) {
        throw new Error(`Patient ID ${input.id} already exists. Duplicate patient IDs are not allowed.`);
      }

      throw error;
    }

    try {
      await this.request('patient_test_samples', {
        body: input.samples.map((sample, index) => ({
          psi: sample.psi,
          record_id: recordId,
          sample_order: index,
          timestamp: sample.timestamp ?? sample.time,
        })),
        method: 'POST',
      });
    } catch (error) {
      await this.request('patient_test_records', {
        method: 'DELETE',
        query: {
          id: `eq.${recordId}`,
        },
      }).catch(() => undefined);
      throw error;
    }

    return this.mapPatientTest(record);
  }

  async createDoctor(input: RegisterDoctorInput) {
    const existingDoctor = await this.findDoctorByEmail(input.gmail);

    if (existingDoctor) {
      throw new Error('An account already exists for this Gmail address');
    }

    const credentials = hashPassword(input.password);
    const [row] = await this.request<DoctorRow[]>('doctors', {
      body: {
        created_at: new Date().toISOString(),
        email: input.gmail,
        id: crypto.randomUUID(),
        name: input.name,
        password_hash: credentials.hash,
        password_salt: credentials.salt,
        phone_number: input.phoneNumber,
        serial_number: input.serialNumber,
      },
      method: 'POST',
      prefer: 'return=representation',
    });

    return this.mapDoctor(row);
  }

  async changeDoctorPassword(doctorId: string, currentPassword: string, newPassword: string) {
    const rows = await this.request<DoctorRow[]>('doctors', {
      query: {
        id: `eq.${doctorId}`,
        limit: '1',
        select: '*',
      },
    });
    const doctor = rows[0] ? this.mapDoctorAuth(rows[0]) : null;

    if (!doctor || !verifyPassword(currentPassword, doctor.passwordSalt, doctor.passwordHash)) {
      throw new Error('Current password is incorrect');
    }

    const credentials = hashPassword(newPassword);

    await this.request('doctors', {
      body: {
        password_hash: credentials.hash,
        password_salt: credentials.salt,
      },
      method: 'PATCH',
      query: {
        id: `eq.${doctorId}`,
      },
    });
  }

  async updatePatientTestMetadata(recordId: string, doctorId: string, input: PatientTestMetadataInput) {
    const rows = await this.request<PatientTestRow[]>('patient_test_records', {
      body: {
        age: Number(input.age),
        description: input.description,
        gender: input.gender,
        patient_name: input.patientName,
      },
      method: 'PATCH',
      prefer: 'return=representation',
      query: {
        doctor_id: `eq.${doctorId}`,
        id: `eq.${recordId}`,
      },
    });

    return rows[0] ? this.mapPatientTest(rows[0]) : null;
  }

  private async seedDefaultDoctor() {
    const rows = await this.request<Array<{ id: string }>>('doctors', {
      query: {
        limit: '1',
        select: 'id',
      },
    });

    if (rows.length > 0) {
      return;
    }

    const email = process.env.MEDILOGIX_DEFAULT_DOCTOR_EMAIL ?? 'doctor@medilogix.local';
    const password = process.env.MEDILOGIX_DEFAULT_DOCTOR_PASSWORD ?? 'MediLogix@2026';
    const name = process.env.MEDILOGIX_DEFAULT_DOCTOR_NAME ?? 'MediLogiX Doctor';
    const credentials = hashPassword(password);

    await this.request('doctors', {
      body: {
        created_at: new Date().toISOString(),
        email,
        id: crypto.randomUUID(),
        name,
        password_hash: credentials.hash,
        password_salt: credentials.salt,
        phone_number: '',
        serial_number: '',
      },
      method: 'POST',
    });
  }

  private async mapPatientTest(row: PatientTestRow): Promise<PatientTestRecord> {
    const sampleRows = await this.request<SampleRow[]>('patient_test_samples', {
      query: {
        order: 'sample_order.asc',
        record_id: `eq.${row.id}`,
        select: 'timestamp,psi',
      },
    });

    return {
      age: String(row.age),
      averagePsi: row.average_psi,
      description: row.description,
      gender: row.gender,
      id: row.patient_file_id,
      importedAt: row.imported_at,
      minimumPsi: row.minimum_psi,
      patientName: row.patient_name,
      peakPsi: row.peak_psi,
      recordId: row.id,
      sampleCount: row.sample_count,
      samples: sampleRows.map((sample) => ({
        psi: sample.psi,
        time: sample.timestamp,
        timestamp: sample.timestamp,
      })),
      savedAt: row.saved_at,
      sourceFileName: row.source_file_name ?? undefined,
      status: 'Completed',
      testDate: row.test_date,
      testDuration: row.test_duration,
    };
  }

  private mapDoctor(row: DoctorRow): DoctorRecord {
    return {
      createdAt: row.created_at,
      email: row.email,
      id: row.id,
      name: row.name,
      phoneNumber: row.phone_number ?? '',
      serialNumber: row.serial_number ?? '',
    };
  }

  private mapDoctorAuth(row: DoctorRow): DoctorAuthRecord {
    return {
      ...this.mapDoctor(row),
      passwordHash: row.password_hash,
      passwordSalt: row.password_salt,
    };
  }

  private async request<T = unknown>(
    table: string,
    options: {
      body?: unknown;
      method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
      prefer?: string;
      query?: Record<string, string>;
    } = {},
  ): Promise<T> {
    const query = new URLSearchParams(options.query ?? {});
    const url = `${this.supabaseUrl}/rest/v1/${table}${query.size > 0 ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        apikey: this.anonKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        'Content-Type': 'application/json',
        ...(options.prefer ? { Prefer: options.prefer } : {}),
      },
      method: options.method ?? 'GET',
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Supabase request failed: ${response.status} ${details}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const responseText = await response.text();

    if (!responseText) {
      return undefined as T;
    }

    return JSON.parse(responseText) as T;
  }

}
