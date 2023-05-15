# Microservicio de Registro de Horas

Este microservicio está diseñado para gestionar el registro de horas trabajadas por los empleados. Proporciona una API que permite realizar operaciones como registrar horas, obtener registros de horas, actualizar registros existentes y eliminar registros.

## Tecnologías utilizadas

- Node.js
- Express.js
- PostgreSQL
- TypeScript
- pnpm

## Requisitos previos

- Node.js: asegúrate de tener Node.js instalado en tu sistema. Puedes descargarlo desde [https://nodejs.org](https://nodejs.org).

## Instalación

1. Clona este repositorio en tu máquina local:

   ```shell
   git clone <URL del repositorio>

   ```

2. Navega hasta el directorio del microservicio:

   ```shell
   cd registro-horas

   ```

3. Instala las dependencias utilizando pnpm:

   ```shell
   pnpm install

   ```

4. Configuración de la base de datos:

- Asegúrate de tener una instancia de PostgreSQL en ejecución.
- Crea una base de datos para el microservicio de registro de horas.

5. Configuración del entorno:

- Crea un archivo .env en la raíz del proyecto y configura las variables de entorno necesarias. Puedes utilizar el archivo .env.example como referencia.

6. Ejecución:

- Inicia el microservicio de registro de horas:

  ```shell
  pnpm run dev

  ```

- El microservicio estará disponible en http://localhost:3000 por defecto, a menos que se especifique una configuración diferente.

## Uso

A continuación se describen las rutas disponibles en la API del microservicio:

- **POST /api/hours**: Permite registrar las horas trabajadas por un empleado en un día.
- **GET /api/hours**: Permite obtener los registros de horas trabajadas de un empleado en un rango de fechas.
- **PUT /api/hours/:id**: Permite actualizar un registro de horas existente.
- **DELETE /api/hours/:id**: Permite eliminar un registro de horas existente.

Para más detalles sobre los parámetros y respuestas de cada ruta, consulta la documentación en el código fuente del microservicio.

## Descripción detallada de las rutas principales

A continuación se detallan los procesos ejecutados al utilizar cada ruta principal

1. Proceso de obtención de registros de horas:

   - Endpoint: `GET /api/hours`
   - Descripción: Permite obtener los registros de horas trabajadas de un empleado en un rango de fechas.
   - Parámetros de entrada:
     - `employeeId`: ID del empleado.
     - `startDate`: Fecha de inicio del rango (en formato YYYY-MM-DD).
     - `endDate`: Fecha de fin del rango (en formato YYYY-MM-DD).
   - Acciones a realizar:
     - Recuperar los registros de horas correspondientes al empleado y al rango de fechas especificado desde la base de datos.
     - Retornar los registros de horas obtenidos.

2. Proceso de registro de horas:

   - Endpoint: `POST /api/hours`
   - Descripción: Permite registrar las horas trabajadas por un empleado en un determinado día.
   - Parámetros de entrada:
     - `employeeId`: ID del empleado.
     - `date`: Fecha en la que se registran las horas (en formato YYYY-MM-DD).
     - `entryTime`: Hora de entrada (en formato HH:mm).
     - `exitTime`: Hora de salida (en formato HH:mm).
   - Validaciones a realizar:
     - Verificar que el empleado exista y esté activo.
     - Validar que la fecha sea válida y no esté en el futuro.
     - Validar que las horas de entrada y salida sean coherentes.
     - Validar que no existan registros duplicados para la misma fecha y hora.
     - Validar que los registros de tiempo nuevos no se solapen con los registros existentes.
     - Validar que los registros estén dentro del periodo de pago actual.
   - Acciones a realizar:
     - Almacenar el registro de horas en la base de datos.
     - Realizar cálculos adicionales si es necesario, como calcular horas extras, descuentos, etc.

3. Proceso de actualización de registros de horas:

   - Endpoint: `PUT /api/hours/:id`
   - Descripción: Permite actualizar un registro de horas existente.
   - Parámetros de entrada:
     - `id`: ID del registro de horas a actualizar.
     - `entryTime`: Hora de entrada actualizada (opcional).
     - `exitTime`: Hora de salida actualizada (opcional).
   - Validaciones a realizar:
     - Verificar que el registro de horas exista y pertenezca al empleado correspondiente.
     - Validar que las horas de entrada y salida actualizadas sean coherentes.
     - Validar que los registros de tiempo actualizados no se solapen con otros registros existentes.
   - Acciones a realizar:
     - Actualizar el registro de horas en la base de datos con los nuevos valores proporcionados.

4. Proceso de eliminación de registros de horas:

   - Endpoint: `DELETE /api/hours/:id`
   - Descripción: Permite eliminar un registro de horas existente.
   - Parámetros de entrada:
     - `id`: ID del registro de horas a eliminar.
   - Acciones a realizar:
     - Eliminar el registro de horas correspondiente de la base de datos.

Estos son algunos de los procesos y rutas comunes para el microservicio de registro de horas. Puedes adaptarlos según tus necesidades específicas y los requisitos de tu sistema.

## Contribución

Si deseas contribuir a este proyecto, ¡eres bienvenido! Puedes hacerlo siguiendo estos pasos:

1. Crea un fork de este repositorio.
2. Crea una rama con el nombre de tu función o mejora: git checkout -b nombre-de-la-rama.
3. Realiza tus cambios y realiza los commits correspondientes: git commit -m "Descripción de los cambios".
4. Envía tus cambios al repositorio remoto: git push origin nombre-de-la-rama.
5. Crea una solicitud de extracción en GitHub.

## Licencia

Este proyecto está bajo la Licencia MIT.

## Contacto

Si tienes alguna pregunta, sugerencia o comentario, no dudes en contactarme.

¡Gracias por tu interés en el microservicio de registro de horas! Esperamos que este README te haya proporcionado una visión general del proyecto y te haya ayudado a comenzar. Si tienes alguna otra pregunta, no dudes en hacerla. ¡Buena suerte con tu desarrollo!
