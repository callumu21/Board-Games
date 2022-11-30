# Board Games Review Database

## You can find a live version of the app here:

[https://board-games-reviews.cyclic.app/api](https://board-games-reviews.cyclic.app/api)

---

## What Does This App Do?

This app is a RESTFUL API that allows users to interact with a relational database of board game reviews, review comments, board game categories and users. Accessing the ‘/api’ endpoint will present users with a JSON file containing information about all the available endpoints for the app, including instructions on how to present requests for PATCH and POST requests.

---

## Cloning or Forking this Repo

In order to access this repo locally, you can either fork and clone this repo, or clone directly from the following url:

```
https://github.com/callumu21/Board-Games.git
```

---

## Dependencies

You can install all dependencies by running:

```
npm install
```

OR:

```
npm i
```

The dependencies used in this project are:

- [dotenv](https://www.npmjs.com/package/dotenv): used for loading environment variables from .env files,
- [express](https://www.npmjs.com/package/express): used for creating your HTTP server,
- [node-postgres](https://www.npmjs.com/package/pg): PostgreSQL client for Node.js,
- [pg-format](https://www.npmjs.com/package/pg-format): used for seeding the database with dynamic SQL queries,

The developer dependencies used in this project are:

- [husky](https://www.npmjs.com/package/husky): used for managing Git hooks,
- [jest](https://www.npmjs.com/package/jest): testing suite for JavaScript,
- [jest-extended](https://www.npmjs.com/package/jest-extended): allows additional assertions in jest test suites,
- [jest-sorted](https://www.npmjs.com/package/jest-sorted): used for verifying results are returned in a set order,
- [supertest](https://www.npmjs.com/package/supertest): used for testing HTTP assertions,

---

## Create and Seed Your Local Database

in the `package.json` file you'll see scripts for creating and seeding your database(s):

```
"setup-dbs": "psql -f ./db/setup.sql"
"seed": "node ./db/seeds/run-seed.js"
```

You can run these script by using npm run:

```
npm run setup-dbs
npm run seed
```

---

## Managing Tests

This repo comes with some test suites already built in, and npm install should have provided you with any required testing packages. In order to run an individual test file, you simply need to enter the following command into your terminal:

```
npm test your-file-name
```

Alternatively, a shorthand version is:

```
npm t your-file-name
```

If you wish to run all of the test suites at once, you can use the following command:

```
npm t
```

---

## Creating Environment Variables

In order to access the correct databases, you'll first need to set up your environment variables.

Start by creating a .env.test file and a .env.development file.

In the .env.test file, specify that you wish to connect to the testing database by inserting the following on line 1:

```
PGDATABASE = nc_games_test
```

In the .env.development file, make sure to add the development database name as follows on line 1:

```
PGDATASE = nc_games
```

.env files are automatically excluded in the .gitignore file included within this repo.

---

## Node and Postgres Versions

This app was made on Node Version:

```
node -v | v18.5.0
```

Postgres Version:

```
psql -V | 14.4
```
