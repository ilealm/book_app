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
app.post('/deleteBooks', deleteBook)

//404 error is no page is found
app.get('*', (request, response) => response.status(400).render('./pages/error.ejs'));


function getAllMyBooks(request, response){
  let sql = 'SELECT * FROM myBooks;';
  //count of rows in myBooks
  let sqlCount = 'SELECT COUNT(id) from myBooks;';
  database.query(sqlCount)
  .then(countResults => {
    // console.log('sql count results', countResults.rows)
    database.query(sql)
    .then(results =>{
      let arrMyBooks = results.rows;
      response.render('./pages/index.ejs', ({ myBooks : arrMyBooks, myBookCount : countResults.rows }));
    })
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
  // bookshelf = 'Updated'; // TODO: obtain bookshelf from dropbox
  console.log('value of bookshelf', bookshelf);
  let sql = 'UPDATE myBooks SET title=$1, image_url=$2, author=$3, description=$4, isbn=$5, bookshelf=$6 WHERE id=$7;';
  let safeValues=[title, image_url, authors, description, isbn, bookshelf, id]
  database.query(sql,safeValues)
    .then(results => {
      // console.log('table upd',results);
      let sqlUpdBook = 'SELECT * FROM myBooks WHERE id=$1;';
      let safeValuesId = [id];
      database.query(sqlUpdBook, safeValuesId)
        .then(updResults => {
          // console.log(updResults.rows);
          response.render('./pages/books/show.ejs',{myBook : updResults.rows})
        })
    })
}

function deleteBook(request,response){

  let {id} = request.body
  let sql = 'DELETE FROM myBooks WHERE id=$1;';
  let safeValues = [id];
  database.query(sql,safeValues)
    .then(results =>{
      getAllMyBooks(request, response)
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
  let bookShelf = 'Favorites';
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

function Book (obj) {
  const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';
  this.title = (obj.title) ? obj.title : 'Title not available';
  this.authors = (obj.authors[0]) ? obj.authors[0] : 'Author not available';
  this.description = (obj.description) ? obj.description : 'Description not available';

  this.image_url = (obj.imageLinks) ? obj.imageLinks.thumbnail : placeholderImage;
  this.isbn = obj.industryIdentifiers[0].identifier ? obj.industryIdentifiers[0].identifier : 'ISBN not available'
}

// only turn on the server if you first connect to the database
database.connect()
  .then(() => {
    app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
  });