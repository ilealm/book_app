'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3001;
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

const ejs = require('ejs')
app.set('view engine', 'ejs')

app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));


const database = new pg.Client(process.env.DATABASE_URL);
database.on('error', err => console.error(err));

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs');
});

app.get('/',getAllMyBooks);
app.post('/searches', doSearch);
app.get('/books/:book_id',getOneBook);
app.put('/books/:book_id',updOneBook);
app.post('/updateBooks',populateInfoToUpd);
app.post('/books',addBook);

//404 error is no page is found
app.get('*', (request, response) => response.status(400).render('./pages/error.ejs'));


function getAllMyBooks(request, response){
  let sql = 'SELECT * FROM myBooks;';
  database.query(sql)
    .then(results =>{
      let arrMyBooks = results.rows;
      response.render('./pages/index.ejs',{ myBooks : arrMyBooks});
    })
}

function doSearch(request,response){
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
      //TODO VALIDATE IF BOOKARRAY IS EMPTY
      //   console.log(bookArray[0].volumeInfo)
      let finalBookArray = bookArray.map(book => {
        return new Book(book.volumeInfo);
      })
      // console.log(finalBookArray);
      response.render('./pages/searches/show.ejs', {Book: finalBookArray});
    })

}

function getOneBook(request, response){
  let myParams= request.params;
  let sql = 'SELECT * FROM myBooks WHERE id=$1;';
  let safeValues = [myParams.book_id];
  database.query(sql,safeValues)
    .then(results =>{
      response.render('pages/books/show.ejs',{myBook : results.rows})
      // response.render('pages/books/detail.ejs',{myBook : results.rows})
    })
}

function updOneBook(request, response){
  console.log('in updOneBook');
  
  let {id, title, image_url, authors, description, isbn, bookshelf } = request.body;
  bookshelf = 'Updated'; // TODO: obtain bookshelf from dropbox

  let sql = 'UPDATE myBooks SET title=$1, image_url=$2, author=$3, description=$4, isbn=$5, bookshelf=$6 WHERE id=$7;';
  let safeValues=[title, image_url, authors, description, isbn, bookshelf, id]
  database.query(sql,safeValues)
    .then(results => {
      console.log('table upd',results);
    })
}

function populateInfoToUpd(request, response){
  // let {id, title, image_url, authors, description, isbn, bookShelf } = request.body;
  let {id } = request.body;
  let sqlBook = 'SELECT * FROM myBooks WHERE id=$1;';
  let safeValues = [id];
  database.query(sqlBook,safeValues)
    .then(resultsSqlBook =>{
      let sqlBookShelf = 'SELECT DISTINCT bookShelf FROM myBooks;';
      database.query(sqlBookShelf)
        .then(resultSqlBookShelf => {
          response.render('pages/books/edit.ejs',({myBook : resultsSqlBook.rows, bookShelf : resultSqlBookShelf.rows }));
        })
    })
}

function addBook(request, response){
//   console.log ('in addBook', request.body);
  let {title, image_url, authors, description, isbn } = request.body;
  // let bookShelf = 'To delete';
  let sql = 'INSERT INTO myBooks (title, author, description, isbn, image_url, bookShelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ID;';
  let safeValues = [title, authors, description, isbn, image_url, bookShelf];

  database.query(sql, safeValues)
    .then(results =>{
      let id = results.rows[0].id;
      sql = 'SELECT * FROM myBooks WHERE id = $1;';
      safeValues = [id];
      database.query(sql,safeValues)
        .then(results =>{
        //   console.log(results);
          response.render('./pages/books/show.ejs',{myBook : results.rows})
        })
    })
}





//lab 11.3.2 - "Prevent mixed content warnings. Resource URLs returned by the API that are  unsecure should be converted to use a secure protocol when the data is processed in the Book constructor." ?????????????????

function Book (obj) {
  const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';
  this.title = (obj.title) ? obj.title : 'Chuck Norris says No';
  this.authors = (obj.authors[0]) ? obj.authors[0] : 'Iris Leal says she wrote this book';
  this.description = (obj.description) ? obj.description : 'Corey says you should probably just watch the moview';
  //TODO: Prevent mixed content warnings, and obtain shelf
  this.image_url = (obj.imageLinks) ? obj.imageLinks.thumbnail : placeholderImage;
  this.isbn = obj.industryIdentifiers[0].identifier;
  // this.bookShelf = 'Favorites'; // here is not yet in favorites
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