import pool from '../../database/connection';
import getCompanyInfo from '../../database/redis';
import addDuration from './../../functions/scripts/addDuration';

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString
  );
}

export function isValidateNotFutureDate(date: string): boolean {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(date)) {
    return false;
  }
  const inputDate = new Date(date);
  const currentDate = new Date();
  return inputDate <= currentDate;
}

export function isEntryExitConsistent(entry: string, exit: string): boolean {
  const entryDate = new Date(`2000-01-01T${entry}:00`);
  const exitDate = new Date(`2000-01-01T${exit}:00`);
  return entryDate < exitDate;
}

const limits = {
  minHoursPerDay: 4,
  maxHoursPerDay: 12,
};

export function validateHoursPerDay(hours: number): boolean {
  return hours >= limits.minHoursPerDay && hours <= limits.maxHoursPerDay;
}

interface HoursRecord {
  entryTime: string;
  exitTime: string;
}

async function validateHours(
  hoursRecord: HoursRecord,
  companyId: string
): Promise<boolean> {
  // Obtenemos los valores de configuración de la empresa desde la caché o la base de datos
  const config = await getCompanyInfo(companyId);

  // Validamos que las horas de entrada y salida sean coherentes
  if (!isEntryExitConsistent(hoursRecord.entryTime, hoursRecord.exitTime)) {
    return false;
  }

  // Calculamos las horas trabajadas
  // const totalHours = calculateTotalHours(
  const totalHours = addDuration(hoursRecord.entryTime, hoursRecord.exitTime);

  // Validamos que las horas trabajadas estén dentro de los límites de configuración
  if (
    totalHours < config.minHoursPerDay ||
    totalHours > config.maxHoursPerDay
  ) {
    return false;
  }

  // La hora de entrada y salida son válidas y las horas trabajadas están dentro de los límites permitidos
  return true;
}

interface TimeRecord {
  id: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
}

function groupBy(arr, key) {
  return arr.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

export function isValidateTimeRecords(timeRecords: TimeRecord[]): boolean {
  const groupedRecords = groupBy(timeRecords, 'date');
  for (const date in groupedRecords) {
    const records = groupedRecords[date];
    for (let i = 0; i < records.length; i++) {
      const currentRecord = records[i];
      const nextRecord = records[i + 1];
      if (nextRecord && currentRecord.end_time > nextRecord.start_time) {
        return false;
      }
    }
  }
  return true;
}

interface HourLog {
  date: string;
  start_time: string;
  end_time: string;
}

export function validateNoOverlap(
  hourLogs: HourLog[],
  newLog: HourLog
): boolean {
  const startDateTime = new Date(newLog.date + 'T' + newLog.start_time);
  const endDateTime = new Date(newLog.date + 'T' + newLog.end_time);

  // Check if new log overlaps with any existing logs
  for (const log of hourLogs) {
    const logStartDateTime = new Date(log.date + 'T' + log.start_time);
    const logEndDateTime = new Date(log.date + 'T' + log.end_time);

    if (startDateTime >= logStartDateTime && startDateTime < logEndDateTime) {
      return false; // Overlaps with existing log
    }

    if (endDateTime > logStartDateTime && endDateTime <= logEndDateTime) {
      return false; // Overlaps with existing log
    }

    if (startDateTime <= logStartDateTime && endDateTime >= logEndDateTime) {
      return false; // Overlaps with existing log
    }
  }

  // No overlaps found
  return true;
}

import { Request, Response, NextFunction } from 'express';

interface Register {
  id: number;
  date: Date;
  employeeId: number;
  startTime: string;
  endTime: string;
}

async function isNotOverlapping(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { employeeId, date, startTime, endTime } = req.body;
  const existingRegisters = await pool.query(
    `SELECT * FROM registers WHERE employee_id = $1 AND date = $2`,
    [employeeId, date]
  ).rows;

  for (const register of existingRegisters) {
    const startDateTime = new Date(`${date} ${startTime}`);
    const endDateTime = new Date(`${date} ${endTime}`);
    const existingStartDateTime = new Date(
      `${register.date} ${register.startTime}`
    );
    const existingEndDateTime = new Date(
      `${register.date} ${register.endTime}`
    );

    if (
      (startDateTime >= existingStartDateTime &&
        startDateTime <= existingEndDateTime) ||
      (endDateTime >= existingStartDateTime &&
        endDateTime <= existingEndDateTime) ||
      (startDateTime <= existingStartDateTime &&
        endDateTime >= existingEndDateTime)
    ) {
      return res
        .status(400)
        .json({ message: 'Registro solapado con otro existente' });
    }
  }

  next();
}

import { Pool } from 'pg';

interface HourRecord {
  id: number;
  user_id: number;
  date: string;
  entry_time: string;
  exit_time: string;
}

async function isDuplicateRecord(
  pool: Pool,
  userId: number,
  date: string,
  entryTime: string,
  exitTime: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM hour_records WHERE user_id = $1 AND date = $2 AND entry_time = $3 AND exit_time = $4',
      values: [userId, date, entryTime, exitTime],
    };
    const result = await client.query(query);
    const hourRecord: HourRecord = result.rows[0];
    return !!hourRecord;
  } catch (err) {
    console.error('Error checking duplicate record:', err);
    return false;
  } finally {
    client.release();
  }
}
