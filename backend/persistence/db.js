const {Pool} = require('pg');

const {logger, readFile} = require('../config/config');

const database = new Pool({
  max: 10,
  connectionString: process.env.DATABASE_URL || "localhost://user:pass@localhost:5432/db"
});

const db = {
  db : database,
  query: async (text, user = 'not logged in') => {
    const start = Date.now();
    const res = await database.query(text);
    const duration = Date.now() - start;
    logger.info('executed query', {text, duration, rows: res.rowCount});
    // add to the logs table
    // we are adding a query as varchar so we need to escape it
    // otherwise we will an sql injection INSIDE our logs table as well ;)
    text = text.replace(/'/g, "''");
    database.query(`INSERT INTO logs (username, query, timestamp, duration) VALUES ('${user}', '${text}', '${new Date().toISOString()}', ${duration})`);

    return res;
  },
  resetDBState : async (initSqlPath = __dirname + '/init.sql') => {
    logger.info('resetting db');
    query = await readFile(initSqlPath);
    await database.query(query);
    logger.info('Reset database')
  }
}

module.exports = {
  db
}
