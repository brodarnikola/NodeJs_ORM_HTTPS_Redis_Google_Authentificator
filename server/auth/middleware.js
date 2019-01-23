let jwt = require('jsonwebtoken');
const config = require('./config.js');

let checkToken = (req, res, next) => {

    let token = req.headers['authorization'] || req.headers['x-access-token']; // Express headers are auto converted to lowercase

    if (token) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        if( token == "null" ) {
            return res.json({
                success: false,
                message: 'Token is not valid'
            });
        }

        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                });

                //return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
             } else {
                req.userId = decoded;
                next();
            }
        });
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
        //return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
};

module.exports = {
    checkToken: checkToken
};