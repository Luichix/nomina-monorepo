# Microservicio de Configuración de Nómina

Este microservicio está diseñado para gestionar la configuración y parámetros de nómina de diferentes empresas. Proporciona una API que permite crear, actualizar, obtener y eliminar la configuración de nómina de cada empresa.

## Tecnologías utilizadas

- Node.js
- Express.js
- MongoDB
- TypeScript
- pnpm

## Requisitos previos

- Node.js: asegúrate de tener Node.js instalado en tu sistema. Puedes descargarlo desde [https://nodejs.org](https://nodejs.org).

## Instalación

1. Clona este repositorio en tu máquina local:

   ```shell
   gh repo clone Luichix/nomina-monorepo

   ```

2. Navega hasta el directorio del microservicio:

   ```shell
   cd apps/setting-server

   ```

3. Instala las dependencias utilizando pnpm:

   ```shell
   pnpm install

   ```

4. Configuración de la base de datos:

- Asegúrate de tener una instancia de MongoDB en ejecución.

5. Configuración del entorno:

- Crea un archivo .env en la raíz del proyecto y configura las variables de entorno necesarias. Puedes utilizar el archivo .env.example como referencia.

6. Ejecución:

- Inicia el microservicio de configuración de nómina:

  ```shell
  pnpm run dev

  ```

- El microservicio estará disponible en http://localhost:3001 por defecto, a menos que se especifique una configuración diferente.

## Uso

A continuación se describen las rutas disponibles en la API del microservicio:

- **GET /api/company/:id**: Permite obtener la configuración de nómina de una empresa específica.
- **PUT /api/company/:id**: Permite actualizar la configuración de nómina de una empresa existente.

Para más detalles sobre los parámetros y respuestas de cada ruta, consulta la documentación en el código fuente del microservicio.

## Descripción detallada de las rutas principales

A continuación se detallan los procesos ejecutados al utilizar cada ruta principal

Aquí tienes una posible estructura para configurar cada apartado en su ruta correspondiente dentro del microservicio de configuración de la empresa:

1. Configuración básica de la empresa:

   - Ruta: `/api/company/basic`
   - Métodos HTTP:
     - GET: Obtener la configuración básica de la empresa.
     - PUT: Actualizar la configuración básica de la empresa.

2. Configuración de los períodos de pago:

   - Ruta: `/api/company/payroll-periods`
   - Métodos HTTP:
     - GET: Obtener la configuración de los períodos de pago.
     - PUT: Actualizar la configuración de los períodos de pago.

3. Configuración de horarios de trabajo:

   - Ruta: `/api/company/working-hours`
   - Métodos HTTP:
     - GET: Obtener la configuración de horarios de trabajo.
     - PUT: Actualizar la configuración de horarios de trabajo.

4. Configuración de tipos de empleados:

   - Ruta: `/api/company/employee-types`
   - Métodos HTTP:
     - GET: Obtener la configuración de tipos de empleados.
     - PUT: Actualizar la configuración de tipos de empleados.

5. Configuración de deducciones y beneficios:

   - Ruta: `/api/company/deductions-benefits`
   - Métodos HTTP:
     - GET: Obtener la configuración de deducciones y beneficios.
     - PUT: Actualizar la configuración de deducciones y beneficios.

6. Configuración de días festivos:

   - Ruta: `/api/company/holidays`
   - Métodos HTTP:
     - GET: Obtener la configuración de días festivos.
     - PUT: Actualizar la configuración de días festivos.

7. Configuración de notificaciones y recordatorios:
   - Ruta: `/api/company/notifications`
   - Métodos HTTP:
     - GET: Obtener la configuración de notificaciones y recordatorios.
     - PUT: Actualizar la configuración de notificaciones y recordatorios.

Cada ruta y método HTTP corresponde a una funcionalidad específica. Puedes definir los controladores correspondientes para cada ruta y realizar las operaciones de lectura y escritura en la base de datos según sea necesario.

## Microservicio de configuración o parámetros de nómina de empresas:

1. Configuración básica de la empresa:

   - Nombre de la empresa.
   - Dirección de la empresa.
   - Información de contacto (teléfono, correo electrónico, etc.).

2. Configuración de los períodos de pago:

   - Frecuencia de los pagos (semanal, quincenal, mensual, etc.).
   - Día(s) de pago.
   - Fecha de inicio del período de pago actual.

3. Configuración de horarios de trabajo:

   - Horario de inicio y fin de la jornada laboral.
   - Horas de trabajo diarias.
   - Días laborables de la semana.
   - Horarios de descanso o pausas.

4. Configuración de tipos de empleados:

   - Categorías o roles de empleados (tiempo completo, medio tiempo, contratista, etc.).
   - Tarifas de pago por categoría.

5. Configuración de deducciones y beneficios:

   - Deducciones obligatorias (impuestos, seguros, etc.).
   - Beneficios adicionales (bonificaciones, comisiones, subsidios, etc.).
   - Fórmulas de cálculo para deducciones y beneficios.

6. Configuración de días festivos:

   - Lista de días festivos nacionales o locales.
   - Reglas especiales para el cálculo de días festivos.

7. Configuración de notificaciones y recordatorios:

   - Correo electrónico o mensajes automáticos para recordar a los empleados sobre la presentación de horas o el pago de nóminas.

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
