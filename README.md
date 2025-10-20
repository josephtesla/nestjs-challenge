# Record Store Challenge API

## UPDATES

#### 2025-10-20
Added endpoint to populate database with records data for in-depth testing purposes.

#### 2025-06-02
I've completed the assessment, ensuring a fully functional and performant API. Kindly review the "System Documentation - Hostelworld_GodwinJoseph.pdf" file (in the root) I've put together to get a succint overview of the major design/architectural changes and the reasoning behind the final implementation.

## Description

This is a **NestJS** application starter with MongoDB integration. If necessary, it provides a script to boot a Mongo emulator for Docker. This setup includes end-to-end tests, unit tests, test coverage, linting, and database setup with data from `data.json`.

## Installation

### Install dependencies:

```bash
$ npm install
````

### Start Local Infra (MongoDB + Redis)
This project uses a single docker compose file to run the local infrastructure (MongoDB + Redis) required by the API, including the cache service.

```
npm run infra:start
```

This boots:
- MongoDB (replica set enabled) on `localhost:27017`
- Redis on `localhost:6379`

You can configure your `.env` file as follows (defaults are already handled by the app config):

```
MONGO_URL=mongodb://localhost:27017/records
REDIS_URL=redis://localhost:6379
```

To stop the infrastructure when you're done:

```
npm run infra:down
```

### MongoDB Data Setup
The `data.json` file contains example records to seed your database. The setup script will import the records from this file into MongoDB. Ensure the local infra (above) is running and `MONGO_URL` points to `localhost:27017` before running the script.

To set up the database with the example records:

```
npm run setup:db
```
This will prompt the user to cleanup (Y/N) existing collection before importing data.json


#### data.json Example
Here’s an example of the data.json file that contains records:
```
[
    {
        "artist": "Foo Fighters",
        "album": "Foo Fighers",
        "price": 8,
        "qty": 10,
        "format": "CD",
        "category": "Rock",
        "mbid": "d6591261-daaa-4bb2-81b6-544e499da727"
  },
  {
        "artist": "The Cure",
        "album": "Disintegration",
        "price": 23,
        "qty": 1,
        "format": "Vinyl",
        "category": "Alternative",
        "mbid": "11af85e2-c272-4c59-a902-47f75141dc97"
  },
]
```

### Running the App
#### Development Mode
To run the application in development mode (with hot reloading):

```
npm run start:dev
```
#### Production Mode
To build and run the app in production mode:

```
npm run start:prod
```

### Tests
#### Run Unit Tests
To run unit tests:

```
npm run test
```
To run unit tests with code coverage:

```
npm run test:cov
```
This will show you how much of your code is covered by the unit tests.
#### Run End-to-End Tests
To run end-to-end tests:
```
npm run test:e2e
```
Run Tests with Coverage


Run Linting
To check if your code passes ESLint checks:

```
npm run lint
```
This command will show you any linting issues with your code.
