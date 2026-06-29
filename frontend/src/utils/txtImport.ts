import type { PatientTestRecord, PsiSample } from '../types/patientTest';

export interface TxtImportError {
  fileName: string;
  message: string;
}

export interface TxtImportResult {
  errors: TxtImportError[];
  records: PatientTestRecord[];
  txtFilesFound: number;
}

const datePattern = /\b\d{2}\/\d{2}\/\d{2}\b/;
const readingPattern = /^\s*(\d{2}:\d{2}:\d{2})\s*,\s*(-?\d+(?:\.\d+)?)\s*,?\s*$/;

function parseTimestampSeconds(timestamp: string) {
  const [hours, minutes, seconds] = timestamp.split(':').map(Number);
  if ([hours, minutes, seconds].some((value) => Number.isNaN(value))) {
    return 0;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(totalSeconds: number) {
  const normalizedSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;

  if (minutes === 0) {
    return `${seconds} sec`;
  }

  return `${minutes} min ${seconds} sec`;
}

function parseTxtContent(fileName: string, content: string): PatientTestRecord {
  const patientId = fileName.replace(/\.[^.]+$/, '');
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (lines.length === 0) {
    throw new Error('Empty TXT file');
  }

  const dateLine = lines.find((line) => datePattern.test(line));
  const testDate = dateLine?.match(datePattern)?.[0];

  if (!testDate) {
    throw new Error('Test date not found');
  }

  const samples: PsiSample[] = [];

  lines.forEach((line) => {
    const match = line.match(readingPattern);
    if (!match) {
      return;
    }

    samples.push({
      time: match[1],
      timestamp: match[1],
      psi: Number(match[2]),
    });
  });

  if (samples.length === 0) {
    throw new Error('No valid PSI readings found');
  }

  const psiValues = samples.map((sample) => sample.psi);
  const firstTimestamp = parseTimestampSeconds(samples[0].timestamp ?? samples[0].time ?? '');
  const lastTimestamp = parseTimestampSeconds(samples[samples.length - 1].timestamp ?? samples[samples.length - 1].time ?? '');

  return {
    id: patientId,
    patientName: '',
    gender: '',
    age: '',
    caseHistory: '',
    description: '',
    testDate,
    testDuration: formatDuration(lastTimestamp - firstTimestamp),
    peakPsi: Math.max(...psiValues),
    averagePsi: psiValues.reduce((sum, value) => sum + value, 0) / psiValues.length,
    minimumPsi: Math.min(...psiValues),
    sampleCount: samples.length,
    importedAt: new Date().toISOString(),
    sourceFileName: fileName,
    status: 'Pending',
    samples,
  };
}

export async function importTxtFilesFromBrowser(files: FileList | File[]): Promise<TxtImportResult> {
  const txtFiles = Array.from(files).filter((file) => file.name.toLowerCase().endsWith('.txt'));
  const records: PatientTestRecord[] = [];
  const errors: TxtImportError[] = [];

  for (const file of txtFiles) {
    try {
      records.push(parseTxtContent(file.name, await file.text()));
    } catch (error) {
      errors.push({
        fileName: file.name,
        message: error instanceof Error ? error.message : 'Unreadable TXT file',
      });
    }
  }

  if (txtFiles.length === 0) {
    errors.push({ fileName: 'Selected files', message: 'No TXT files selected' });
  }

  return {
    errors,
    records,
    txtFilesFound: txtFiles.length,
  };
}
