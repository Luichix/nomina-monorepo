import { diffDuration, parseTime } from 'helper';
import {
  analizeEntryTime,
  analyzeOvertime,
  analyzeTimeRecords,
  getDailyWorkDuration,
} from '../routes/helpers/analizeTIme';

const Regime = require('../database/data/regime.json');
const Overtime = require('../database/data/overtime.json');
const Schedule = require('../database/data/schedule.json');
const TimeLog = require('../database/data/time_logs.json');

const MIN_TIME_ENTRY = '00:05';
const MIN_TIME_EXIT = '00:15';

describe('Funciones de manejo de tiempo', () => {
  test('Calcular la duracion de entre dos tiempos', () => {
    const result = diffDuration('00:00:00', '01:00:00');
    expect(result).toBe('01:00:00');
  });

  test('Convertir el tiempo en segundos con ParseTIme', () => {
    const result = parseTime('00:00');
    expect(result).toBe(0);
  });

  test('Comparar el tiempo entre rangos de entrada y salida', () => {
    const entryLessMandatory = analizeEntryTime('07:00', '08:00', '05:00');
    expect(entryLessMandatory).toBe('08:00');
    const entryMajorMandatory = analizeEntryTime('09:00', '08:00', '00:05');
    expect(entryMajorMandatory).toBe('09:00');
    const entryMajorMandatoryLessForgive = analizeEntryTime(
      '08:04',
      '08:00',
      '05:00'
    );
    expect(entryMajorMandatoryLessForgive).toBe('08:00');
  });
});

describe('Funciones para el manejo de sobretiempo', () => {
  test('No se aplica el tiempo extra en los registro', () => {
    const entryTime = '08:00:00';
    const exitTime = '19:00:00';
    const paramsRegime = Regime[1];
    const paramsOvertime = Overtime;
    const paramsWorkingDay = Schedule[0].workingDay[1];
    const result = analyzeOvertime(
      entryTime,
      exitTime,
      paramsRegime,
      paramsOvertime,
      paramsWorkingDay
    );

    expect(result).toEqual({
      totalExtraHours: '00:00:00',
      extraHoursDetail: [],
    });
  });
  test('Se aplica el tiempo extra en los registro', () => {
    const entryTime = '08:00:00';
    const exitTime = '19:00:00';
    const paramsRegime = Regime[0];
    const paramsOvertime = Overtime;
    const paramsWorkingDay = Schedule[0].workingDay[1];
    const result = analyzeOvertime(
      entryTime,
      exitTime,
      paramsRegime,
      paramsOvertime,
      paramsWorkingDay
    );

    expect(result).toEqual({
      totalExtraHours: '02:00:00',
      extraHoursDetail: [
        {
          duration: '01:00:00',
          surcharge: 1.25,
          type: 'diurna',
        },
        {
          duration: '01:00:00',
          surcharge: 1.5,
          type: 'mix',
        },
        {
          duration: '00:00',
          surcharge: 1.75,
          type: 'nocturna',
        },
      ],
    });
  });
});

