import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createToken, verifyPassword, verifyToken } from './Auth';
import { MedilogixDatabase, type DoctorRecord, type PatientTestInput } from './Database';

interface RequestContext {
  body: unknown;
  doctor: DoctorRecord | null;
  request: IncomingMessage;
  response: ServerResponse;
  url: URL;
}

const allowedGenders = new Set(['Female', 'Male', 'Other']);
const maxBodyBytes = 10 * 1024 * 1024;

export class MedilogixApiServer {
  private database: MedilogixDatabase;
  private server: http.Server;
  private baseUrl = '';

  constructor() {
    this.database = new MedilogixDatabase();
    this.server = http.createServer((request, response) => {
      void this.handleRequest(request, response);
    });
  }

  async start() {
    if (this.baseUrl) {
      return this.baseUrl;
    }

    await this.database.initialize();

    const port = Number(process.env.MEDILOGIX_API_PORT ?? 3417);

    await new Promise<void>((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(port, '127.0.0.1', () => {
        this.server.off('error', reject);
        const address = this.server.address() as AddressInfo;
        this.baseUrl = `http://127.0.0.1:${address.port}/api`;
        resolve();
      });
    });

    return this.baseUrl;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async stop() {
    await new Promise<void>((resolve) => {
      this.server.close(() => resolve());
    });
    this.database.close();
  }

  private async handleRequest(request: IncomingMessage, response: ServerResponse) {
    if (!this.setBaseHeaders(request, response)) {
      this.sendJson(response, 403, { message: 'Origin is not allowed' });
      return;
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');

      if (!url.pathname.startsWith('/api/')) {
        this.sendJson(response, 404, { message: 'Route not found' });
        return;
      }

      const context: RequestContext = {
        body: ['POST', 'PUT', 'PATCH'].includes(request.method ?? '') ? await this.readJsonBody(request) : null,
        doctor: null,
        request,
        response,
        url,
      };

      await this.route(context);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected API error';
      const status = message === 'Request body is too large' || message === 'Invalid JSON body' ? 400 : 500;
      this.sendJson(response, status, { message });
    }
  }

  private async route(context: RequestContext) {
    const { request, response, url } = context;
    const method = request.method ?? 'GET';

    if (method === 'GET' && url.pathname === '/api/health') {
      this.sendJson(response, 200, { ok: true });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/login') {
      await this.login(context);
      return;
    }

    context.doctor = await this.authenticate(request);

    if (!context.doctor) {
      this.sendJson(response, 401, { message: 'Authentication required' });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/auth/me') {
      this.sendJson(response, 200, { doctor: context.doctor });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/patient-tests') {
      this.sendJson(response, 200, { records: await this.database.listPatientTests(context.doctor.id) });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/patient-tests') {
      await this.createPatientTest(context);
      return;
    }

    const recordMatch = url.pathname.match(/^\/api\/patient-tests\/([^/]+)$/);

    if (method === 'GET' && recordMatch) {
      const record = await this.database.getPatientTest(decodeURIComponent(recordMatch[1]), context.doctor.id);

      if (!record) {
        this.sendJson(response, 404, { message: 'Record not found' });
        return;
      }

      this.sendJson(response, 200, { record });
      return;
    }

    this.sendJson(response, 404, { message: 'Route not found' });
  }

  private async login(context: RequestContext) {
    const { response } = context;
    const body = context.body as { email?: unknown; password?: unknown } | null;
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      this.sendJson(response, 400, { message: 'Email and password are required' });
      return;
    }

    const doctor = await this.database.findDoctorByEmail(email);

    if (!doctor || !verifyPassword(password, doctor.passwordSalt, doctor.passwordHash)) {
      this.sendJson(response, 401, { message: 'Invalid email or password' });
      return;
    }

    const publicDoctor = await this.database.getDoctorById(doctor.id);

    if (!publicDoctor) {
      this.sendJson(response, 401, { message: 'Invalid email or password' });
      return;
    }

    this.sendJson(response, 200, {
      doctor: publicDoctor,
      token: createToken(this.database.getTokenSecret(), publicDoctor),
    });
  }

