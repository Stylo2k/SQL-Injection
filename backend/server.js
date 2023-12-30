
const app = require('./app');

const { Container } = require('typedi');


const PORT = process.env.PORT || 3333;
const HOST = process.env.HOST || "localhost";

const {logger} = require('./config/config');
Container.set('logger', logger);

const {db, resetDBState} = require('./persistence/db');
Container.set('db', db);



// on startup reset the database
resetDBState('./persistence/init.sql');


app.get('/', (req, res) => {
    res.send('Api is running!')
});




const authRouter = require('./routes/auth');

app.use('/api/auth', authRouter);



app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});