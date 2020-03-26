DROP TABLE IF EXISTS myBooks;

CREATE TABLE myBooks (
  id serial primary key,
  title TEXT,
  author TEXT,
  description TEXT,
  isbn TEXT,
  image_url TEXT,
  bookShelf VARCHAR(2500)
);

INSERT INTO myBooks (title,author,description,isbn,image_url,bookShelf) 
VALUES (
  'Miranda in Milan',
  'Katharine Duckett',
  'With Miranda in Milan, debut author Katharine Duckett reimagines the consequences of Shakespeare’s The Tempest, casting Miranda into a Milanese pit of vipers and building a queer love story that lifts off the page in whirlwinds of feeling. After the tempest, after the reunion, after her father drowned his books, Miranda was meant to enter a brave new world. Naples awaited her, and Ferdinand, and a throne. Instead she finds herself in Milan, in her father’s castle, surrounded by hostile servants who treat her like a ghost. Whispers cling to her like spiderwebs, whispers that carry her dead mother’s name. And though he promised to give away his power, Milan is once again contorting around Prospero’s dark arts. With only Dorothea, her sole companion and confidant to aid her, Miranda must cut through the mystery and find the truth about her father, her mother, and herself. “Love and lust, mothers and monsters, magicians and masked balls, all delivered with Shakespearean panache.” —Nicola Griffith, author of Hild “Miranda in Milan is somehow both utterly charming and perfectly sinister, and altogether delightful. A pleasure for any lover of romance, myth, and magic—whether or not they',
  '9781250306319',
  'http://books.google.com/books/content?id=4MhnDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  'Favorites'
);

INSERT INTO myBooks (title,author,description,isbn,image_url,bookShelf) 
VALUES (
  'The Happiness Hypothesis',
  'Jonathan Haidt',
  'Explores ten great insights about man, the purpose of life, and happiness selected from diverse traditions and uses current scientific research to question and discuss the ideas.',
  '0465028012',
  'http://books.google.com/books/content?id=Tz4wVAp6qL0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  'Favorites'
);

INSERT INTO myBooks (title,author,description,isbn,image_url,bookShelf) 
VALUES (
  'Cracking the PM Interview',
  'Gayle Laakmann McDowell',
  'How many pizzas are delivered in Manhattan? How do you design an alarm clock for the blind? What is your favorite piece of software and why? How would you launch a video rental service in India? This book will teach you how to answer these questions and more. Cracking the PM Interview is a comprehensive book about landing a product management role in a startup or bigger tech company.',
  '0984782818',
  'http://books.google.com/books/content?id=vFr9nQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  'Favorites'
);

-- SELECT * FROM myBooks;