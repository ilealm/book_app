'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3001;
// const pg = require('pg');
const superagent = require('superagent');

const ejs = require('ejs')      
app.set('view engine', 'ejs')

app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new.ejs');
});

app.get('/', (req, res) => {
    res.render('pages/index.ejs');
});


app.post('/searches', (request, response) => {
    console.log('cd and li search', request.body);
    // { search: [ '1984', 'title' ] }
    let thingTheyAreSearchingFor = request.body.search[0];
    let titleOrAuthor = request.body.search[1];
  
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  
    if(titleOrAuthor === 'title'){
      url += `+intitle:${thingTheyAreSearchingFor}`;
    } else if(titleOrAuthor === 'author'){
      url += `+inauthor:${thingTheyAreSearchingFor}`;
    }
    console.log(url)

    superagent.get(url)
        .then(results => {
            let bookArray = results.body.items;
            // console.log(bookArray);
            let finalBookArray = bookArray.map(book => {
                return new Book(book.volumeInfo);
            })
            console.log(finalBookArray);
            response.render('./pages/searches/show.ejs', {Book: finalBookArray});
        })

    });
    
    function Book (obj) {
        const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';
        this.title = obj.title;
        this.authors = obj.authors;
        this.description = obj.description;
        obj.readingModes.image !== null ? this.image = obj.readingModes.image : this.image = placeholderImage;
    }


app.listen(PORT,() => console.log(`Listening on port ${PORT}`));


// const database = new pg.Client(process.env.DATABASE_URL);
// database.on('error', err => console.error(err));

//404 error is no page is found
// app.get('*', (request, response) => response.status(404).send('Sorry, chuck norris says that route does not exist.'));

// only turn on the server if you first connect to the database
// database.connect()
//     .then(() => {
//         app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
//     });