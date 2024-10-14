const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const booksData = await (async () => {
      return books; // Replace this with an async call if needed in the future
    })();

    res.send(JSON.stringify(booksData, null, 4));
  } catch (error) {
    res.status(500).send({ message: 'Error fetching books data', error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const book = await (async () => {
      return books[isbn] || null;
    })();

    if (book) {
      res.send(book);
    } else {
      res.status(404).send({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error fetching book data' });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const booksByAuthor = await (async () => {
      return Object.fromEntries(
        Object.entries(books).filter(([_, book]) => book.author === author)
      );
    })();

    if (Object.keys(booksByAuthor).length > 0) {
      res.send(booksByAuthor);
    } else {
      res.status(404).send({ message: 'No books found for this author' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error fetching books by author' });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const booksByTitle = await (async () => {
      return Object.fromEntries(
        Object.entries(books).filter(([_, book]) => book.title === title)
      );
    })();

    if (Object.keys(booksByTitle).length > 0) {
      res.send(booksByTitle);
    } else {
      res.status(404).send({ message: 'No books found with this title' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error fetching books by title' });
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const reviews = await (async () => {
      const book = books[isbn];
      return book ? book.reviews : null;
    })();

    if (reviews) {
      res.send(reviews);
    } else {
      res.status(404).send({ message: 'No reviews found for this book' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error fetching reviews' });
  }
});

module.exports.general = public_users;
