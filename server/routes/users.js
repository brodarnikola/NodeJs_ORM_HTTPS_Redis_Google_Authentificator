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

router.post('/forgotUserPassword', async function (req, res, next) {

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });
    //console.log("loginUser da li ce uci");
    var requestObj = {
        email: req.body.email
    }

    let correctEmail = requestObj.email;

    let pool = require('../database/DB_Pepac.js');

    let sql = "SELECT id, username, password, email FROM users  WHERE email = '" + correctEmail + "'";

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
                expiresIn: '12h',  // 12 hours
            },
            (err, emailToken) => {

                //getAppUrl() + "/changePassword?id=" +
                //user.getId() + "&token=" + token;

                // moram SKUŽITI KAK DODATI VIŠE PARAMETRI.. TREBAM POSLATI 2 PARAMETRE, ID od USERA i TOKEN
                //const url = `http://localhost:3000/changePassword?id=${result[0].id}&token=${emailToken}`;
                const url = `http://localhost:3000/changePassword/${emailToken}`;

                transporter.sendMail({
                    to: result[0].email,
                    subject: 'Forgot password email',
                    html: `Please click this email to confirm your forgot password email: <a href="${url}">${url}</a>`,
                });
            },
        );
        return res.status(200).json({
            success: true,  // 'Welcome to the JWT Auth'
            message: "One more token has been send succesfully"
            //token: JWTToken
        });

        //console.log("result je: " + result[0].username + " aaaa: "  + result.toString()  + " ddd: " ++ result)
        //res.send(result)
    } catch (err) {

        //console.log("loginUser da li ce uci 333" + err);
        //throw new Error(err)
        res.send(new Error(err))
    }
});

router.post('/readforgotPasswordToken/:token', async function (req, res, next) {

    let userId

    // TODO: If token has expired, then I want to send response, to user that token has expired
    // let decodedToken = jwt.decode(req.params.token, config.secret);

    try {
        userId = jwt.verify(req.params.token, config.secret);

        // check how many rows are affected with this update sql query
        console.log("ispis je: " + userId.id)

        return res.json({
            success: true,
            id: userId.id,
            message: 'Token is valid'
        });
    } catch (error) {
        //res.send(new Error(error))
        //res.send(error);
        //console.log("user id je: ==> " + userId.id);

        // TODO: If token has expired, then I want to send response, to user that token has expired
        return res.json({
            success: false,
            message: 'Token has expired'
        });
    }

});

router.post('/updateUserPassword', async function (req, res, next) {

    //console.log("loginUser da li ce uci");
    var requestObj = {
        passwordFirstValue: req.body.passwordFirstValue,
        userId: req.body.userId
    }

    let correctPassword = requestObj.passwordFirstValue;
    let correctUserId = requestObj.userId;

    let pool = require('../database/DB_Pepac.js');

    try {

        let sql = "UPDATE users " +
            "SET password = '" + correctPassword + "' " +
            " WHERE  id = '" + correctUserId + "'";

        let result;
        await pool.query(sql).then(rows => {
            result = rows;
        })

        // check how many rows are affected with this update sql query
        console.log("ispis je: " + result.affectedRows)

        return res.json({
            success: true,
            message: 'User password has been successfully updated'
        });
    } catch (error) {
        //res.send(new Error(error))
        //res.send(error);
        //console.log("user id je: ==> " + userId.id);
        return res.json({
            success: false,
            message: 'User password did not successfully updated'
        });
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
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
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
                expiresIn: '10s', // 12 hours
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

        // AKO ŽELIMO REDIREKTATI USERA, TO MOŽEMO NAPRAVITI NA NAČIN DA
        // 1) dodamo usera,
        // 2) zatim njegovu rolu i to sve povezali
        // 3) tek onda želimo preusmjeriti usera na login page
        // PREUSMJERAVANJE RADIMO U "SignupComponent.js" datoteci
        // VAŽNO JE STAVITI zAGRADE "{}" nakon "res =>"

        await res.status(200).json({
            success: true,  // 'Welcome to the JWT Auth'
            message: "Now you just need to confirm token"
            //token: JWTToken
        });
    } catch (err) {
        throw new Error(err)
    }

});


router.get('/confirmation/:token',  /* middleware.checkToken, */  async function (req, res, next) {

    let userId

    // if token has expired, I need to get user id
    let decodedToken = jwt.decode(req.params.token, config.secret);

    try {
        userId = jwt.verify(req.params.token, config.secret);

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
        //let getUserId = userId.id;
        //console.log("user id je: ==> " + userId.id);
        return res.json({
            success: false,
            id: decodedToken.id,
            message: 'Token has expired'
        });
    }

});


router.post('/sendOneMoreToken', async function (req, res, next) {

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    var requestObj = {
        userId: req.body.userId
    }

    let correctUserId = requestObj.userId;
    let pool = require('../database/DB_Pepac.js');

    let sql = "SELECT id, username, password, email FROM  users  WHERE id = '" + correctUserId + "'";

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
                expiresIn: '10s',  // 12 hours
            },
            (err, emailToken) => {
                const url = `http://localhost:3000/confirmation/${emailToken}`;

                transporter.sendMail({
                    to: result[0].email,
                    subject: 'One more token send',
                    html: `Please click this email to confirm your one more token email: <a href="${url}">${url}</a>`,
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
