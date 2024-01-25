# Install nix-shell

```bash
sh <(curl -L https://nixos.org/nix/install) --no-daemon
```

## Use nix-shell to run njsscan

In the root of the project, run the following command:

```bash
nix-shell
```

Now you can run njsscan:

```bash
njsscan ./backend --config .njsscan
```


1. **Vulnerable Code Example**:
   ```javascript
   await db.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1`);
   ```

2. **Demonstration of SQL Injection**:
   - **Scenario**: Imagine a user inputs the following for `username` and `password`:
     - `username`: `admin`
     - `password`: `' OR '1'='1`
   - **Injected SQL Query**:
     ```sql
     SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1' LIMIT 1
     ```
   - **Explanation**: This query will always return true due to the `OR '1'='1'` condition, potentially granting unauthorized access to the first user in the database, often an admin account.

3. **Teaching the Consequences**:
   - Explain how this vulnerability can allow an attacker to bypass authentication.
   - Highlight the potential risks, such as data breaches, unauthorized access, and system compromise.

4. **Solution - Using Prepared Statements**:
   - Modify the query to use prepared statements to prevent SQL injection.
   - Example with Prepared Statement:
     ```javascript
     await db.query(`SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1`, [username, password]);
     ```
   - This method ensures that user input is treated as data, not as part of the SQL command, effectively mitigating the risk of SQL injection.


5. **Vulnerable Code Example**:
   ```javascript
   await db.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1`);
   ```

6. **Demonstration of SQL Injection for Specific User**:
   - **Scenario**: An attacker wants to sign in as the "admin" user without knowing the actual password.
   - **Injected Input**:
     - `username`: `admin' --`
     - `password`: (Can be anything, it will be ignored)
   - **Injected SQL Query**:
     ```sql
     SELECT * FROM users WHERE username = 'admin' --' AND password = 'any_password' LIMIT 1
     ```
   - **Explanation**: Here, the `--` (double dash) is a SQL comment. Everything after `--` is ignored by the SQL server. This effectively turns the query into a check if there is a user with the username 'admin', without checking the password.

7. **Consequences and Risks**:
   - Explain that this type of injection can lead to unauthorized access to specific user accounts, especially accounts with higher privileges like admin accounts.
   - Discuss potential risks such as data theft, privilege escalation, and unauthorized actions performed under the compromised account.

8. **Secure Solution - Prepared Statements**:
   - Revise the query to use prepared statements.
   - Example with Prepared Statement:
     ```javascript
     await db.query(`SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1`, [username, password]);
     ```
   - Prepared statements ensure that the input for the `username` and `password` is not treated as part of the SQL command.


Absolutely, I can provide a few more SQL injection examples for educational purposes. These examples will help demonstrate different ways SQL injection can be exploited and why it's crucial to write secure code.

### Bypassing Authentication (Different Method)

**Vulnerable Code Example**:
```javascript
await db.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1`);
```

**Injected Input**:
- `username`: `' OR 1=1 --`
- `password`: (Can be anything, it will be ignored)

**Injected SQL Query**:
```sql
SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = 'any_password' LIMIT 1
```

**Explanation**:
- The `1=1` condition is always true, leading to the selection of all users. The comment `--` negates the password check, potentially logging in the attacker as the first user in the database.


Your provided code represents an Express.js router handling various routes related to user management. Each route has certain vulnerabilities to SQL injection due to the way user input is directly used in SQL queries. Here are some examples of SQL injections for each route:

### 1. Get Specific User (SQL Injection in Query Parameter)

**Route**: `GET /:id`
**Vulnerable Code**:
```javascript
const result = await db.query(`SELECT * FROM users WHERE user_id = ${userId} LIMIT 1`);
```

**Injection Example**:
- Attacker modifies the URL to: `/105 OR 1=1`
- Results in SQL: `SELECT * FROM users WHERE user_id = 105 OR 1=1 LIMIT 1`
- **Consequence**: This would return all users instead of just the one with ID 105.

### 2. Create New User (SQL Injection in POST Body)

**Route**: `POST /`
**Vulnerable Code**:
```javascript
const result = await db.query(`INSERT INTO users (username, password, is_admin) VALUES ('${username}', '${password}', ${is_admin}) RETURNING *`);
```

**Injection Example**:
- Attacker sends a body with: 
  ```json
  {
      "username": "attacker",
      "password": "pass', true);--",
      "is_admin": "false"
  }
  ```
- Results in SQL: `INSERT INTO users (username, password, is_admin) VALUES ('attacker', 'pass', true);--', false) RETURNING *`
- **Consequence**: An attacker could create an admin user.

### 3. Update Specific User (SQL Injection in URL Parameter and POST Body)

**Route**: `PUT /:id`
**Vulnerable Code**:
```javascript
const result = await db.query(`UPDATE users SET username = '${username}', password = '${password}', is_admin = ${is_admin} WHERE user_id = ${userId} RETURNING *`);
```

