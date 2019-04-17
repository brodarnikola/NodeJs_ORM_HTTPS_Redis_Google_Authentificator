
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

// for securing user password into hash password
const bcrypt = require('bcrypt');
const {User_OLD, Roles} = require('../database/sequelize')

const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

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
            return res.status(400).send({
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

module.exports = {
    loginRoute: loginRoute
};


