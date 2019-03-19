const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 5000;
const cors = require('cors');
const https = require("https")
const fs = require('fs');

var helmet = require('helmet')

const options = {

    // Ti su dobri key-evi si mislim
    //key: fs.readFileSync('./localhost/server.key'),
    //cert: fs.readFileSync('./localhost/server.crt')

    // Tu su dobri key-evi isto si mislim
    //key: fs.readFileSync('./localhost2/server-key.pem'),
    //cert: fs.readFileSync('./localhost2/server-crt.pem'),
    //ca: fs.readFileSync('./localhost2/ca-crt.pem')

    //Tu su dobri key-evi isto si mislim
    key: fs.readFileSync('./localhost3/privatekey.pem'),
    cert: fs.readFileSync('./localhost3/certificate.pem')
};


require('dotenv').config();

const PORT_ENV = process.env.PORT;

/// I need this if I use normal SQL query, without ORM pattern
// mozda bih mogao samo tako napisati
//require('./database/DB_Pepac');
//const UserRouter = require('./routes/users');

const ServerPortRouter = require('./routes/AdminRoutes');
const UserRouter = require('./routes/users');
const UserORMRouter = require('./routes/usersORM');
const AdminORMRoutes = require('./routes/AdminRoutesORM');


app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use('/', UserORMRouter);
app.use('/', AdminORMRoutes);



app.use(helmet())
// X-Powered-By header reveals unnecessary details about your application’s internal implementation.
// Looking at the value of this header, an attacker could map your application’s internal structure and plan more organized attacks
app.disable('x-powered-by')

// does two orders are set by default, that way I have commented them
//app.use(helmet.xssFilter())
//app.use(helmet.dnsPrefetchControl())

/* app.listen(PORT, function(){
    console.log('Server is running on Port: ',PORT);
    console.log('We are reading this value from .env file. Server is running on Port: ',PORT_ENV);
}); */


https.createServer(options, app).listen(PORT_ENV, function(){
    console.log('HTTPS Server is running on Port: ',PORT_ENV);
    console.log('We are reading this value from .env file. Server is running on Port: ',PORT_ENV);
});

/* https.createServer(options, function (req, res) {
    console.log("ISPISSS" + new Date()+' '+
        req.connection.remoteAddress+' '+
        req.method+' '+req.url);
    res.writeHead(200);
    res.end("hello world\n");
}).listen(443); */