const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

//Middleware
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());

//routes

app.use('/auth', require('./routes/jwtAuth'));
app.use('/expenses', require('./routes/expenses'));
app.use('/income', require('./routes/income'));
app.use('/profile', require('./routes/profile'));

app.listen(process.env.PORT || 5000, () => console.log('server started'));
