const express = require('express')
const router = express.Router()
const {Container} = require('typedi');

const db = Container.get('db')
const logger = Container.get('logger')

const {userAuth, specificUserAuth, adminAuth} = require('../middleware/auth');


router.get('/', adminAuth, async (req, res) => {
    // return all transactions
    try {
        const result = await db.query(`SELECT * FROM transactions`);
        res.send(result.rows);
    } catch (err) {
        res.status(400).send({
            message: err.message,
            status : 'error'
        });
    }
});

router.get('/:id', userAuth, async (req, res) => {
    // return specific transaction
    const transactionId = req.params.id;
    try {
        const result = await db.query(`SELECT * FROM transactions WHERE transaction_id = ${transactionId}`);
        // check if the from_user_id is the same as the user_id in the session
        if (result.rows[0].from_user_id != req.session.user.id) throw Error('Not authorized');
        if (result.rows.length == 0) throw Error('Transaction not found');
        res.send(result.rows);
    } catch (err) {
        res.status(400).send({
            message: err.message,
            status : 'error'
        });
    }
});

router.post('/', userAuth, async (req, res) => {
    // create new transaction
    const {user_id, amount, description} = req.body;
    try {
        const result = await db.query(`INSERT INTO transactions (user_id, amount, description) VALUES (${user_id}, ${amount}, '${description}') RETURNING *`);
        res.send(result.rows[0]);
    } catch (err) {
        res.status(400).send({
            message: err.message,
            status : 'error'
        });
    }
});

// get all transactions for a specific user using query parameters
router.get('/user/:id', userAuth, async (req, res) => {
    // return all transactions
    const userId = req.params.id;
    // get all of the query parameters
    const query = req.query;
    // build the query string
    let queryString = `SELECT * FROM transactions WHERE from_user_id = ${userId}`;
    // check if there are any query parameters
    if (Object.keys(query).length > 0) {
        queryString += ' AND ';
        // loop through all of the query parameters
        for (const key in query) {
            queryString += `${key} = '${query[key]}' AND `;
        }
        // remove the last 'AND'
        queryString = queryString.slice(0, -4);
    }
    try {
        const result = await db.query(queryString);
        res.send(result.rows);
    } catch (err) {
        res.status(400).send({
            message: err.message,
            status : 'error'
        });
    }
});

/********************************* ADMIN  *********************************/

router.put('/:id', adminAuth, async (req, res) => {
    // update specific transaction
    const transactionId = req.params.id;
    const {user_id, amount, description} = req.body;
    try {
        const result = await db.query(`UPDATE transactions SET user_id = ${user_id}, amount = ${amount}, description = '${description}' WHERE transaction_id = ${transactionId} RETURNING *`);
        res.send(result.rows[0]);
    } catch (err) {
        res.status(400).send({
            message: err.message,
            status : 'error'
        });
    }
});

router.delete('/:id', adminAuth, async (req, res) => {
    // delete specific transaction
    const transactionId = req.params.id;
    try {
        const result = await db.query(`DELETE FROM transactions WHERE transaction_id = ${transactionId} RETURNING *`);
        res.send(result.rows[0]);
    } catch (err) {
        res.status(400).send({
            message: err.message,
            status : 'error'
        });
    }
});

module.exports = router