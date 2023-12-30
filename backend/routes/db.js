const express = require('express')
const router = express.Router()
const {Container} = require('typedi');

const db = Container.get('db')
const logger = Container.get('logger')

const {adminAuth} = require('../middleware/auth');


router.get('/reset', adminAuth, async (req, res) => {
    try {
        await db.resetDBState();
        res.status(200).send({
            message: 'Database reset',
            status : 'success'
        });
    } catch (err) {
        logger.error(`Error resetting database: ${err.message}`)
        res.status(500).send({
            message: 'Error resetting database',
            status : 'error'
        });
    }
});

module.exports = router