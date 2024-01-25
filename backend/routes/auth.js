// nodejs file that handles the login requests
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';

const {Container} = require('typedi');

const db = Container.get('db')
const logger = Container.get('logger')

const {userAuth} = require('../middleware/auth');

const LOGIN_ENDPOINT = '/api/auth/login';
const SIGNUP_ENDPOINT = '/api/auth/signup';
const LOGOUT_ENDPOINT = '/api/auth/logout';
const PROFILE_ENDPOINT = '/api/auth/profile';

router.get('/profile', userAuth, async (req, res) => {
    // get user id from session
    const userId = req.session.user.id;
    
    try {
        const result = await db.query(`SELECT * FROM users WHERE user_id = ${userId} LIMIT 1`);
        if (result.rows.length == 0) throw Error('User not found');
        res.send({
            'user' : req.session.user,
            'result' : result.rows[0],
        });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.post('/login', async (req, res) => {
    // check if user already logged in
    if (req.session.user) {
        // send to profile page
        res.redirect(PROFILE_ENDPOINT);
        return;
    }

    // get username and password from request body
    const {username, password} = req.body;
    // check if username and password are set
    if (!username || !password) {
        res.status(400).send('Username and password are required');
        return;
    }
    
    logger.info(`User ${username} is trying to login`);

    try {
        const result = await db.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1`)        
        if (result.rows.length == 0) throw Error('Failed to login');
        let role = 'Basic';
        if (result.rows[0].is_admin) role = 'Admin';
        let token = jwt.sign({id: result.rows[0].user_id, role}, jwtSecret, {expiresIn: '1h'});
        res.cookie('jwt', token);
        res.redirect(PROFILE_ENDPOINT);
    } catch (err) {
        res.status(400).send(
            {
                error: err.message,
            }
        );
    }
});

// for dev purposes only
router.get('/login', (req, res) => {
    // send login page
    res.send(`
        <form action="${LOGIN_ENDPOINT}" method="POST">
            <input type="text" name="username" placeholder="username">
            <input type="password" name="password" placeholder="password">
            <input type="submit" value="Login">
        </form>
    `);
    
});

// for dev purposes only
router.get('/logout', (req, res) => {  
    // send logout page
    res.send(`
        <form action="${LOGOUT_ENDPOINT}" method="POST">
            <input type="submit" value="Logout">
        </form>
    `);
});

router.post('/logout', userAuth, (req, res) => {
    // destroy session
    req.session.destroy();
    // clear jwt cookie
    res.clearCookie('jwt');
    
    res.redirect(LOGIN_ENDPOINT);
});

// for dev purposes only
router.get('/signup', (req, res) => {
    // send signup page
    res.send(`
        <form action="${SIGNUP_ENDPOINT}" method="POST">
            <input type="text" name="username" placeholder="username">
            <input type="text" name="surname" placeholder="surname">
            <input type="text" name="name" placeholder="name">
            <input type="password" name="password" placeholder="password">
            <input type="submit" value="Signup">
        </form>
        `);
});

// router for signup
router.post('/signup', async (req, res) => {
    // check if user already logged in
    if (req.session.user) {
        // send to profile page
        res.redirect(PROFILE_ENDPOINT);
        return;
    }

    // get username and password from request body
    const {
        username,
        password,
        surname,
        name,
    } = req.body;
    // check if username and password are set
    if (!username || !password || !surname || !name) {
        res.status(400).send('Username, password, surname and name are required');
        return;
    }
    
    // find if username already exists
    try {
        const result = await db.query(`SELECT * FROM users WHERE username = '${username}' LIMIT 1`)        
        if (result.rows.length > 0) throw Error('Username already exists');
        // insert new user
        const insertResult = await db.query(`INSERT INTO users (username, password, surname, name) VALUES ('${username}', '${password}', '${surname}', '${name}') RETURNING user_id`);
        // create session
        req.session.user = insertResult.rows[0].user_id;
        // set the jwt cookie
        let token = jwt.sign({id: req.session.user, role: 'Basic'}, jwtSecret, {expiresIn: '1h'});
        res.cookie('jwt', token);
        res.redirect(PROFILE_ENDPOINT);
    } catch (err) {
        res.status(400).send(err.message);
    }
});


module.exports = router;