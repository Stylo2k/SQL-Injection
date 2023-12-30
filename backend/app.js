const express = require('express'),
      morgan = require('morgan'),
      helmet = require('helmet'),
      cookies = require('cookie-parser'),
      session = require('express-session'),
      {v4: uuidv4} = require('uuid'),
      bodyParser = require('body-parser'),
      cors = require('cors');


const app = express();

app.use(cors({ origin: '*' }))
app.use(bodyParser.json());
app.use(cookies());

app.use(morgan('dev'));
app.use(express.urlencoded({extended: 'false'}))

app.use(helmet());
app.use(session({
    genid: (req) => {
        const id = uuidv4();// use UUIDs for session IDs
        console.log(`Generated session: ${id}`)
        return id;
    },
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}))

module.exports = app;