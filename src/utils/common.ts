import { appConfig, sharedData } from '@src/common/data';
import { Auth } from '@routes/auth/entities/auth.entity';
import { promises as fs } from 'fs';
import { MemoryStoredFile } from 'nestjs-form-data/dist/classes/storage/MemoryStoredFile';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; // install with `npm i uuid`

export function toBytes(mb : number) : number {
  return mb * 1024 * 1024;
}

export function canSendOtp(dateString: string): boolean {
  const time = sharedData.otp.otp_every;
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return !(diffMs >= 0 && diffMs <= time * 1000);
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

function normalizeJordanPhone(phone: string): string {
  phone = phone.replace(/[\s-]/g, '');
  if (phone.startsWith('0')) {
    if (phone.length !== 10) throw new Error('Invalid Jordanian phone number length');
    phone = '+962' + phone.slice(1);
  } else if (phone.startsWith('00962')) {
    if (phone.length !== 13) throw new Error('Invalid Jordanian phone number length');
    phone = '+962' + phone.slice(5);
  } else if (phone.startsWith('+962')) {
    if (phone.length !== 12) throw new Error('Invalid Jordanian phone number length');
  } else {
    throw new Error('Invalid phone number format');
  }
  const firstDigit = phone[4];
  if (!['7', '8', '9'].includes(firstDigit)) {
    throw new Error('Only Jordanian mobile numbers starting with 7, 8, or 9 are allowed');
  }
  return phone;
}


export function otpGenerator(): string {
  const length = sharedData.otp.otp_length;
  const max = Math.pow(10, length);
  const randomNumber = Math.floor(Math.random() * max);
  return randomNumber.toString().padStart(length, '0');
}



export async function logError(error: any, file: string = "error.log") {
  try {
    file = "/logs/" + file;
  
    const logFilePath = appConfig.path + file;
  
    const now = new Date();
    const timestamp =
      `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ` +
      `${now.getHours().toString().padStart(2, '0')}:` +
      `${now.getMinutes().toString().padStart(2, '0')}:` +
      `${now.getSeconds().toString().padStart(2, '0')}`;
  
    // ✅ Safe error handling
    let message: string;
  
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.stack || error.message;
    } else if (typeof error === 'object' && error !== null) {
      message = JSON.stringify(error);
    } else {
      message = 'Unknown error occurred';
    }
  
    const logLine = `[${timestamp}] ${message}\n`;
  
    try {
      await fs.appendFile(logFilePath, logLine, 'utf8');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }

  }
  catch (error){
    
    console.log(error);
    
  }
}
