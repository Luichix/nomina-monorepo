import {
  isEntryExitConsistent,
  isValidDate,
  isValidHoursPerDay,
  isValidateNotFutureDate,
  isValidateTimeLogs,
  isValidateTimeRecordsNotOverlaped,
} from '../routes/helpers/validation';

import pool from '../database/connection';

afterAll(async () => {
  // Tear down the database connection pool after running the tests
  await pool.end(); // Close the pool and release the resources
});

// Verificar que la fecha de registro sea una fecha valida

describe('Verify if the date is valid', () => {
  test('Verify that the register date is a valid ', () => {
    const test = isValidDate('2020-01-01');
    expect(test).toBe(true);
  });

  test('Verify that the register date is an invalid ', () => {
    const test = isValidDate('01-01-2020');
    expect(test).toBe(false);
  });
});

// Verificar que la fecha del registro no sea una fecha futura

describe('Verify the time of the date', () => {
  test('Verify that the date does not is in the future', () => {
    const test = isValidateNotFutureDate('2023-05-18');
    expect(test).toBe(true);
  });

  test('Verify that the date is in the future', () => {
    const test = isValidateNotFutureDate('2025-12-01');
    expect(test).toBe(false);
  });

  test('Verify is that date is valid', () => {
    const test = isValidateNotFutureDate('01-01-2020');
    expect(test).toBe(false);
  });
});

// Verificar que la hora de entrada y salida sean coherentes

describe('Verify that the entry and exit time are coherent', () => {
  test('The entry time is greater than the exit time', () => {
    const test = isEntryExitConsistent('17:00', '08:00');
    expect(test).toBe(false);
  });

  test('The entry time is less than the exit time', () => {
    const test = isEntryExitConsistent('08:00', '17:00');
    expect(test).toBe(true);
  });

  test('The entry time is equal to the exit time', () => {
    const test = isEntryExitConsistent('08:00', '08:00');
    expect(test).toBe(false);
  });

  test('The entry or exit time are not a good format hh:mm', () => {
    const test = isEntryExitConsistent('08:00:00', '17:00');
    expect(test).toBe(false);
  });
});

// Realizar validaciones de los registros de horas de acuerdo a los parametros

describe('Verify the time records are consistent with the parameters', () => {
  test('Verify the total time is between into min and max time', async () => {
    const test = await isValidHoursPerDay(
      { entryTime: '08:00', exitTime: '17:00' },
      { minHoursPerDay: '04:00', maxHoursPerDay: '12:00' }
    );
    expect(test).toBe(true);
  });

  test('Verify the total time is less than the min time', async () => {
    const test = await isValidHoursPerDay(
      { entryTime: '08:00', exitTime: '09:00' },
      { minHoursPerDay: '02:00', maxHoursPerDay: '12:00' }
    );
    expect(test).toBe(false);
  });

  test('Verify the total time is greater than the max time', async () => {
    const test = await isValidHoursPerDay(
      { entryTime: '08:00', exitTime: '19:00' },
      { minHoursPerDay: '04:00', maxHoursPerDay: '10:00' }
    );
    expect(test).toBe(false);
  });
});

// Validar que los grupos de nuevos registros de horas son consistentes sin superposiciones

describe('Verify that the time records are not overlapped', () => {
  test('Verify this group time records have some registers overlapped', () => {
    const timeLogs = [
      {
        employee_id: '01',
        date: '2023-01-01',
        start_time: '08:00',
        end_time: '17:00',
      },
      {
        employee_id: '01',
        date: '2023-01-01',
        start_time: '17:00',
        end_time: '19:00',
      },
    ];
    const test = isValidateTimeRecordsNotOverlaped(timeLogs);
    expect(test).toBe(false);
  });
  test('Verify this group time records have not any registers overlapped', () => {
    const timeLogs = [
      {
        employee_id: '01',
        date: '2023-01-01',
        start_time: '08:00',
        end_time: '12:00',
      },
      {
        employee_id: '01',
        date: '2023-01-01',
        start_time: '13:00',
        end_time: '19:00',
      },
    ];
    const test = isValidateTimeRecordsNotOverlaped(timeLogs);
    expect(test).toBe(true);
  });
});

// Validar que los registros nuevos no se sobrepongan sobre los registros de la base de datos

describe('Verify that overlapped records are not in the database', () => {
  test('Verify that the new records are not overlapped with the old ones', async () => {
    const timeLogs = [
      {
        startTime: '09:00:00',
        endTime: '13:00:00',
        date: '2023-05-01T06:00:00.000Z',
      },
      {
        startTime: '11:00:00',
        endTime: '18:00:00',
        date: '2023-05-02T06:00:00.000Z',
      },
    ];

    const employee_id = 1;

    const test = await isValidateTimeLogs(employee_id, timeLogs);
    expect(test.length).toBe(2);
  });
  // test('Verify that the new records are overlapped with the old ones', async () => {
  //   const timeLogs = [
  //     {
  //       startTime: '13:00:00',
  //       endTime: '14:00:00',
  //       date: '2023-05-01T06:00:00.000Z',
  //     },
  //     {
  //       startTime: '14:00:00',
  //       endTime: '15:00:00',
  //       date: '2023-05-02T06:00:00.000Z',
  //     },
  //   ];

  //   const employee_id = 1;

  //   const test = await isValidateTimeLogs(employee_id, timeLogs);
  //   expect(test.length).toBe(0);
  // });
});

// Validar que los registros nuevos no sean duplicados de los existentes
