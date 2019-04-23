var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
var config = require('../auth/config'); // get our config file

const middleware = require('../auth/middleware');
const loginMiddleware = require('../auth/loginMiddleware')
const forgotPasswordMiddleware = require('../auth/forgotPasswordMiddleware')

const nodemailer = require('nodemailer');

const Sequelize = require('sequelize')
const sequelize = new Sequelize('proba_orm', 'rootLetala', 'natalija21', {
    dialect: 'mysql'
});
const {User_OLD, Roles} = require('../database/sequelize')
const SequelizeOperator = Sequelize.Op;

// for securing user password into hash password
const bcrypt = require('bcrypt');




/// All of this frameworks, modules, var are for QR_CODE SCAN
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');

////// ------------ All of this frameworks, modules, var are for QR_CODE SCAN, on login confirmation //////


/// All of this frameworks, modules, var are for SMS CONFIRMATION ON LOGIN

/* test key ===> MESSAGEBIRD_API_KEY = roDkv0tJXkFsmBrsgxAQkc0zf
live key ===> MESSAGEBIRD_API_KEY = G08gwWaIGaSGy90AvPRwqWqW5 */
require('dotenv').config();
var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);


router.post('/twofactor/setup', async function (req, res, next) {

    const secret = speakeasy.generateSecret({length: 10});
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {

        return res.json({
            message: 'Verify OTP',
            tempSecret: secret.base32,
            dataURL: data_url,
            otpURL: secret.otpauth_url
        });
    });
});


router.post('/twofactor/verify_QR_enabled', async function (req, res) {

    var requestObj = {
        id: req.body.userId
    }

    let transaction;
    let result;

    try {
        // get transaction
        transaction = await sequelize.transaction();

        await User_OLD.findOne({
            where: {id: requestObj.id},
            attributes: ['id', 'name', 'secret_key'],
            transaction
            })
            .then(user => {
                result = user
            })

        // commit
        await transaction.commit();

    } catch (err) {
        // Rollback transaction if any errors were encountered
        if (err) await transaction.rollback();
        return res.status(400).json({
            success: false,
            message: "Wrong QR CODE"
        });
    }

    var verified = speakeasy.totp.verify({
        secret: result.dataValues.secret_key, //secret of the logged in user
        encoding: 'base32',
        token: req.body.qrcode
    });

    const JWTToken = jwt.sign({
            id: result.dataValues.id
        },
        config.secret,
        {
            expiresIn: '7s'  // 12 hours
        });

    if (verified) {

        return res.status(200).json({
            success: true,
            token: JWTToken,
            message: "You have successufully logged in"
        });
    }
    return res.status(400).json({
        success: false,
        message: "Wrong QR CODE"
    });
});


router.post('/twofactor/verify', async function (req, res) {

    var verified = speakeasy.totp.verify({
        secret: req.body.secret_key, //secret of the logged in user
        encoding: 'base32',
        token: req.body.qrcode
    });

    var requestObj = {
        id: req.body.userId
    }

    let resultORM_1
    await User_OLD.findOne({
        where: {id: requestObj.id}
    })
        .then(user => {
            user.update({
                secret_key: req.body.secret_key,
                enabledQR: 1
            });
            resultORM_1 = user
        })
        .catch(err => {
            console.log('problem updating user and communicating with db');
            //res.status(500).json(err);
        });

    const JWTToken = jwt.sign({
            id: resultORM_1.dataValues.id
        },
        config.secret,
        {
            expiresIn: '12h'  // 12 hours
        });

    if (verified) {
        return res.status(200).json({
            success: true,
            token: JWTToken,
            message: "You have successufully logged in"
        });
    }

    return res.status(400).json({
        success: false,
        message: "Invalid token or QR_CODE, verification failed"
    });
});


