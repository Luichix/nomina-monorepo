import { Pool } from 'pg';
import pool from '../../database/connection';
import addDuration from './../../functions/addDuration';
import { Request, Response, NextFunction } from 'express';
import { groupBy } from '../../functions/groupBy';

// Verificar que la fecha de registro sea una fecha valida
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString
  );
}

// Verificar que la fecha del registro no sea una fecha futura
export function isValidateNotFutureDate(date: string): boolean {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(date)) {
    return false;
  }
  const inputDate = new Date(date);
  const currentDate = new Date();
  return inputDate <= currentDate;
}

// Verificar que la hora de entrada y salida sean coherentes
export function isEntryExitConsistent(entry: string, exit: string): boolean {
  const entryDate = new Date(`2000-01-01T${entry}:00`);
  const exitDate = new Date(`2000-01-01T${exit}:00`);
  return entryDate < exitDate;
}

// Realizar validaciones de los registros de horas de acuerdo a los parametros
export async function validateHoursPerDay(
  hoursRecord: {
    entryTime: string;
    exitTime: string;
  },
  companyParams: Record<string, any>
): Promise<boolean> {
  // Calculamos las horas trabajadas
  const totalHours = addDuration(hoursRecord.entryTime, hoursRecord.exitTime);

  // Validamos que las horas trabajadas estén dentro de los límites de configuración
  return (
    totalHours >= companyParams.minHoursPerDay &&
    totalHours <= companyParams.maxHoursPerDay
  );
}

// Validar que los grupos de nuevos registros de horas son consistentes sin superposiciones
export function isValidateTimeRecords(
  timeRecords: {
    id: number;
    employee_id: number;
    date: string;
    start_time: string;
    end_time: string;
  }[]
): boolean {
  //  Agrupar los registros de tiempo por fecha utilizando la función groupBy
  const groupedRecords = groupBy(timeRecords, 'date');

  // Recorrer los registros de cada fecha
  for (const date in groupedRecords) {
    // Para cada fecha, se comparan las horas de finalización del registro actual con la hora de inicio del siguiente registro (si existe).
    const records = groupedRecords[date];
    for (let i = 0; i < records.length; i++) {
      const currentRecord = records[i];
      const nextRecord = records[i + 1];
      if (nextRecord && currentRecord.end_time > nextRecord.start_time) {
        //  Se encontro una superposicione en el registro
        return false;
      }
    }
  }
  //  Se recorrieron todos los registros sin encontrar superposiciones
  return true;
}
// Validar que los registros nuevos no se sobrepongan sobre los registros de la base de datos
export async function isValidateTimeLogs(idEmployee, timeLogs) {
  const overlappingLogs = [];

  for (const log of timeLogs) {
    const { date, startTime, endTime } = log;

    const { rowCount } = await pool.query(
      `SELECT COUNT(*) FROM time_logs 
      WHERE employee_id = $1 
      AND date = $2 
      AND (($3 >= start_time AND $3 < end_time) OR ($4 > start_time AND $4 <= end_time) OR ($3 <= start_time AND $4 >= end_time))`,
      [idEmployee, date, startTime, endTime]
    );

    if (rowCount > 0) {
      overlappingLogs.push(log);
    }
  }

  return overlappingLogs;
}

// Validar que los registros nuevos no sean duplicados de los existentes
export async function isDuplicateTimeLog(idEmpleado, date, startTime, endTime) {
  const { rowCount } = await pool.query(
    `SELECT COUNT(*) FROM time_logs WHERE employee_id = $1 AND date = $2 AND start_time = $3 AND end_time = $4`,
    [idEmpleado, date, startTime, endTime]
  );

  return rowCount > 0;
}

export const isValidateRecords = async (
  idEmployee,
  date,
  startTime,
  endTime,
  timeLogs
) => {
  // Validar que la fecha sea válida
  if (!isValidDate(date)) {
    // res.status(400).send('Fecha inválida');
    return;
  }

  // Validar que la fecha no sea futura
  if (!isValidateNotFutureDate(date)) {
    // res.status(400).send('Fecha inválida');
    return;
  }

  // Validar que la hora de entrada y salida sean consistentes
  if (!isEntryExitConsistent(startTime, endTime)) {
    // res.status(400).send('Hora de entrada y salida no son consistentes');
    return;
  }

  if (!Array.isArray(timeLogs) || timeLogs.length === 0) {
    // res.status(400).send('Se esperaba un arreglo de registros de tiempo');
    return;
  }

  const overlappingLogs = await isValidateTimeLogs(idEmployee, timeLogs);

  if (overlappingLogs.length > 0) {
    // res.status(400).send('Existen superposiciones en los registros de horas');
    return;
  }

  return true;
};
