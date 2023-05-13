const express = require('express');
const bodyParser = require('body-parser');

import routerEmployees from './routes/employees';
import routerHours from './routes/hours';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/hours', routerHours);
app.use('/api/employees', routerEmployees);

app.get('/', (_, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`API de registro de horas iniciada en el puerto ${port}`);
});
