var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render(__dirname+'/frontend/index.js', {title: 'Express'});
    //res.sendFile(path.join(__dirname+'/frontend/index.js'));
});

router.get('/proba', function (req, res, next) {
    //var http = require('http');
    var uc = require('upper-case');

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(uc("Hello World!"));
    res.end();
});

router.get('/sendEmail', function (req, res, next) {

    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'brodarnikola7@gmail.com',
            pass: 'wbistnszlmnxeotd'
        }
    });

    var mailOptions = {
        from: 'brodarnikola7@gmail.com',
        to: 'brodarnikola9@gmail.com',
        subject: 'Sending Email using Node.js',
        html: '<h1>Welcome</h1><p>That was easy!</p>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.end();
        }
    });
});

router.get('/izlistajDatoteke', function (req, res, next) {

    var fs = require('fs');
    var path = require('path');
// In newer Node.js versions where process is already global this isn't necessary.
    var process = require("process");
    //C:\Users\Brc\Desktop\NodeJS\TestniProjekt1\datoteke
   /* var moveFrom = "C:/Users/Brc/Desktop/NodeJS/TestniProjekt1/datoteke/";
    var moveTo = "C:/Users/Brc/Desktop/NodeJS/TestniProjekt1/datoteke/01.08.2018"

    // Loop through all the files in the temp directory
    fs.readdir(moveFrom, function (err, files) {
        /!* if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        } *!/

        files.forEach(function (file, index) {
            // Make one pass and make the file complete
            var fromPath = path.join(moveFrom, file);
            var toPath = path.join(moveTo, file);

            fs.stat(fromPath, function (error, stat) {
                if (error) {
                    console.error("Error stating file.", error);
                    return;
                }

                if (stat.isFile())
                    console.log("'%s' is a file.", fromPath);
                else if (stat.isDirectory()) {
                    console.log("'%s' is a directory.", fromPath);
                    fs.readdir(fromPath, (err, files1) => {
                        files1.forEach(file1 => {
                            console.log(file1);
                        });
                    });
                }
                /!* fs.rename(fromPath, toPath, function (error) {
                    if (error) {
                        console.error("File moving error.", error);
                    }
                    else {
                        console.log("Moved file '%s' to '%s'.", fromPath, toPath);
                    }
                });  *!/
            });
        });
    });*/

    console.log(getFiles('C:/Users/Brc/Desktop/NodeJS/TestniProjekt1/datoteke/'))

    res.end();
});

function getFiles (dir, files_) {

    var fs = require('fs');
    var path = require('path')

    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];

        var ext = path.extname(files[i]);

        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else if ( ext == ".js" ) {
            files_.push(name);
        }
    }
    return files_;
}



router.get('/mysqlConnection', function (req, res, next) {

    var mysql = require('mysql');

    var con = mysql.createConnection({
        host: "localhost",
        user: "rootLetala",
        password: "natalija21",
        database: "nodeJsTestnaBaza"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    var sql = "INSERT INTO customers (name, address) VALUES ?";
    var values = [
        ['John', 'Highway 71'],
        ['Peter', 'Lowstreet 4'],
        ['Amy', 'Apple st 652'],
        ['Hannah', 'Mountain 21'],
        ['Michael', 'Valley 345'],
        ['Sandy', 'Ocean blvd 2'],
        ['Betty', 'Green Grass 1'],
        ['Richard', 'Sky st 331'],
        ['Susan', 'One way 98'],
        ['Vicky', 'Yellow Garden 2'],
        ['Ben', 'Park Lane 38'],
        ['William', 'Central st 954'],
        ['Chuck', 'Main Road 989'],
        ['Viola', 'Sideway 1633']
    ];
    con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("multiple record inserted: "  +result.affectedRows);
    });
    res.end();
});

module.exports = router;
