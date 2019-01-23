const express = require('express');
const ServerPortRouter = express.Router();


ServerPortRouter.route('/add').post(async function (req, res) {

    var requestObj = {
        name: req.body.name,
        address: req.body.address
    }

    let correctName = requestObj.name;
    let correctAddress = requestObj.address;

    // I need this, if I use databaseFunctions
    //const pool = pool;

    let pool = require('../database/DB_Pepac.js');

    let sql = "INSERT INTO customers ( name, address) VALUES ( '" + correctName + "', '" + correctAddress + "')";
    try {
        let result = await pool.query(sql);
        res.send(result)
    } catch (err) {
        throw new Error(err)
    }

});

ServerPortRouter.route('/index').get(async function (req, res) {

    // I need this, if I use databaseFunctions
    //const pool = pool;
    //console.log("da li ce se pokrenuti index na serveru");
    let pool = require('../database/DB_Pepac.js');

    let sql = "SELECT id, name, address FROM customers";
    try {
        let result = await pool.query(sql);
        res.json(result);
    } catch (err) {
        throw new Error(err)
    }

});

ServerPortRouter.route('/edit/:id').get(async function (req, res) {

    if (req.params.id > 0) {

        // I need this, if I use databaseFunctions
        //const pool = pool;

        let pool = require('../database/DB_Pepac.js');

        let sql = "SELECT id, name, address FROM customers WHERE id = " + req.params.id;
        try {
            let result = await pool.query(sql);
            res.json(result);
        } catch (err) {
            throw new Error(err)
        }
    }
});

ServerPortRouter.route('/update/:id').post( async function (req, res) {

    var requestObj = {
        name:  req.body.name,
        address: req.body.address
    }

    let correctName = requestObj.name;
    let correctAddress = requestObj.address;

    let pool = require('../database/DB_Pepac.js');

    let sql = "UPDATE customers SET name = '"+ correctName +"' , address = '"+ correctAddress +"'" +
        "  WHERE id = '"+ req.params.id  +"'    ";
    try {
        let result = await pool.query(sql);

        console.log(result)
        res.send(result);
        // Ako bih želio kad korisnik klikne na update i sve se uspješno izvrši i ako ga želim odmah prebaciti
        // to bih tako da dodam 2 stvari:
        // 1) dodam tu naredbu  "await res.redirect('http://localhost:5000/index');" i zakomentiram naredbu  res.send(result);
        // 2) uključim naredbu u EditComponent.js   " .then( res  => {
        //                     this.props.history.push('/index')
        //                     //setTimeout( () => { this.props.history.push('/index')  }, 10)
        //                 }
        //             ); "
    } catch(err) {
        throw new Error(err)
    }

});

ServerPortRouter.route('/delete/:id').get(async function (req, res) {

    // I need this, if I use databaseFunctions
    //const pool = pool;

    //console.log("da li ce uci");

    let pool = require('../database/DB_Pepac.js');

    let sql = "DELETE FROM customers WHERE id = " + req.params.id;
    try {
        let result = await pool.query(sql);
        //console.log(result);
        //res.send(result.affectedRows)
        await res.send(result.rowsAffected)
    } catch (err) {
        throw new Error(err)
    }
});

// 1 PRIMJER RADI SA TRANSAKCIJOM
/* ServerPortRouter.route('/update/:id').post( function (req, res) {

    var requestObj = {
        name: req.body.name,
        address: req.body.address
    }

    let correctName = requestObj.name;
    let correctAddress = requestObj.address;

    // I need this, if I use databaseFunctions
    //const pool = pool;

    let pool = require('../database/DB_Pepac.js');

    let sql = "UPDATE customers SET name = '" + correctName + "' , address = '" + correctAddress + "'" +
        "  WHERE id = '" + req.params.id + "'    ";
    try {
        pool.getConnection(function (err, connection) {

            connection.beginTransaction(function (err) {

                if (err) {
                    console.log("greska1")
                    connection.release();
                }

                connection.query(sql, function (err, rows, fields) {
                    if (err) {
                        connection.rollback(function () {

                            console.log("greska2")
                            connection.release();
                        });
                    }

                    console.log("koliko je redaka promijenilo: "+ rows.affectedRows)

                    connection.commit(function (err, results) {
                        if (err) {
                            connection.rollback(function () {

                                console.log("greska3")
                                connection.release();
                            });
                        }
                        console.log("poslani su podaci:")
                        console.log(rows)
                        res.send(rows);

                        connection.release();
                    });
                });
            });
        });

        //console.log(successfully)
        //res.send(successfully);
        //res.end();
        // Ako bih želio kad korisnik klikne na update i sve se uspješno izvrši i ako ga želim odmah prebaciti
        // to bih tako da dodam 2 stvari:
        // 1) dodam tu naredbu  await res.redirect('http://localhost:5000/index');
        // 2) uključim naredbu u EditComponent.js   " .then( res  => {
        //                     this.props.history.push('/index')
        //                     //setTimeout( () => { this.props.history.push('/index')  }, 10)
        //                 }
        //             ); "
        //await res.redirect('http://localhost:5000/index');

    } catch (err) {
        throw new Error(err)
    }
}); */


// 3 PRIMJER SA TRANSACKIJAMA, NE RADI NAJBOLJE
/* ServerPortRouter.route('/update/:id').post(async function (req, res) {

    var requestObj = {
        name: req.body.name,
        address: req.body.address
    }

    let correctName = requestObj.name;
    let correctAddress = requestObj.address;

    // I need this, if I use databaseFunctions
    //const pool = pool;

    let pool = require('../database/DB_Pepac.js');

    pool.getConnection(  (err, conn) => {

        if (err) {
            console.log("greska1")
            conn.release();
        }

        let sql = "UPDATE customers SET name = '" + correctName + "' , address = '" + correctAddress + "'" +
            "  WHERE id = '" + req.params.id + "'    ";
        try {

            try {

                conn.beginTransaction();

                let data = conn.query(sql);

                conn.commit( function (err, results) {

                    if (err) {
                        conn.rollback(function () {

                            console.log("greska3")
                            conn.release();
                        });
                    }
                    console.log("poslani su podaci:")
                    console.log(results)
                    res.send(results);
                });

                //console.log("poslani su podaci:",{trans})

                //res.send( "ok");
                //return res.redirect('/person/' + idperson);

            } finally {
                pool.releaseConnection(conn);
            }

        } catch (err) {
            console.log(err);
            conn.rollback();
            console.log(err);
        }

    });

}); */



module.exports = ServerPortRouter;