'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3001;
const pg = require('pg');
const superagent = require('superagent');










const database = new pg.Client(process.env.DATABASE_URL);
database.on('error', err => console.error(err));

//404 error is no page is found
app.get('*', (request, response) => response.status(404).send('Sorry, chuck norris says that route does not exist.'));

// only turn on the server if you first connect to the database
database.connect()
    .then(() => {
        app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
    });