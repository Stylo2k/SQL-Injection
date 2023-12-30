DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR,
    surname VARCHAR,
    name VARCHAR,
    password VARCHAR,
    is_admin BOOLEAN,
    balance DECIMAL
);

DROP TABLE IF EXISTS transactions;
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    from_user_id SERIAL,
    to_user_id SERIAL,
    amount DECIMAL,
    reference VARCHAR
);

DROP TABLE IF EXISTS logs;
CREATE TABLE IF NOT EXISTS logs (
    log_id SERIAL PRIMARY KEY,
    username VARCHAR,
    query VARCHAR,
    timestamp TIMESTAMP,
    duration DECIMAL
);

INSERT INTO users 
    (username, surname, name, password, is_admin, balance)
VALUES
    ('3laoi', '3laoi', 'Iraqi', '12345', FALSE, 1000),
    ('habib', 'Habib', 'Galbi', '12345', FALSE, 1001),
    ('erblin', 'Erblin', 'Ibrahimi', '12345', FALSE, 10000000),
    ('niels', 'Niels', 'Bugel', '12345', FALSE, 1234),
    ('mootje', 'Mohammad', 'al Shakoush', '12345', TRUE, 100000);


INSERT INTO transactions
    (from_user_id, to_user_id, amount, reference)
VALUES
    (1, 2, 1, 'Thanks Habib!'),
    (2, 3, 1, 'Thanks Erblin!'),
    (3, 4, 1, 'Thanks Niels!'),
    (4, 5, 1, 'Thanks Mohammad!'),
    (5, 1, 1, 'Thanks 3laoi!');