router.post('/sms/insertPhone', function (req, res) {
    var number = req.body.phoneNumber;
    messagebird.verify.create(number, {
        originator: '+3850996787773',
        template: 'Your verification code is %token.'
    }, function (err, response) {
        if (err) {
            console.log(err);
            return res.status(200).json({
                success: false,
                message: "Wrong phone number"
            });
        } else {
            console.log(response);
            return res.status(200).json({
                success: true,
                message: "We have send you verification code to your phone number",
                verificationPhoneNumber: response.id
            });
            /* res.render('step2', {
                id : response.id
            }); */
        }
    })
});


router.post('/loginUser', async function (req, res, next) {


    await loginMiddleware.loginRoute(req, res)
    //await loginRoute(req, res)

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
        enabled: req.body.codeForAdmin
    }

    let correctEmail = requestObj.email;

    let roleId
    if (requestObj.codeForAdmin == "natalija21") {
        requestObj.enabled = 0
        roleId = "ROLE_ADMIN"
    }
    else {
        requestObj.enabled = 0
        roleId = "ROLE_USER"
    }

    let resultORM_1

    const saltValue = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, saltValue);

    await User_OLD.create({

        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        enabled: requestObj.enabled,
        secret_key: 0,
        enabledQR: 0
    }).then(
        user => {
            resultORM_1 = user
            console.log(" ispis username: " + req.body.username + " password:  " + hash + " 4 ispis: " + req.body)
            console.log(" ispis username: " + req.body.username + " password:  " + hash + " 4 ispis: " + req.body)
        })

    try {

        await Roles.create({
            userId: resultORM_1.dataValues.id,
            role_name: roleId
        })
            .then(console.log(" 3 ispis: " + resultORM_1.dataValues.id + " 4 ispis: " + roleId))

        // async email, we are not waiting for response
        // so that means it is going below, to other lines of code
        jwt.sign(
            {
                id: resultORM_1.id
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
        // VAŽNO JE STAVITI ZAGRADE "{}" nakon "res =>"

        res.status(200).json({
            success: true,  // 'Welcome to the JWT Auth'
            message: "Now you just need to confirm token"
            //token: JWTToken
        });
    } catch (err) {
        console.log("greska je: " + err)
        throw new Error(err)
    }

});


router.post('/forgotUserPassword', async function (req, res, next) {

    forgotPasswordMiddleware.forgotPassword(req, res)
});

router.post('/readforgotPasswordToken/:token', async function (req, res, next) {

    forgotPasswordMiddleware.readForgotPasswordToken(req, res)
});

router.post('/updateUserPassword', async function (req, res, next) {

    forgotPasswordMiddleware.updateUserPassword(req, res)
});

