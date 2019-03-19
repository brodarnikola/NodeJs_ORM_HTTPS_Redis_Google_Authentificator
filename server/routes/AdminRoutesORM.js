var express = require('express');
var router = express.Router();

const Sequelize = require('sequelize')
const {User_OLD, Customer} = require('../database/sequelize')
const SequelizeOperator = Sequelize.Op;



router.route('/index').get(async function (req, res) {

    //console.log("da li ce se pokrenuti index na serveru");
    let result;

    await Customer.findAll({
        attributes: [ 'id', 'name', 'address']  })
        .then(user => {
            result = user
        })

    let sendCorrectArray = [];

    for (let i = 0; i < result.length; i++) {
        let userObject = {
            id: result[i].dataValues.id,
            name: result[i].dataValues.name,
            address: result[i].dataValues.address
        }
        sendCorrectArray.push(userObject)
    }

    try {
        return res.json({
            userArray: sendCorrectArray
            //message: 'User has been successfully added'
        });
        // res.json(sendCorrectArray);
    } catch (err) {
        // throw new Error(err)
        return res.json({
            userArray: []
            //message: 'User has not been successfully added'
        });
    }

});

router.route('/add').post(async function (req, res) {

    var requestObj = {
        name: req.body.name,
        address: req.body.address
    }

    let resultORM_1
    await Customer.create(requestObj)
        .then(
            user => resultORM_1 = user )

    try {
        return res.json({
            success: true
            //message: 'User has been successfully added'
        });
    } catch (err) {
        return res.json({
            success: false,
            //message: 'User has not been successfully added'
        });
    }
});


router.route('/edit/:id').get(async function (req, res) {

    if (req.params.id > 0) {

        let result;
        await Customer.findOne({
            where: {id: req.params.id},
            attributes: ['id', 'name', 'address']  })
            .then(user => {
                result = user
            })

        try {
            let userData = {
                id: result.dataValues.id,
                name: result.dataValues.name,
                address: result.dataValues.address
            }
            return res.json({
                success: userData
            });
        } catch (err) {
            throw new Error(err)
        }
    }
    else {
        return res.json({
            success: '-1'
        });
    }
});


router.route('/update/:id').post(async function (req, res) {

    var requestObj = {
        name:  req.body.name,
        address: req.body.address
    }

    let correctName = requestObj.name;
    let correctAddress = requestObj.address;

    let resultORM_1
    await Customer.findOne({
        where: {id: req.params.id}
    })
        .then(user => {
             user.update({
                name: correctName,
                address: correctAddress
            });
             resultORM_1 = user
        })
        .catch(err => {
            console.log('problem updating user and communicating with db');
            //res.status(500).json(err);
        });

    try {
        return res.json({
            success: true
        });
        // If I want to send "id from user", then I will do it that way
        //res.send(resultORM_1.dataValues.id[0])
    } catch (err) {
        return res.json({
            success: false
        });
    }
});

router.route('/delete/:id').get(async function (req, res) {

    await Customer.destroy({
        where: {
            // criteria
            id: req.params.id
        }
    })
        .then(function(rowDeleted){ // rowDeleted will return number of rows deleted
            if(rowDeleted === 1){
                console.log('Deleted successfully');
            }
        }, function(err){
            console.log(err);
    });

    try {
        return res.json({
            success: true
        });
    } catch (err) {
        return res.json({
            success: false
        });
    }
});




module.exports = router;