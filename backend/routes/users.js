const express = require('express')
const router = express.Router()
const {Container} = require('typedi');

const db = Container.get('db')
const logger = Container.get('logger')

const {adminAuth, specificUserAuth} = require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
    // return all users
    try {
        const result = await db.query(`SELECT * FROM users`);
        res.send(result.rows);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.get('/:id', specificUserAuth, async (req, res) => {
    // return specific user
    const userId = req.params.id;
    try {
        const result = await db.query(`SELECT * FROM users WHERE user_id = ${userId}`);
        if (result.rows.length == 0) throw Error('User not found');
        res.send(result.rows);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.post('/', adminAuth, async (req, res) => {
    // create new user
    const {username, password, is_admin} = req.body;
    try {
        const result = await db.query(`INSERT INTO users (username, password, is_admin) VALUES ('${username}', '${password}', ${is_admin}) RETURNING *`);
        res.send(result.rows[0]);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.put('/:id', specificUserAuth, async (req, res) => {
    // update specific user
    const userId = req.params.id;
    const {username, password, is_admin} = req.body;
    try {
        const result = await db.query(`UPDATE users SET username = '${username}', password = '${password}', is_admin = ${is_admin} WHERE user_id = ${userId} RETURNING *`);
        res.send(result.rows[0]);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.delete('/:id', specificUserAuth, async (req, res) => {
    // delete specific user
    const userId = req.params.id;
    try {
        const result = await db.query(`DELETE FROM users WHERE user_id = ${userId} RETURNING *`);
        res.send(result.rows[0]);
    } catch (err) {
        res.status(400).send(err.message);
    }
});




module.exports = router