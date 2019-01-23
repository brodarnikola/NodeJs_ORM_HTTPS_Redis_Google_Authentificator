//const express = require('express');
//const app = express();
//const ServerPortRouter1 = express.Router();

//const ServerPortRouter = require('../routes/ServerPortRoutes');

module.exports = {

    showAllCustomers: async (req, res) => {

        const pool = pool1;

        let sql = "SELECT id, name, address FROM customers";
        try {
            let result = await pool.query(sql);
            console.log("da li ce se pokrenuti index na serveru MODULE EXPORET");
            res.json(result);
        } catch(err) {
            throw new Error(err)
        }
    },

    linkToEditCustomer: async (req, res) => {

        if( req.params.id > 0 ) {

            //let pool = require('../database/DB.js');

            const pool = pool1;

            let sql = "SELECT id, name, address FROM customers WHERE id = " + req.params.id;
            try {
                let result = await pool.query(sql);
                //rows[0].solution
                //console.log("id je: " + result[0].id + "  ime" + result[0].name + "  " + result[0].address);
                res.json(result);
            } catch (err) {
                throw new Error(err)
            }
        }
    },

    updateCustomer: async (req, res) => {

        var requestObj = {
            name:  req.body.name,
            address: req.body.address
        }

        let correctName = requestObj.name;
        let correctAddress = requestObj.address;

        const pool = pool1;
        //let pool = require('../database/DB.js');

        let sql = "UPDATE customers SET name = '"+ correctName +"' , address = '"+ correctAddress +"'" +
            "  WHERE id = '"+ req.params.id  +"'    ";
        try {
            await pool.query(sql);
            //return res.send('<script>window.location.href="http://localhost:5000/index";</script>');
            //await pool1.release;
            await res.redirect('http://localhost:5000/index');

        } catch(err) {
            throw new Error(err)
        }
    }
};



/* ServerPortRouter.route('/index').get( async function (req, res) {

    const pool = pool;

    let sql = "SELECT id, name, address FROM customers";
    try {
        let result = await pool.query(sql);
        console.log("da li ce se pokrenuti index na serveru");
        res.json(result);
    } catch(err) {
        throw new Error(err)
    }
}); */