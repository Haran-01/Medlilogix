import fs from 'node:fs/promises';
import path from 'node:path';
import { findTxtFiles } from './DriveScanner';
import { parseTxtFile } from './TxtParser';
import type { PatientImportError, PatientImportRecord, PatientImportResult } from './types/PatientImport';

export class ImportQueue {
  private records: PatientImportRecord[] = [];

  getRecords() {
    return this.records;
  }

  async importFromDrive(driveLetter: string): Promise<PatientImportResult> {
    const txtFiles = await findTxtFiles(driveLetter);
    const records: PatientImportRecord[] = [];
    const errors: PatientImportError[] = [];

    if (txtFiles.length === 0) {
      return {
        errors: [{ fileName: driveLetter, message: 'No TXT files found' }],
        records: [],
        txtFilesFound: 0,
      };
    }

    for (const filePath of txtFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        records.push(parseTxtFile(filePath, content));
      } catch (error) {
        errors.push({
          fileName: path.basename(filePath),
          message: error instanceof Error ? error.message : 'Unreadable TXT file',
        });
      }
    }

    this.records = records;

    return {
      errors,
      records,
      txtFilesFound: txtFiles.length,
    };
  }
}
