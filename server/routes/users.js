var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
var config = require('../auth/config'); // get our config file

const middleware = require('../auth/middleware');

const nodemailer = require('nodemailer');


router.post('/loginUser', async function (req, res, next) {

    //console.log("loginUser da li ce uci");
    var requestObj = {
        username: req.body.username,
        password: req.body.password
    }

    let correctUsername = requestObj.username;
    let correctPassword = requestObj.password;
    let pool = require('../database/DB_Pepac.js');

    let sql = "SELECT id, username, password, email FROM users  WHERE username = '" + correctUsername
        + "' AND password = '" + correctPassword + "' AND enabled = '1'";

    try {

        let result;
        await pool.query(sql).then(rows => {
            result = rows;
        })

        if (result) {
            const JWTToken = jwt.sign({
                    id: result[0].id
                },
                config.secret,
                {
                    expiresIn: '12h'  // 12 hours
                });
            return res.status(200).json({
                success: true,  // 'Welcome to the JWT Auth'
                token: JWTToken,
                currentUser: result[0]
            });
        }

        //console.log("result je: " + result[0].username + " aaaa: "  + result.toString()  + " ddd: " ++ result)
        //res.send(result)
    } catch (err) {

        //console.log("loginUser da li ce uci 333" + err);
        //throw new Error(err)
        res.send(new Error(err))
    }
});

router.post('/user/me', async function (req, res, next) {

    var requestObj = {
        username: req.body.username
    }

    let correctUsername = requestObj.username;

    let pool = require('../database/DB_Pepac.js');

    let sql = "SELECT username, password, email FROM users  WHERE username = '" + correctUsername + "'";
    try {
        // 1 nacin
        let result = await pool.query(sql)

        // 2 nacin
        /* let result;
        await pool.query(sql).then(rows => {
            result = rows;
        }) */

        //console.log("result je: " + result[0].username + " aaaa: "  + result.toString())
        res.send(result)
    } catch (err) {
        throw new Error(err)
    }
});


router.post('/checkPictureComponent', middleware.checkToken, async function (req, res, next) {

    return res.status(200).json({
        success: true
    });
});


router.post('/checkIfUsernameOrEmailExists', async function (req, res, next) {

    var requestObj = {
        username: req.body.username,
        email: req.body.email
    }

    let correctUsername = requestObj.username;
    let correctEmail = requestObj.email;
    let pool = require('../database/DB_Pepac.js');

    let sql = "SELECT username, email FROM  users  WHERE username = '" + correctUsername
        + "' OR email = '" + correctEmail + "'";
    try {
        let result = await pool.query(sql)
        //console.log("result je: " + result.username + " aaaa: "  + result.toString())
        /* await pool.query(sql, function (err, result, fields) {
           if (err) throw err;
           //console.log(result);
           console.log(result.length);

            return callback(result.length);
           // result.send(result.length)
       }); */

        /* const result = await connection.query('select height from users where pin=1100');

        console.log(result[0].height);
        return result[0].height; */

        //console.log(result.length);
        return result.length
        //await console.log("result je: " + result + " aaaa: "  + result.toString())
        //res.send(result.rowsAffected)
    } catch (err) {
        throw new Error(err)
    }
});

router.post('/signUpUser', async function (req, res, next) {

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "brodarnikola7@gmail.com",
            pass: "wbistnszlmnxeotd",
        },
    });

    var requestObj = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        codeForAdmin: req.body.codeForAdmin
    }

    let correctName = requestObj.name;
    let correctUsername = requestObj.username;
    let correctEmail = requestObj.email;
    let correctPassword = requestObj.password;

    let correctSifra
    let roleId
    if (requestObj.codeForAdmin == "natalija21") {
        correctSifra = 0
        roleId = 1
    }
    else {
        correctSifra = 0
        roleId = 2
    }

    // I need this, if I use databaseFunctions
    //const pool = pool;

    let pool = require('../database/DB_Pepac.js');

    let sql1 = "INSERT INTO users ( email, name, password, username, enabled ) " +
        " VALUES ( '" + correctEmail + "', '" + correctName + "', '" + correctPassword + "' , " +
        " '" + correctUsername + "', '" + correctSifra + "')";

    try {
        let result = await pool.query(sql1);  //insertNewUser(pool, sql1);
        console.log("result je: " + result.insertId + " broj redaka: " + result.affectedRows)

        let sql2 = "INSERT INTO user_roles ( user_id, role_id ) " +
            " VALUES ( '" + result.insertId + "', '" + roleId + "')";

        await pool.query(sql2);

        // async email, we are not waiting for response
        // so that means it is going below, to other lines of code
        jwt.sign(
            {
                id: result.insertId
            },
            config.secret,
            {
                expiresIn: '1h', // 1 hour
            },
            (err, emailToken) => {
                const url = `http://localhost:3000/confirmation/${emailToken}`;

                transporter.sendMail({
                    to: correctEmail,
                    subject: 'Confirm Email',
                    html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
                });
            },
        );

        //res.send(result.affectedRows)
        // AKO ŽELIMO REDIREKTATI USERA, TO MOŽEMO NAPRAVITI NA NAČIN DA
        // 1) dodamo usera,
        // 2) zatim njegovu rolu i to sve povezali
        // 3) tek onda želimo preusmjeriti usera na login page
        // PREUSMJERAVANJE RADIMO U "SignupComponent.js" datoteci
        await res.send(result.rowsAffected)

    } catch (err) {
        throw new Error(err)
    }

});


router.get('/confirmation/:token', /* middleware.checkToken, */ async function (req, res, next) {

    try {
        const userId = jwt.verify(req.params.token, config.secret);

        let pool = require('../database/DB_Pepac.js');

        let sql = "UPDATE users " +
            "SET enabled = '1' " +
            "WHERE  id = '" + userId.id + "'";

        let result;
        await pool.query(sql).then(rows => {
            result = rows;
        })

        // check how many rows are affected with this update sql query
        console.log("ispis je: " + result.affectedRows)

        return res.json({
            success: true,
            message: 'Token is valid'
        });
    } catch (error) {
        //res.send(new Error(error))
        //res.send(error);
        return res.json({
            success: false,
            message: 'Token has expired'
        });
    }

});


router.post('/sendOneMoreToken', async function (req, res, next) {

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "brodarnikola7@gmail.com",
            pass: "wbistnszlmnxeotd",
        },
    });

    var requestObj = {
        username: req.body.username,
        password: req.body.password
    }

    let correctUsername = requestObj.username;
    let correctPassword = requestObj.password;
    let pool = require('../database/DB_Pepac.js');

    let sql = "SELECT id, username, password, email FROM  users  WHERE username = '" + correctUsername
        + "' AND password = '" + correctPassword + "'";

    try {

        let result;
        await pool.query(sql).then(rows => {
            result = rows;
        })

        jwt.sign(
            {
                id: result[0].id
            },
            config.secret,
            {
                expiresIn: '1h',  // 1 hour
            },
            (err, emailToken) => {
                const url = `http://localhost:3000/confirmation/${emailToken}`;

                transporter.sendMail({
                    to: result[0].email,
                    subject: 'Confirm Email',
                    html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
                });
            },
        );
        return res.status(200).json({
            success: true,  // 'Welcome to the JWT Auth'
            message: "One more token has been send succesfully"
            //token: JWTToken
        });
    } catch (err) {

        //console.log("loginUser da li ce uci 333" + err);
        //throw new Error(err)
        res.send(new Error(err))
    }
});


module.exports = router;
