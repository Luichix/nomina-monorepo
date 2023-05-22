import { diffDuration, parseTime } from 'helper';
import {
  analizeEntryTime,
  analyzeOvertime,
} from '../routes/helpers/analizeTIme';

const Regime = require('../database/data/regime.json');
const Overtime = require('../database/data/overtime.json');
const Schedule = require('../database/data/schedule.json');

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

    expect(result).toEqual([]);
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

    expect(result).toEqual([
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
    ]);
  });
});
