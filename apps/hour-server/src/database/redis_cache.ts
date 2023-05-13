const redis = require('redis');
import { promisify } from 'util';
import pool from './connection';

// Creamos un cliente Redis
const redisClient = redis.createClient();

// Utilizamos la función promisify para convertir los callbacks en promesas
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

// Función para obtener la información de la empresa
async function getCompanyInfo(companyId: string) {
  // Primero intentamos obtener la información de la empresa de la caché
  const cachedInfo = await getAsync(`company:${companyId}`);
  if (cachedInfo) {
    return JSON.parse(cachedInfo);
  }

  // Si la información no está en la caché, la obtenemos de la base de datos
  const dbInfo = await pool.findById(companyId);

  // Si encontramos la información en la base de datos, la almacenamos en la caché
  if (dbInfo) {
    await setAsync(`company:${companyId}`, JSON.stringify(dbInfo));
  }

  // Retornamos la información
  return dbInfo;
}

type CompanyConfig = any;

// interface Config {
//   minHoursPerDay: number;
//   maxHoursPerDay: number;
//   minHoursPerWeek: number;
//   maxHoursPerWeek: number;
//   minHoursPerFortnight: number;
//   maxHoursPerFortnight: number;
// }

// async function getConfig(companyId: number): Promise<Config> {
//   const client = await pool.connect();
//   try {
//     const result = await client.query(
//       'SELECT min_hours_per_day, max_hours_per_day, min_hours_per_week, max_hours_per_week, min_hours_per_fortnight, max_hours_per_fortnight FROM company_config WHERE company_id = $1',
//       [companyId]
//     );
//     if (result.rowCount === 0) {
//       throw new Error('Company configuration not found');
//     }
//     const row = result.rows[0];
//     return {
//       minHoursPerDay: row.min_hours_per_day,
//       maxHoursPerDay: row.max_hours_per_day,
//       minHoursPerWeek: row.min_hours_per_week,
//       maxHoursPerWeek: row.max_hours_per_week,
//       minHoursPerFortnight: row.min_hours_per_fortnight,
//       maxHoursPerFortnight: row.max_hours_per_fortnight,
//     };
//   } finally {
//     client.release();
//   }
// }

// Crear cliente Redis
// const redisClient = redis.createClient({
//   host: 'localhost',
//   port: 6379,
// });

// Función getConfig para obtener la configuración de la empresa
async function getConfig(companyId: string): Promise<CompanyConfig> {
  return new Promise((resolve, reject) => {
    // Buscar en caché
    redisClient.get(`config-${companyId}`, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      if (data) {
        resolve(JSON.parse(data));
      } else {
        // Si no existe en caché, buscar en la base de datos
        // Si existe en caché, devolver los datos en formato JSON
        const query = `SELECT * FROM company_config WHERE company_id = '${companyId}'`;
        pool.query(query, (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            // Si no se encuentra la configuración en la base de datos, devolver un error
            reject(
              new Error(
                `No se encontró la configuración de la empresa ${companyId}`
              )
            );
          } else {
            // Si se encuentra en la base de datos, almacenar en caché y devolver los datos
            const config = results[0];
            const configJson = JSON.stringify(config);
            redisClient.set(`config-${companyId}`, configJson);
            resolve(config);
          }
        });
      }
    });
  });
}

export default getCompanyInfo;
