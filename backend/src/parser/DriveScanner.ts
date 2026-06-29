import fs from 'node:fs/promises';
import path from 'node:path';

export async function findTxtFiles(rootPath: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(directoryPath: string) {
    let entries;

    try {
      entries = await fs.readdir(directoryPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.txt')) {
        files.push(entryPath);
      }
    }
  }

  await walk(rootPath);
  return files;
}
