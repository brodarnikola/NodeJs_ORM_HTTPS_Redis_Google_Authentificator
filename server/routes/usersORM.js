var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
var config = require('../auth/config'); // get our config file

const middleware = require('../auth/middleware');

const nodemailer = require('nodemailer');

const Sequelize = require('sequelize')
const sequelize = new Sequelize('proba_orm', 'rootLetala', 'natalija21', {
    dialect: 'mysql'
});
const {User_OLD, Roles} = require('../database/sequelize')
const SequelizeOperator = Sequelize.Op;

// for securing user password into hash password
const bcrypt = require('bcrypt');


// All of this frameworks, modules, const are for preventing brute force attack
const redis = require('redis');
const {RateLimiterRedis} = require('rate-limiter-flexible');
const redisClient = redis.createClient({
    enable_offline_queue: false,
});

const maxWrongAttemptsByIPperDay = 3;
const maxConsecutiveFailsByUsernameAndIP = 3;
const maxWrongAttemptsByUsernamePerDay = 3;

const limiterSlowBruteByIP = new RateLimiterRedis({
    redis: redisClient,
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay,
    duration: 15 * 1,
    blockDuration: 30 * 1, // Block for 30 seconds, if 3 wrong attempts are done in 15 seconds
});

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
    redis: redisClient,
    keyPrefix: 'login_fail_consecutive_username_and_ip',
    points: maxConsecutiveFailsByUsernameAndIP,
    duration: 15 * 1, // Store number for 90 days since first fail
    blockDuration: 30 * 1, // Block for 30 seconds, if 3 wrong attempts are done in 15 seconds
});

const limiterSlowBruteByUsername = new RateLimiterRedis({
    redis: redisClient,
    keyPrefix: 'login_fail_username_per_day1',
    points: maxWrongAttemptsByUsernamePerDay,
    duration: 15 * 1,
    blockDuration: 30 * 1, // Block for 30 seconds, if 3 wrong attempts are done in 15 seconds
});

const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

////// ------------ All of this frameworks, modules, const are for preventing brute force attack, on login confirmation //////


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
        message: "Invalid toke or QR_CODE, verification failed"
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


async function loginRoute(req, res) {
    const ipAddr = req.connection.remoteAddress;

    const usernameIPkey = getUsernameIPkey(req.body.email, ipAddr);
    //const isDeviceTrusted = checkDeviceWasUsedPreviously(req.body.email, req.cookies.deviceId);

    const [resUsernameAndIP, resSlowByIP, resSlowUsername] = await Promise.all([
        limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
        limiterSlowBruteByIP.get(ipAddr),
        limiterSlowBruteByUsername.get(req.body.email),
    ]);

    let retrySecs = 0;

    // Check if IP, Username + IP or Username is already blocked
    if (resSlowByIP !== null && resSlowByIP.remainingPoints <= 0) {
        retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(retrySecs));
    } else if (resUsernameAndIP !== null && resUsernameAndIP.remainingPoints <= 0) {
        retrySecs = Number.MAX_SAFE_INTEGER;
    } else if (resSlowUsername !== null && resSlowUsername.remainingPoints <= 0) {
        retrySecs = Number.MAX_SAFE_INTEGER;
    }

    if (retrySecs > 0) {
        // res.status(429).send('Too Many Requests');
        res.status(429).json({
            success: false,
            token: '',
            errorLoginMessageToDisplay: 'Too Many Requests'
        });
    } else {

        const user = await loginUser(req, res);
        if (!user.success) {
            try {
                const limiterPromises = [];
                //if () {
                limiterPromises.push(limiterSlowBruteByIP.consume(ipAddr));
                //}

                if (user.exists) {
                    // Count failed attempts only for registered users
                    limiterPromises.push(limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey));
                    //if (!isDeviceTrusted) {
                    limiterPromises.push(limiterSlowBruteByUsername.consume(req.body.email));
                    //}
                }

                if (limiterPromises.length > 0) {
                    await Promise.all(limiterPromises);
                }

                res.status(400).json({
                    success: false,
                    token: '',
                    errorLoginMessageToDisplay: 'Username or password is wrong'
                });
                //res.status(400).end('email or password is wrong');
            } catch (rlRejected) {
                if (rlRejected instanceof Error) {
                    throw rlRejected;
                } else {
                    // All available points are consumed from some/all limiters, block request
                    // res.status(429).send('Too Many Requests');
                    res.status(429).json({
                        success: false,
                        token: '',
                        errorLoginMessageToDisplay: 'Too Many Requests'
                    });
                }
            }
        }

        else if (user.currentUser.enabled === 0) {
            res.status(400).json({
                success: false,
                token: '',
                errorLoginMessageToDisplay: 'You did not confirmed your token'
            });
        }

        //if (user.success && user.currentUser.enabled === 1) {
        else {


            // TU ZAVRSAVA LOGIN USERA.. AKO JE SVE U REDU ONDA
            // 1) MOZDA TREBA PONISTITI, OBRISATI SVE REQUESTOVE OD USERA KOJI JE NAPRAVIO
            // 2) reset the failure counter for valid login
            //       req.brute.reset(function () {
            //         res.redirect('/'); // logged in
            //       });
            // 3) Reset on successful authorisation
            //         await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);

            // !!!!!! ODLICAN PRIMJER    https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example
            if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
                // Reset only consecutive counter after successful authorisation
                await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
            }

            return res.status(200).json({
                success: user.success,
                currentUser: user.currentUser
            });
        }
    }
}


async function loginUser(req, res) {

    var requestObj = {
        username: req.body.username,
        password: req.body.password
    }

    let correctUsername = requestObj.username;
    let correctPassword = requestObj.password;

    try {

        let userResult;
        await User_OLD.findOne({
            where: {username: correctUsername},
            attributes: ['id', 'username', 'email', 'password', 'enabled', 'secret_key', 'enabledQR']
        })
            .then(user => {
                userResult = user
            })


        if (userResult != null && userResult != undefined) {

            // 1) solution.. synchronous request with compareSync
            let passwordResult = bcrypt.compareSync(correctPassword, userResult.dataValues.password)


            if (passwordResult) {

                let returnObject = {
                    success: true,
                    currentUser: userResult.dataValues
                }
                return returnObject
            }
            else {
                let returnObject = {
                    success: false,
                    token: "",
                    currentUser: ""
                }
                return returnObject
            }
        }
        else {

            let returnObject = {
                success: false,
                token: "",
                currentUser: ""
            }

            return returnObject
        }
    } catch (err) {

        //throw new Error(err)
        res.send(new Error(err))
    }
}

router.post('/loginUser', async function (req, res, next) {


    await loginRoute(req, res)

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