describe('Funciones para el analisis de los registros de tiempo', () => {
  test('Cuando la hora de entrada es menor a la hora reglamentaria', () => {
    const timeLog = [
      {
        time_log_id: 1,
        employee_id: 1,
        start_time: '07:45:00',
        end_time: '17:20:00',
        date: '2023-05-01T06:00:00.000Z',
      },
    ];

    const result = analyzeTimeRecords(timeLog, {
      overtime: Overtime,
      schedule: Schedule[0],
      minTimeEntry: MIN_TIME_ENTRY,
      minTimeExit: MIN_TIME_EXIT,
      regime: Regime[0],
    });

    expect(result).toEqual([
      {
        idEmployee: 1,
        idTimeLog: 1,
        date: '2023-05-01T06:00:00.000Z',
        startTime: '08:00',
        endTime: '17:20:00',
        duration: '09:20:00',
        restTime: '01:00',
        totalExtraHours: '00:20:00',
        extraHours: [
          { duration: '00:20:00', surcharge: 1.25, type: 'diurna' },
          { duration: '00:00', surcharge: 1.5, type: 'mix' },
          { duration: '00:00', surcharge: 1.75, type: 'nocturna' },
        ],
      },
    ]);
  });
  test('Cuando la hora de entrada es mayor a la hora reglamentaria y menor al minimo de entrada', () => {
    const timeLog = [
      {
        time_log_id: 1,
        employee_id: 1,
        start_time: '08:04:00',
        end_time: '16:20:00',
        date: '2023-05-01T06:00:00.000Z',
      },
    ];

    const result = analyzeTimeRecords(timeLog, {
      overtime: Overtime,
      schedule: Schedule[0],
      minTimeEntry: MIN_TIME_ENTRY,
      minTimeExit: MIN_TIME_EXIT,
      regime: Regime[0],
    });

    expect(result).toEqual([
      {
        idEmployee: 1,
        idTimeLog: 1,
        date: '2023-05-01T06:00:00.000Z',
        startTime: '08:00',
        endTime: '16:20:00',
        duration: '08:20:00',
        restTime: '01:00',
        totalExtraHours: '00:00:00',
        extraHours: [
          { duration: '00:00', surcharge: 1.25, type: 'diurna' },
          { duration: '00:00', surcharge: 1.5, type: 'mix' },
          { duration: '00:00', surcharge: 1.75, type: 'nocturna' },
        ],
      },
    ]);
  });
  test('Cuando la hora de entrada es mayor a la hora reglamentaria', () => {
    const timeLog = [
      {
        time_log_id: 1,
        employee_id: 1,
        start_time: '09:04:00',
        end_time: '17:00:00',
        date: '2023-05-01T06:00:00.000Z',
      },
    ];

    const result = analyzeTimeRecords(timeLog, {
      overtime: Overtime,
      schedule: Schedule[0],
      minTimeEntry: MIN_TIME_ENTRY,
      minTimeExit: MIN_TIME_EXIT,
      regime: Regime[0],
    });

    expect(result).toEqual([
      {
        idEmployee: 1,
        idTimeLog: 1,
        date: '2023-05-01T06:00:00.000Z',
        startTime: '09:04:00',
        endTime: '17:00:00',
        duration: '07:56:00',
        restTime: '01:00',
        totalExtraHours: '00:00:00',
        extraHours: [
          { duration: '00:00', surcharge: 1.25, type: 'diurna' },
          { duration: '00:00', surcharge: 1.5, type: 'mix' },
          { duration: '00:00', surcharge: 1.75, type: 'nocturna' },
        ],
      },
    ]);
  });
  test('Cuando hay sobretiempo en las horas registradas', () => {
    const timeLog = [
      {
        time_log_id: 1,
        employee_id: 1,
        start_time: '08:00:00',
        end_time: '22:00:00',
        date: '2023-05-01T06:00:00.000Z',
      },
    ];

    const result = analyzeTimeRecords(timeLog, {
      overtime: Overtime,
      schedule: Schedule[0],
      minTimeEntry: MIN_TIME_ENTRY,
      minTimeExit: MIN_TIME_EXIT,
      regime: Regime[0],
    });

    expect(result).toEqual([
      {
        idEmployee: 1,
        idTimeLog: 1,
        date: '2023-05-01T06:00:00.000Z',
        startTime: '08:00',
        endTime: '22:00:00',
        duration: '14:00:00',
        restTime: '01:00',
        totalExtraHours: '05:00:00',
        extraHours: [
          { duration: '01:00:00', surcharge: 1.25, type: 'diurna' },
          { duration: '02:00:00', surcharge: 1.5, type: 'mix' },
          { duration: '02:00:00', surcharge: 1.75, type: 'nocturna' },
        ],
      },
    ]);
  });
});

describe('Funcion para generar la duracion consolidada de horas del dia', () => {
  test('Generar el reporte consolidado de horas de un colaborador', () => {
    const timeRecordAnalized = analyzeTimeRecords(TimeLog, {
      overtime: Overtime,
      schedule: Schedule[0],
      minTimeEntry: MIN_TIME_ENTRY,
      minTimeExit: MIN_TIME_EXIT,
      regime: Regime[0],
    });

    const result = getDailyWorkDuration(timeRecordAnalized);

    expect(result).toEqual([]);
  });
});
