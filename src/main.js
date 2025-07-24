const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const JSONStream = require('JSONStream');

const app = express();

app.use(express(cors()));


app.listen(3000);