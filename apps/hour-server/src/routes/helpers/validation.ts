import pool from '../../database/connection';
import { groupBy } from '../../functions/groupBy';
import diffDuration from '../../functions/diffDuration';

// Verificar que la fecha de registro sea una fecha valida
export function isValidDate(date: string): boolean {
  const newDate = new Date(date);
  return (
    !isNaN(newDate.getTime()) && newDate.toISOString().slice(0, 10) === date
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
export function isEntryExitConsistent(
  startTime: string,
  exitTime: string
): boolean {
  const entryDate = new Date(`2000-01-01T${startTime}:00`);
  const exitDate = new Date(`2000-01-01T${exitTime}:00`);
  return entryDate < exitDate;
}

// Realizar validaciones de los registros de horas de acuerdo a los parametros
export async function isValidHoursPerDay(
  timeLog: {
    startTime: string;
    exitTime: string;
  },
  companyParams: {
    minHoursPerDay: string;
    maxHoursPerDay: string;
  }
): Promise<boolean> {
  // Calculamos las horas trabajadas
  const totalHours = diffDuration(timeLog.startTime, timeLog.exitTime);
  // Funcion para transformar el tiempo en minutos
  const timeToMinutes = (time: string) => {
    const timeSplit: string[] = time.split(':');
    let minutes = timeSplit[1];
    let hours = timeSplit[0];

    return parseInt(minutes) + parseInt(hours) * 60;
  };

  const totalTime = timeToMinutes(totalHours);
  const minHoursPerDay = timeToMinutes(companyParams.minHoursPerDay);
  const maxHoursPerDay = timeToMinutes(companyParams.maxHoursPerDay);

  // Validamos que las horas trabajadas estén dentro de los límites de configuración
  return totalTime >= minHoursPerDay && totalTime <= maxHoursPerDay;
}

// Validar que los grupos de nuevos registros de horas son consistentes sin superposiciones
export function isValidateTimeRecordsNotOverlaped(
  timeLogs: {
    date: string;
    startTime: string;
    endTime: string;
  }[]
): boolean {
  //  Agrupar los registros de tiempo por fecha utilizando la función groupBy
  const groupedRecords = groupBy(timeLogs, 'date');

  // Recorrer los registros de cada fecha
  for (const date in groupedRecords) {
    // Para cada fecha, se comparan las horas de finalización del registro actual con la hora de inicio del siguiente registro (si existe).
    const records = groupedRecords[date];
    for (let i = 0; i < records.length; i++) {
      const currentRecord = records[i];
      const nextRecord = records[i + 1];
      if (nextRecord && currentRecord.endTime >= nextRecord.startTime) {
        //  Se encontro una superposicione en el registro
        return false;
      }
    }
  }
  //  Se recorrieron todos los registros sin encontrar superposiciones
  return true;
}

// Validar que los registros nuevos no sean duplicados de los existentes
export async function isDuplicateTimeLog(
  idEmployee: number,
  timeLogs: {
    date: string;
    startTime: string;
    endTime: string;
  }[]
): Promise<any[]> {
  const duplicatedLogs = [];

  for (const log of timeLogs) {
    const { date, startTime, endTime } = log;

    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM time_logs WHERE employee_id = $1 AND date = $2 AND start_time = $3 AND end_time = $4`,
      [idEmployee, date, startTime, endTime]
    );

    if (rows[0].count > 0) {
      duplicatedLogs.push(log);
    }
  }
  return duplicatedLogs;
}

// Validar que los registros nuevos no se sobrepongan sobre los registros de la base de datos
export async function isValidateTimeLogsInBD(
  idEmployee: any,
  timeLogs: any
): Promise<any[]> {
  const overlappingLogs = [];

  for (const log of timeLogs) {
    const { date, startTime, endTime } = log;

    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM time_logs 
      WHERE employee_id = $1 
      AND date = $2 
      AND (($3 >= start_time AND $3 < end_time) OR ($4 > start_time AND $4 <= end_time) OR ($3 <= start_time AND $4 >= end_time))`,
      [idEmployee, date, startTime, endTime]
    );

    if (rows[0].count > 0) {
      overlappingLogs.push(log);
    }
  }

  return overlappingLogs;
}

// Realizar todas las validaciones de los registros de horas

export const isValidateRecords = async (
  idEmployee: number,
  timeLogs: {
    date: string;
    startTime: string;
    endTime: string;
  }[]
) => {
  if (!Array.isArray(timeLogs) || timeLogs.length === 0) {
    return {
      message: 'Se esperaba un arreglo de registros de tiempo',
      isValid: false,
    };
  }

  for (const log of timeLogs) {
    const { date, startTime, endTime } = log;

    // Validar que la fecha sea válida
    if (!isValidDate(date)) {
      return {
        message: 'El registro de fecha es invalido',
        isValid: false,
      };
    }

    // Validar que la fecha no sea futura
    if (!isValidateNotFutureDate(date)) {
      return {
        message: 'La fecha no puede correspoder a un periodo futuro',
        isValid: false,
      };
    }

    // Validar que la hora de entrada y salida sean consistentes
    if (!isEntryExitConsistent(startTime, endTime)) {
      return {
        message: 'Hora de entrada y salida no son consistentes',
        isValid: false,
      };
    }

    const isHoursPerDay = await isValidHoursPerDay(
      { startTime: startTime, exitTime: endTime },
      {
        minHoursPerDay: '03:00',
        maxHoursPerDay: '12:00',
      }
    );

    // Realizar validaciones de los registros de horas de acuerdo a los parametros
    if (!isHoursPerDay) {
      return {
        message:
          'El tiempo de trabajo no cumple los parametros de horas a laborar',
        isValid: false,
      };
    }
  }

  if (!isValidateTimeRecordsNotOverlaped(timeLogs)) {
    return {
      message: 'Se encontraron registros superpuestos en los datos a ingresar',
      isValid: false,
    };
  }

  // Validar que los registros nuevos no sean duplicados de los existentes
  const isDuplicated = await isDuplicateTimeLog(idEmployee, timeLogs);

  if (isDuplicated.length > 0) {
    return {
      message: 'Se encontraron registros de horas duplicados',
      isValid: false,
    };
  }

  // Validar que los registros nuevos no se sobrepongan sobre los registros de la base de datos
  const isOverlapedInBD = await isValidateTimeLogsInBD(idEmployee, timeLogs);

  if (isOverlapedInBD.length > 0) {
    return {
      message:
        'Se encontraron registros de horas superpuestos en la base de datos',
      isValid: false,
    };
  }

  return { message: '', isValid: true };
};
