import { diffDuration, parseSeconds, parseTime } from 'helper';
import { Overtime, Regime, Schedule, Working_Day } from '../../interfaces/time';

interface Time_Log {
  time_log_id: number;
  employee_id: number;
  start_time: string;
  end_time: string;
  date: string;
}

type ExtraHours = Record<string, string | number>;

interface Real_Time {
  idTimeLog: number;
  idEmployee: number;
  startTime: string;
  endTime: string;
  duration: string;
  extraHours: ExtraHours[];
}

interface Params_Work_Time {
  minTimeEntry: string;
  minTimeExit: string;
  regime: Regime;
  overtime: Overtime;
  schedule: Schedule;
}

const MIN_TIME_ENTRY = '00:05';
const MIN_TIME_EXIT = '00:15';

//Funcion que devuelve la hora de entrada efectiva luego de validarla con parametros de entrada
export function analizeEntryTime(
  validatedEntryTime: string,
  mandatoryEntryTime: string,
  forgivenessEntryTime: string
): string {
  const validatedTime = parseTime(validatedEntryTime);
  const mandatoryTime = parseTime(mandatoryEntryTime);
  const forgivenessTime = parseTime(forgivenessEntryTime);

  if (validatedTime < mandatoryTime) {
    return mandatoryEntryTime;
  } else if (validatedTime - mandatoryTime <= forgivenessTime) {
    return mandatoryEntryTime;
  } else {
    return validatedEntryTime;
  }
}

// Funcion para obtener el sobretiempo laborado
export function analyzeOvertime(
  entryTime: string,
  exitTime: string,
  paramsRegime: Regime,
  paramsOvertime: Overtime,
  paramsWorkingDay: Working_Day
): ExtraHours[] {
  const extraHours: ExtraHours[] = [];

  // Verificar si se puede aplicar el tiempo extra en los registros si la propiedad 'extras' de paramsRegime es true
  if (paramsRegime.extras) {
    // Parsear la hora de entrada y salida a segundos
    const parseEntryTime = parseTime(entryTime);
    const parseExitTime = parseTime(exitTime);
    // Recorrer cada propiedad de paramsOvertime
    for (const overtime of paramsOvertime) {
      // Parsear los tiempos de entrada y salida de overtime a segundos
      let parseOvertimeStartTime = parseTime(overtime.start);
      let parseOvertimeEndTime = parseTime(overtime.end);

      // Verificar si es necesario cambiar el inicio de las horas extras con el de final de jornada
      const changeStartTime =
        parseOvertimeStartTime <= parseTime(paramsWorkingDay.exit);

      if (changeStartTime) {
        parseOvertimeStartTime = parseTime(paramsWorkingDay.exit);
      }

      // Verificar si el rango de tiempo de entrada y salida se encuentra dentro del rango de tiempo de overtime
      if (
        (parseEntryTime >= parseOvertimeStartTime &&
          parseEntryTime < parseOvertimeEndTime) ||
        (parseExitTime > parseOvertimeStartTime &&
          parseExitTime <= parseOvertimeEndTime) ||
        (parseEntryTime < parseOvertimeStartTime &&
          parseExitTime > parseOvertimeEndTime)
      ) {
        // Calcular la duración en segundos del tiempo extra
        const extraDurationSeconds =
          Math.min(parseExitTime, parseOvertimeEndTime) -
          Math.max(parseEntryTime, parseOvertimeStartTime);

        // Convertir la duración de segundos a formato de tiempo
        const extraDurationTime = parseSeconds(extraDurationSeconds);

        extraHours.push({
          // Agregar el tiempo extra al array de extraHours
          type: overtime.type,
          duration: extraDurationTime,
          surcharge: overtime.surcharge,
        });
      } else {
        // Si no hay horas extras dentro del rango de tiempo de entrada y salida, se agrega un objeto de tiempo extra con duración 00:00
        extraHours.push({
          type: overtime.type,
          duration: '00:00',
          surcharge: overtime.surcharge,
        });
      }
    }
  }

  return extraHours;
}

export function analyzeTimeRecords(
  timeLogs: Time_Log[],
  params: Params_Work_Time
): Real_Time[] {
  const realTimes: Real_Time[] = [];

  const { schedule, minTimeEntry, regime, overtime } = params;

  for (const log of timeLogs) {
    const { date, start_time } = log;

    // Obtener el día de la semana del registro
    const dayOfWeek = new Date(date).getDay();

    // Capturar el parametro de comprobacion de entrada de acuerdo al dia
    const workingDay = schedule.workingDay.find(
      (item: Working_Day) => item.weekday === dayOfWeek
    );

    // Continuar con el analisis del tiempo con respecto a la jornada
    if (workingDay) {
      // Analizar la hora de entrada de acuerdo a los parametros
      const effectiveEntryTime = analizeEntryTime(
        start_time,
        workingDay.entry,
        minTimeEntry
      );

      const duration = diffDuration(effectiveEntryTime, log.end_time);

      const extraHours = analyzeOvertime(
        effectiveEntryTime,
        log.end_time,
        regime,
        overtime,
        workingDay
      );

      const realTime: Real_Time = {
        idTimeLog: log.time_log_id,
        idEmployee: log.employee_id,
        startTime: effectiveEntryTime,
        endTime: log.end_time,
        duration: duration,
        extraHours: extraHours,
      };

      realTimes.push(realTime);
    } else {
      const duration = diffDuration(log.start_time, log.end_time);

      const realTime: Real_Time = {
        idTimeLog: log.time_log_id,
        idEmployee: log.employee_id,
        startTime: log.start_time,
        endTime: log.end_time,
        duration: duration,
        extraHours: [],
      };
    }
  }

  return realTimes;
}
