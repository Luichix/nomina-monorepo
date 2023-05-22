/* --------------------------------- Regime --------------------------------- */

export interface Regime {
  id: number;
  name: string;
  extras: boolean;
  compensatory: boolean;
}

/* -------------------------------- Overtime -------------------------------- */
interface Extra {
  type: string;
  start: string;
  end: string;
  surcharge: number;
}

export type Overtime = Extra[];

/* -------------------------------- Schedule -------------------------------- */

export interface Working_Day {
  weekday: number;
  day: string;
  entry: string;
  exit: string;
  rest: string;
  hours: string;
}

export interface Schedule {
  id: number;
  name: string;
  description: string;
  workingDay: Working_Day[];
  workingHours: string;
}
