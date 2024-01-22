
const app = require('./app');

const { Container } = require('typedi');


const PORT = process.env.PORT || 3333;
const HOST = process.env.HOST || "localhost";

const {logger} = require('./config/config');
Container.set('logger', logger);

const {db} = require('./persistence/db');
Container.set('db', db);



app.get('/api', (req, res) => {
    res.send('Api is running!')
});




const authRouter = require('./routes/auth'),
    dbRouter = require('./routes/db'),
    transactionsRouter = require('./routes/transactions'),
    usersRouter = require('./routes/users');

app.use('/api/auth', authRouter);
app.use('/api/db', dbRouter);
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);


app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});