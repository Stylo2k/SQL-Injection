# Practical approach to resolving SQL Injection vulnerabilities

In this tutorial, we will be going through a simple banking application that has a few SQL injection vulnerabilities. You can find the source code on https://github.com/Stylo2k/SQL-Injection

## Prerequisites

### Knowledge about SQL injection

This tutorial assumes that you have some basic knowledge about SQL injection vulnerabilities. If you are not familiar with SQL injection vulnerabilities, please read up using the following [link](https://portswigger.net/web-security/sql-injection#:~:text=First%2Dorder%20SQL%20injection%20occurs,stores%20it%20for%20future%20use.).

### `docker`

Before we delve into the finer details of the application and the vulnerabilities, let's first get the application running. This tutorial assumes that you have `docker` and `docker-compose` installed on your system. If you do not have these installed, please follow the instructions [here](https://docs.docker.com/get-docker/) and [here](https://docs.docker.com/compose/install/).

### Installing nix-shell

In order to make your life easier, we will be using a tool called `nix-shell`. `nix-shell` is a command-line tool provided by the Nix package manager, used for creating temporary environments that are isolated from the rest of the system. This allows us to easily install dependencies needed for specific projects without polluting our system with unnecessary packages. Moreover, it also allows us to define all dependencies in one place, and not have to worry about installing them manually.

Please download and install `nix-shell` before continuing by running the following command:

```bash
sh <(curl -L https://nixos.org/nix/install) --no-daemon
```

Note that if you are running macOS, the `--no-daemon` flag is not supported. Instead, you should run the command

```bash
bash -c 'sh <(curl -L https://nixos.org/nix/install)'
```

or, if you are using another shell like `fish` (which does not support this `bash` syntax), you can run

```bash
bash -c 'sh <(curl -L https://nixos.org/nix/install)'
```

Verify that the installation was successful by running

```bash
nix-shell --version
```

If this is successful, you should see something like

```bash
nix-shell (Nix) 2.19.3
```

Next, try to run the following command to create a temporary environment:

```bash
nix-shell -p nix-info --run "nix-info -m"
```

If `nix-shell` is installed correctly, you should see a bunch of information about your system and the installation details of `nix-shell`.

You can find a full list of the documentation of `nix-shell` (including all the parameters that you can pass) [here](https://nixos.org/manual/nix/stable/command-ref/nix-shell).

### Using nix-shell

In the root of the project, run the following command:

```bash
nix-shell
```

This will start a pre-defined environment that we have provided in the project. `nix-shell` looks at `default.nix` and performs the instructions that are defined in the `shellHook`. Currently, it simply creates a virtual environment and activates it.

## Application

In order to run the application, simply run the following command:

```bash
docker-compose up
```

You can now access the application at `localhost:80/<END_POINT>`. For now, we have the following entry points:

- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/signup`
- `/api/auth/profile`
- `/api/auth`
- `/api/users`
- `/api/transactions`

### Familiarization

Please take your time looking through the code and understanding how the application works. More specifically, analyse which endpoints are accessible to which users, and what the purpose of each endpoint is.

Note that you can find some sample login credentials in `postgres-data/sql/init.sql` at the very bottom. You can use these to login at `localhost:80/api/auth/login`. A successful login attempt should result in a JSON object being returned with some basic information about the user. Be sure to properly logout after logging in by clicking the logout button in `localhost:80/api/auth/logout`.

> **Q: What happens when you access `localhost:80/api/transactions` without logging in?**

> **Q: What happens when you access `localhost:80/api/transactions` after logging in as a regular user?**

> **Q: Which user can currently view all users and transactions?**

## Vulnerabilitiy Analysis

### Injection examples

**Scenario 1**
Imagine a user inputs the following for `username` and `password`:

- `username`: `admin`
- `password`: `' OR '1'='1`

The SQL query that is executed is the following:

```sql
SELECT * FROM users WHERE username='admin' AND password='' OR '1'='1';
```

This query will always return true due to the `OR '1'='1'` condition, potentially granting unauthorized access to the first user in the database, often an admin account.

> **Q: Explain how this vulnerability can allow an attack to bypass authentication.**

> **Q: Unlike before, are you now able to view all (or specific) user/transaction details?**

**Scenario 2**
Attacker sends a body with:

```json
{
    "username": "attacker",
    "password": "pass', true);--",
    "is_admin": "false"
}
```

This will result in the following SQL query being executed:

```sql
INSERT INTO users (username, password, is_admin) VALUES ('attacker', 'pass', true);--', 'false');
```

> **Q: What can be a potential consequence of this vulnerability?**

> **Q: Does this user have proper admin powers? Can it view everything?**

After creating the admin user, try messing around on the website and see what you can do. Try to find out what the admin can do that the regular user cannot, and how much data is suddenly available to the hacker.

## Detecting SQL Injection vulnerabilities

By now, you have seen that many vulnerabilities can be exploited by injecting SQL queries into the application. It is evident that we must try to prevent this from happening. While people often manually browse through the code to try to find vulnerabilities, you can imagine that many mistakes go unnoticed due to human error. As such, many automated tools exist to (try to) detect as many vulnerabilities as possible in a code-base.

The most popular tools are white-box scanners and black-box scanners. White-box scanners analyse the source code of an application, while black-box scanners analyse the application from the outside (i.e. by sending requests to the application and analysing the responses). In this tutorial, we will be mainly looking at a white-box scanner for Node.js applications called `njsscan`. Moreover, we will also use a SAST (Static Application Security Testing) tool called `bearer CLI` to scan our application for vulnerabilities.

### Installing the tools

Like we mentioned earlier, `nix-shell` will take care of the installation for us. However, if you are interested in installing the tools manually, the steps are relatively simple. Simply run the following commands:

```bash
npm install -g njsscan
npm install -g @bearer/cli
```

alternatively, you can also run the following if you have Homebrew installed:

```bash
brew install njsscan
brew install Bearer/tap/bearer
```

### White-box scanning

Now that you have `njsscan` installed, let's take a look at what we can do with the tool. Run the following command and read the documentation carefully:

```bash
njsscan --help
```

> **Q: What is the command for running `njsscan` on the `./backend` directory?**

> Note: we will be using this directory for all our scanning

Try running the command that you found in the previous question. As you can see, many (tiny) vulnerabilities were found of differeing vulnerabilities. This output is rather overwhelming, so let's try to narrow it down. For now, we are only interested in displaying the vulnerabilities in the files with the highest severity rules. Let's filter the results to only show those files. This is done by creating a so-called `.njsscan` file and adding the following contents:

```yaml
- nodejs-extensions:
  - .js

  ignore-filenames:
  - auth.js

  severity-filter:
  - ERROR
```

If you now run the command

```bash
njsscan --config .njsscan <PATH>
```

it will only show the vulnerabilities with the highest severities.

> **Q: How many vulnerabilities were found?**

> **Q: What is the CWE of the vulnerability that we are interested in?**

> **Q: What is the filename that contains the SQL Injection vulnerabilities?**

### SAST scanning

Running `bearer` is relatively simple. Simply run the following command:

```bash
bearer scan ./backend
```

This will give you an output that looks fairly similar to the output of `njsscan`. However, `bearer` also provides a web interface that allows you to view the vulnerabilities in a more user-friendly way. To start the web interface, run the following command:

```bash
bearer ui
```

### Fixing the vulnerabilities

Now that we have found the vulnerabilities, let's try to fix them. There are mainly two approaches:

1. Using query parameters
2. Sanitizing the input

Let us try to fix the vulnerabilities using both approaches. First, let's try to use query parameters. Query parameters are a way to separate the SQL query from the user input. This way, the user input is never directly injected into the SQL query, and thus cannot be used to inject malicious SQL queries. You can find more information about how to implement them [here](https://www.stackhawk.com/blog/node-js-sql-injection-guide-examples-and-prevention/).

> **Q: After implementing the query parameters, run `njsscan` and `bearer` again. Give the number of vulnerabilities found.**

As you can see, the number of vulnerabilities has decreased, but there are still some vulnerabilities left. This is because we have not yet sanitized the input. Sanitizing the input means that we remove any characters that could be used to inject SQL queries. You can find more information about how to implement this [here](https://www.stackhawk.com/blog/node-js-sql-injection-guide-examples-and-prevention/).

> **Q: After implementing the sanitization as well, run `njsscan` and `bearer` again. Are there still SQL Injection vulnerabilities present in the code?**

We see now that we have no more SQL injections left, even the second-order ones. Hooray! Well done!

One quick note; while we did the previous steps manually, it is possible to do both at once and simply resolve the aforementioned issues as well by simply using the `sql-template-strings` package. This package allows us to safely inject variables into SQL queries. You can find the documentation [here](https://www.npmjs.com/package/sql-template-strings).
