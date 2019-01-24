const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 5000;
const cors = require('cors');
const nodemailer = require('nodemailer');


require('dotenv').config();

const PORT_ENV = process.env.PORT;


require('./database/DB_Pepac');

const ServerPortRouter = require('./routes/ServerPortRoutes');
const UserRouter = require('./routes/users');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "brodarnikola7@gmail.com",
        pass: "wbistnszlmnxeotd",
    },
});

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', ServerPortRouter);
app.use('/', UserRouter);


app.listen(PORT, function(){
    console.log('Server is running on Port: ',PORT);
    console.log('We are reading this value from .env file. Server is running on Port: ',PORT_ENV);
});