**Injection Example**:
- URL: `/105`
- Body:
  ```json
  {
      "username": "attacker', is_admin = true WHERE user_id = 105;--",
      "password": "pass",
      "is_admin": "false"
  }
  ```
- Results in SQL: `UPDATE users SET username = 'attacker', is_admin = true WHERE user_id = 105;--', password = 'pass', is_admin = false WHERE user_id = 105 RETURNING *`
- **Consequence**: Attacker could gain admin privileges for user ID 105.

### 4. Delete Specific User (SQL Injection in URL Parameter)

**Route**: `DELETE /:id`
**Vulnerable Code**:
```javascript
const result = await db.query(`DELETE FROM users WHERE user_id = ${userId} RETURNING *`);
```

**Injection Example**:
- URL: `/105 OR 1=1`
- Results in SQL: `DELETE FROM users WHERE user_id = 105 OR 1=1 RETURNING *`
- **Consequence**: Deletes all users instead of just user ID 105.

### Recommendations for Prevention:

- **Use Prepared Statements**: Instead of concatenating user inputs directly into SQL queries, use prepared statements with placeholders.
- **Validate Inputs**: Ensure that inputs like `userId`, `username`, `password`, and `is_admin` are validated for expected types and formats.
- **Limit Privileges**: Database users should have the least privileges necessary to perform their tasks.


The provided code sample shows various routes in an Express.js application managing transactions, with several potential SQL injection vulnerabilities. Here are some examples of SQL injections for each route:

### 1. Get Specific Transaction (SQL Injection in URL Parameter)

**Route**: `GET /:id`
**Vulnerable Code**:
```javascript
const result = await db.query(`SELECT * FROM transactions WHERE transaction_id = ${transactionId}`);
```

**Injection Example**:
- Attacker modifies the URL to: `/105 OR 1=1`
- Results in SQL: `SELECT * FROM transactions WHERE transaction_id = 105 OR 1=1`
- **Consequence**: This would return all transactions instead of just the one with ID 105.

### 2. Create New Transaction (SQL Injection in POST Body)

**Route**: `POST /`
**Vulnerable Code**:
```javascript
const result = await db.query(`INSERT INTO transactions (user_id, amount, description) VALUES (${user_id}, ${amount}, '${description}') RETURNING *`);
```

**Injection Example**:
- Attacker sends a body with: 
  ```json
  {
      "user_id": "105",
      "amount": "1000",
      "description": "Test'); DELETE FROM transactions;--"
  }
  ```
- Results in SQL: `INSERT INTO transactions (user_id, amount, description) VALUES (105, 1000, 'Test'); DELETE FROM transactions;--') RETURNING *`
- **Consequence**: An attacker could insert a transaction and potentially delete all transactions in the database.

### 3. Update Specific Transaction (SQL Injection in URL Parameter and POST Body)

**Route**: `PUT /:id`
**Vulnerable Code**:
```javascript
const result = await db.query(`UPDATE transactions SET user_id = ${user_id}, amount = ${amount}, description = '${description}' WHERE transaction_id = ${transactionId} RETURNING *`);
```

**Injection Example**:
- URL: `/105`
- Body:
  ```json
  {
      "user_id": "105",
      "amount": "1000",
      "description": "Updated', amount = 10000 WHERE transaction_id = 105;--"
  }
  ```
- Results in SQL: `UPDATE transactions SET user_id = 105, amount = 1000, description = 'Updated', amount = 10000 WHERE transaction_id = 105;--' WHERE transaction_id = 105 RETURNING *`
- **Consequence**: Attacker could update the transaction amount or other details for transaction ID 105.

### 4. Delete Specific Transaction (SQL Injection in URL Parameter)

**Route**: `DELETE /:id`
**Vulnerable Code**:
```javascript
const result = await db.query(`DELETE FROM transactions WHERE transaction_id = ${transactionId} RETURNING *`);
```

**Injection Example**:
- URL: `/105 OR 1=1`
- Results in SQL: `DELETE FROM transactions WHERE transaction_id = 105 OR 1=1 RETURNING *`
- **Consequence**: Deletes all transactions instead of just transaction ID 105.

### 5. Get All Transactions for a Specific User (SQL Injection in Query Parameters)

**Route**: `GET /user/:id`
**Vulnerable Code**:
```javascript
let queryString = `SELECT * FROM transactions WHERE from_user_id = ${userId}`;
// ... appending query parameters
```

**Injection Example**:
- URL: `/user/105?amount=1000 OR 1=1`
- Results in SQL: `SELECT * FROM transactions WHERE from_user_id = 105 AND amount = '1000 OR 1=1'`
- **Consequence**: This could potentially expose all transactions in the database, not just those related to user 105.

### Recommendations for Prevention:

- **Use Prepared Statements**: Replace direct insertion of variables in SQL queries with placeholders and prepared statements.
- **Validate and Sanitize Inputs**: Ensure that inputs like `transactionId`, `user_id`, `amount`, and `description` are strictly validated and sanitized.
- **Implement Proper Error Handling**: Avoid revealing detailed error messages that could assist an attacker in formulating an injection strategy.