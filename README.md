# Northcoders House of Games API

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
