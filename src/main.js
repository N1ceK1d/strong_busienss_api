const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const JSONStream = require('JSONStream');
const router = require('./routes/index');


const app = express();

app.use(express(cors()));


app.use('/api', router);

app.listen(3000);