  private async createPatientTest(context: RequestContext) {
    const { doctor, response } = context;
    const validation = this.validatePatientTest(context.body);

    if (!doctor) {
      this.sendJson(response, 401, { message: 'Authentication required' });
      return;
    }

    if (!validation.ok) {
      this.sendJson(response, 422, { message: validation.message });
      return;
    }

    const record = await this.database.createPatientTest(doctor.id, validation.value);
    this.sendJson(response, 201, { record });
  }

  private async authenticate(request: IncomingMessage) {
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      return null;
    }

    const token = header.slice('Bearer '.length).trim();
    const payload = verifyToken(this.database.getTokenSecret(), token);

    if (!payload) {
      return null;
    }

    return this.database.getDoctorById(payload.sub);
  }

  private validatePatientTest(body: unknown): { ok: true; value: PatientTestInput } | { message: string; ok: false } {
    const value = body as Partial<PatientTestInput> | null;

    if (!value || typeof value !== 'object') {
      return { ok: false, message: 'Patient test payload is required' };
    }

    const requiredTextFields: Array<keyof PatientTestInput> = [
      'age',
      'description',
      'id',
      'importedAt',
      'patientName',
      'testDate',
      'testDuration',
    ];
    const missingField = requiredTextFields.find((field) => {
      const fieldValue = value[field];

      return typeof fieldValue !== 'string' || fieldValue.trim().length === 0;
    });

    if (missingField) {
      return { ok: false, message: `${missingField} is required before saving` };
    }

    if (typeof value.gender !== 'string' || !allowedGenders.has(value.gender)) {
      return { ok: false, message: 'gender is required before saving' };
    }

    if (!Number.isInteger(Number(value.age)) || Number(value.age) <= 0) {
      return { ok: false, message: 'age must be a positive number' };
    }

    const numericFields: Array<keyof PatientTestInput> = ['averagePsi', 'minimumPsi', 'peakPsi'];
    const invalidNumericField = numericFields.find((field) => typeof value[field] !== 'number' || !Number.isFinite(value[field]));

    if (invalidNumericField) {
      return { ok: false, message: `${invalidNumericField} is required before saving` };
    }

    if (!Array.isArray(value.samples) || value.samples.length === 0) {
      return { ok: false, message: 'samples are required before saving' };
    }

    const invalidSample = value.samples.find((sample) => {
      const timestamp = sample.timestamp ?? sample.time;

      return typeof timestamp !== 'string' || timestamp.trim().length === 0 || typeof sample.psi !== 'number' || !Number.isFinite(sample.psi);
    });

    if (invalidSample) {
      return { ok: false, message: 'Every sample must include a timestamp and PSI value' };
    }

    return {
      ok: true,
      value: {
        age: value.age.trim(),
        averagePsi: value.averagePsi,
        description: value.description.trim(),
        gender: value.gender,
        id: value.id.trim(),
        importedAt: value.importedAt.trim(),
        minimumPsi: value.minimumPsi,
        patientName: value.patientName.trim(),
        peakPsi: value.peakPsi,
        sampleCount: value.samples.length,
        samples: value.samples,
        sourceFileName: typeof value.sourceFileName === 'string' ? value.sourceFileName.trim() : undefined,
        testDate: value.testDate.trim(),
        testDuration: value.testDuration.trim(),
      },
    };
  }

  private readJsonBody(request: IncomingMessage) {
    return new Promise<unknown>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      request.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;

        if (totalBytes > maxBodyBytes) {
          reject(new Error('Request body is too large'));
          request.destroy();
          return;
        }

        chunks.push(chunk);
      });

      request.on('end', () => {
        if (chunks.length === 0) {
          resolve(null);
          return;
        }

        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new Error('Invalid JSON body'));
        }
      });
      request.on('error', reject);
    });
  }

  private setBaseHeaders(request: IncomingMessage, response: ServerResponse) {
    const origin = request.headers.origin;

    if (origin) {
      const isAllowedOrigin =
        origin === 'null' ||
        origin.startsWith('file://') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://localhost:');

      if (!isAllowedOrigin) {
        return false;
      }

      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Vary', 'Origin');
    }

    response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Max-Age', '86400');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');

    return true;
  }

  private sendJson(response: ServerResponse, status: number, payload: unknown) {
    if (response.writableEnded) {
      return;
    }

    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
  }
}
