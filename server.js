'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3001;
const pg = require('pg');
const superagent = require('superagent');

const ejs = require('ejs')
app.set('view engine', 'ejs')

app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));


const database = new pg.Client(process.env.DATABASE_URL);
database.on('error', err => console.error(err));

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs');
});

app.get('/',getBooks);
app.get('/books/:book_id',getOneBook);
app.post('/books',addBook);



function getBooks(request, response){
  let sql = 'SELECT * FROM myBooks;';
  database.query(sql)
    .then(results =>{
      let arrMyBooks = results.rows;
      response.render('./pages/index.ejs',{ myBooks : arrMyBooks});
    })
}

function getOneBook(request, response){
  let myParams= request.params;
  let sql = 'SELECT * FROM myBooks WHERE id=$1;';
  let safeValues = [myParams.book_id];
  database.query(sql,safeValues)
    .then(results =>{
      response.render('pages/books/detail.ejs',{myBook : results.rows})
    })
}

function addBook(request, response){
  console.log ('in addBook', request.body);
  // TODO: we where trying to obtain the info to save on DB
  let {title, image_url, authors, description, isbn } = request.body;
  console.log(title, image_url, authors, description, isbn );

  let sql = 'INSERT INTO myBooks (title, author, description, isbn, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING ID;';
  let safeValues = [title, image_url, authors, description, isbn];
  // Corey: the data is been inserted on the BD, but is been inserted all in the sale column as an objec
  database.query(sql, safeValues)
    .then(results =>{
      let id = results.rows;
      sql = 'SELECT * FROM myBooks WHERE od = $1;';
      safeValues = [id];
      database.connect(sql,safeValues)
        .then(results =>{
          console.log(results);
          // TODO redirect (render) to detail.ejs sending results
        })
    })
}


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
      // console.log(results.body.items[0].volumeInfo)
      let finalBookArray = bookArray.map(book => {
        return new Book(book.volumeInfo);
      })
      // console.log(finalBookArray);
      response.render('./pages/searches/show.ejs', {Book: finalBookArray});
    })

});

//404 error is no page is found
app.get('*', (request, response) => response.render('./pages/error.ejs'));

//lab 11.3.2 - "Prevent mixed content warnings. Resource URLs returned by the API that are  unsecure should be converted to use a secure protocol when the data is processed in the Book constructor." ?????????????????

function Book (obj) {
  const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';
  this.title = (obj.title) ? obj.title : 'Chuck Norris says No';
  this.authors = (obj.authors[0]) ? obj.authors[0] : 'Iris Leal says she wrote this book';
  this.description = (obj.description) ? obj.description : 'Corey says you should probably just watch the moview';
  //TODO: Prevent mixed content warnings
  this.image_url = (obj.imageLinks) ? obj.imageLinks.thumbnail : placeholderImage;
  this.isbn = obj.industryIdentifiers[0].identifier;
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


// app.listen(PORT,() => console.log(`Listening on port ${PORT}`));






// only turn on the server if you first connect to the database
database.connect()
.then(() => {
    app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
});