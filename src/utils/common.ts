import { appConfig } from '@src/common/data';
import { promises as fs } from 'fs';
import { MemoryStoredFile } from 'nestjs-form-data/dist/classes/storage/MemoryStoredFile';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; // install with `npm i uuid`

export function toBytes(mb : number) : number {
  return mb * 1024 * 1024;
}

export async function saveFile(file: MemoryStoredFile, saveSubDir: string, name?: string): Promise<string> {
  if (!name) {
    name = uuidv4();
  }

  const ext = path.extname(file.originalName);
  const fileName = `${name}${ext}`;

  const saveDir = path.join(appConfig.path, 'uploads', saveSubDir);
  await fs.mkdir(saveDir, { recursive: true });
  
  const filePath = path.join(saveDir, fileName);
  await fs.writeFile(filePath, file.buffer);
  
  return `/uploads${saveSubDir}/${fileName}`;
}