const express = require('express');
const bodyParser = require('body-parser');

import routerHours from './routes/hours';
import routerEmployees from './routes/hours2';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/hours', routerHours);
app.use('/api/employees', routerEmployees);

app.get('/', (_, res) => {
  res.send('Time Record Micro Service');
});

app.listen(port, () => {
  console.log(`API Time Record - Started on port ${port} 🚀`);
});