router.get('/confirmation/:token', /* middleware.checkToken, */  async function (req, res, next) {

    let userId

    // if token has expired, I need to get user id
    let decodedToken = jwt.decode(req.params.token, config.secret);

    try {
        userId = jwt.verify(req.params.token, config.secret);

        await User_OLD.findOne({
            where: {id: userId.id}
            //attributes: ['enabled']
        })
            .then(user => {
                user.update({
                    enabled: '1'
                });
            })
            .catch(err => {
                console.log('problem communicating with db');
                //res.status(500).json(err);
            });
        // check how many rows are affected with this update sql query
        //console.log("ispis je: " + resultORM_1.dataValues.id + "  enabled: " + resultORM_1.dataValues.enabled)

        return res.json({
            success: true,
            message: 'Token is valid'
        });
    } catch (error) {
        //res.send(new Error(error))
        //res.send(error);
        //let getUserId = userId.id;
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


    try {

        let result

        await User_OLD.findOne({
            where: {id: correctUserId},
            attributes: ['id', 'username', 'email', 'password']
        })
            .then(user => {
                result = user
            })

        console.log("user je: " + result.dataValues.id)

        jwt.sign(
            {
                id: result.dataValues.id
            },
            config.secret,
            {
                expiresIn: '10s',  // 12 hours
            },
            (err, emailToken) => {
                const url = `http://localhost:3000/confirmation/${emailToken}`;

                transporter.sendMail({
                    to: result.dataValues.email,
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


router.post('/checkPictureComponent', middleware.checkToken, async function (req, res, next) {

    return res.status(200).json({
        success: true
    });
});


router.post('/user/me', async function (req, res, next) {

    var requestObj = {
        username: req.body.username
    }

    let correctUsername = requestObj.username;

    try {
        // 1 nacin
        let result;
        await User_OLD.findOne({
            where: {username: correctUsername},
            attributes: ['id', 'username', 'email', 'password', 'secret_key', 'enabledQR']
        })
            .then(user => {
                result = user
            })

        // 2 nacin
        /* let result;
        await pool.query(sql).then(rows => {
            result = rows;
        }) */

        //console.log("result je: " + result[0].username + " aaaa: "  + result.toString())
        return res.status(200).json({
            loggedUserData: result.dataValues  // 'Welcome to the JWT Auth'
            // message: "One more token has been send succesfully"
            //token: JWTToken
        });
        //res.send(result.dataValues)
    } catch (err) {
        throw new Error(err)
    }
});

function printValueA(numberParam) {
    console.log(" IZVRSILA FUNKCIJA BROJ 1")
    return 10 + numberParam
}

function printValueB(numberParam) {

    console.log(" IZVRSILA FUNKCIJA BROJ 2")
    return 10 + numberParam
}

function printValueC(numberParam) {

    console.log(" IZVRSILA FUNKCIJA BROJ 3")
    return 10 + numberParam
}


router.post('/getAllUsersWithRole', async function (req, res, next) {

    var requestObj = {
        userRole: req.body.userRole
    }

    let correctUserRole = requestObj.userRole;

    try {

        // 1 Primjer asinkronovog pisanja funkcije
        const [valueA, valueB, valueC] = await Promise.all([printValueA(10), printValueB(20), printValueC(30)])
        console.log("Vrijednost A je: " + valueA)
        console.log("Vrijednost B je: " + valueB)
        console.log("Vrijednost C je: " + valueC)

        // 2 Primjer asinkronovog pisanja funkcije
        /* const valueA = printValueA(10)
        const valueB = printValueB(20)
        const valueC = printValueC(30)

        const finalValueA = await valueA
        const finalValueB = await valueB
        const finalValueC = await valueC

        console.log("Vrijednost A je: " + finalValueA)
        console.log("Vrijednost B je: " + finalValueB)
        console.log("Vrijednost C je: " + finalValueC) */

        let resultORMSequelize = []

        // example of left join sql query .. combining table "roles_users" and "users"
        await Roles.findAll({
            /* Here I can add some where clause for "roles_users" table*/
            where: {role_name: correctUserRole},
            attributes: ['role_name'],
            include: [{
                model: User_OLD,
                // Here I can add some where clause for "users" table
                where: {
                    name: {
                        [SequelizeOperator.ne]: ''
                    }
                },
                attributes: ['username', 'email']
            }]
        }).then(userRoleJoin => {
            resultORMSequelize = userRoleJoin
        });

        // send only necessary data back to frontend, without stupid data
        // so that JSON is not so big, so that JSON has only necessary data
        let sendCorrectArray = [];

        for (let i = 0; i < resultORMSequelize.length; i++) {
            let userRoleObject = {
                role_name: resultORMSequelize[i].dataValues.role_name,
                username: resultORMSequelize[i].user.dataValues.username,
                email: resultORMSequelize[i].user.dataValues.email
            }
            //sendCorrectArray.push(resultORMSequelize[i].user.dataValues)
            sendCorrectArray.push(userRoleObject)
        }

        return res.status(200).json({
            success: true,
            arrayUserData: sendCorrectArray
        });
    } catch (err) {
        return res.json({
            success: false
        });
    }
});


module.exports = router;