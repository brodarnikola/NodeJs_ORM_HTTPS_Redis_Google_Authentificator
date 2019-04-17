var express = require('express');
var router = express.Router();

const nodemailer = require('nodemailer');

const {User_OLD} = require('../database/sequelize')


const jwt = require('jsonwebtoken');
var config = require('../auth/config'); // get our config file

// for securing user password into hash password
const bcrypt = require('bcrypt');


async function forgotPassword(req, res) {

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

    let userResult;
    await User_OLD.findOne({
        where: {email: correctEmail},
        attributes: ['id', 'username', 'email', 'password']
    })
        .then(user => {
            userResult = user
        })

    try {

        jwt.sign(
            {
                id: userResult.dataValues.id
            },
            config.secret,
            {
                expiresIn: '12h',  // 12 hours
            },
            (err, emailToken) => {

                // moram SKUŽITI KAK DODATI VIŠE PARAMETRI.. TREBAM POSLATI 2 PARAMETRE, ID od USERA i TOKEN
                //const url = `http://localhost:3000/changePassword?id=${userResult[0].id}&token=${emailToken}`;
                const url = `http://localhost:3000/changePassword/${emailToken}`;

                transporter.sendMail({
                    to: userResult.dataValues.email,
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

    } catch (err) {

        //console.log("loginUser da li ce uci 333" + err);
        //throw new Error(err)
        res.send(new Error(err))
    }
}

async function readForgotPasswordToken(req, res, next) {

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
};


async function updateUserPassword(req, res) {

    //console.log("loginUser da li ce uci");
    var requestObj = {
        passwordFirstValue: req.body.passwordFirstValue,
        userId: req.body.userId
    }

    let correctNormalPassword = requestObj.passwordFirstValue;
    let correctUserId = requestObj.userId;


    const saltValue = bcrypt.genSaltSync(10);
    var correctHashedPassword = bcrypt.hashSync(correctNormalPassword, saltValue);

    let resultORM_1
    await User_OLD.findOne({
        where: {id: correctUserId}
    })
        .then(user => {
            user.update({
                password: correctHashedPassword
            });
            resultORM_1 = user
        })
        .catch(err => {
            console.log('problem updating user and communicating with db');
        });

    try {
        return res.json({
            success: true,
            message: 'User password has been successfully updated'
        });
    } catch (err) {
        return res.json({
            success: false,
            message: 'User password did not successfully updated'
        });
    }
};


module.exports = {
    forgotPassword: forgotPassword,
    readForgotPasswordToken: readForgotPasswordToken,
    updateUserPassword: updateUserPassword
};