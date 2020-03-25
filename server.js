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
    // console.log('cd and li search', request.body);
    // { search: [ '1984', 'title' ] }
    let thingTheyAreSearchingFor = request.body.search[0];
    let titleOrAuthor = request.body.search[1];
  
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  
    if(titleOrAuthor === 'title'){
      url += `+intitle:${thingTheyAreSearchingFor}`;
    } else if(titleOrAuthor === 'author'){
      url += `+inauthor:${thingTheyAreSearchingFor}`;
    }
    // console.log(url)

    superagent.get(url)
        .then(results => {
            let bookArray = results.body.items;
            // console.log(bookArray);
            console.log(results.body.items[0].volumeInfo)


            let finalBookArray = bookArray.map(book => {
                return new Book(book.volumeInfo);
            })
            // console.log(finalBookArray);
            response.render('./pages/searches/show.ejs', {Book: finalBookArray});
        })

    });
    

    //lab 11.3.2 - "Prevent mixed content warnings. Resource URLs returned by the API that are  unsecure should be converted to use a secure protocol when the data is processed in the Book constructor." ?????????????????

    function Book (obj) {
        const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';
        this.title = (obj.title) ? obj.title : 'Chuck Norris says No';
        this.authors = (obj.authors[0]) ? obj.authors[0] : 'Iris Leal says she wrote this book';
        this.description = (obj.description) ? obj.description : 'Corey says you should probably just watch the moview';

        this.image = (obj.imageLinks) ? obj.imageLinks.thumbnail : placeholderImage;
        // console.log(this.image);


//ISBN - same as imageLinks
// industryIdentifiers:
//    [ { type: 'ISBN_13', identifier: '9781443816281' },
//      { type: 'ISBN_10', identifier: '1443816280' } ],

//   imageLinks:
//    { smallThumbnail:
//       'http://books.google.com/books/content?id=ThAaBwAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
//      thumbnail:
//       'http://books.google.com/

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