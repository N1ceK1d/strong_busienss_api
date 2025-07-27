const express = require('express');
const cors = require('cors');
const router = require('./routes/index');
const { default: helmet } = require('helmet');


const app = express();

app.use(helmet())
app.use(cors());

app.use(express.json());          
app.use(express.urlencoded());  


app.use('/api', router);

app.listen(3005);