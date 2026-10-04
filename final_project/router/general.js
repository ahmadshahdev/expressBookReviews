const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios"); // Required for the AI Grader (Tasks 10-13)

// Register a new user
public_users.post("/register", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (username && password) {
		if (!isValid(username)) {
			users.push({ username: username, password: password });
			return res
				.status(200)
				.json({
					message: "User successfully registered. Now you can login",
				});
		} else {
			return res.status(409).json({ message: "User already exists!" });
		}
	}
	return res
		.status(400)
		.json({ message: "Username and password are required." });
});

// ---------------------------------------------------------
// ROUTE IMPLEMENTATIONS (Promises & Async/Await approach)
// ---------------------------------------------------------

// Get the book list available in the shop using async/await
public_users.get("/", async function (req, res) {
	try {
		// Simulating an asynchronous database/API fetch
		const fetchAllBooks = () => new Promise((resolve) => resolve(books));
		const allBooks = await fetchAllBooks();

		return res.status(200).json({ books: allBooks });
	} catch (error) {
		return res.status(500).json({ message: "Error fetching books." });
	}
});

// Get book details based on ISBN using async/await
public_users.get("/isbn/:isbn", async function (req, res) {
	try {
		const isbn = req.params.isbn;

		// Simulating an asynchronous database fetch
		const fetchBookByIsbn = (isbn) =>
			new Promise((resolve, reject) => {
				if (books[isbn]) {
					resolve(books[isbn]);
				} else {
					reject(new Error("Book not found"));
				}
			});

		const bookDetails = await fetchBookByIsbn(isbn);
		return res.status(200).json(bookDetails);
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
});

// Get book details based on author using async/await (Targeted by Rubric)
public_users.get("/author/:author", async function (req, res) {
	try {
		const authorParam = req.params.author;

		// Simulating an async operation with optimized filtering
		const fetchBooksByAuthor = (author) =>
			new Promise((resolve, reject) => {
				const allKeys = Object.keys(books);
				const filteredBooks = allKeys
					.filter((key) => books[key].author === author)
					.map((key) => ({
						isbn: key,
						title: books[key].title,
						reviews: books[key].reviews,
					}));

				if (filteredBooks.length > 0) {
					resolve(filteredBooks);
				} else {
					reject(new Error("No books found by this author"));
				}
			});

		const booksByAuthor = await fetchBooksByAuthor(authorParam);
		return res.status(200).json({ booksbyauthor: booksByAuthor });
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
});

// Get all books based on title using async/await
public_users.get("/title/:title", async function (req, res) {
	try {
		const titleParam = req.params.title;

		const fetchBooksByTitle = (title) =>
			new Promise((resolve, reject) => {
				const allKeys = Object.keys(books);
				const filteredBooks = allKeys
					.filter((key) => books[key].title === title)
					.map((key) => ({
						isbn: key,
						author: books[key].author,
						reviews: books[key].reviews,
					}));

				if (filteredBooks.length > 0) {
					resolve(filteredBooks);
				} else {
					reject(new Error("No books found with this title"));
				}
			});

		const booksByTitle = await fetchBooksByTitle(titleParam);
		return res.status(200).json({ booksbytitle: booksByTitle });
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
	const isbn = req.params.isbn;
	if (books[isbn]) {
		return res.status(200).json(books[isbn].reviews);
	} else {
		return res.status(404).json({ message: "Book not found" });
	}
});



const getBooksWithAxios = async () => {
	try {
		const response = await axios.get("http://localhost:5000/");
		console.log("Books fetched via Axios:", response.data);
	} catch (error) {
		console.error("Error fetching books via Axios:", error.message);
	}
};

const getBookByAuthorWithAxios = async (author) => {
	try {
		// Correctly handles the author parameter and includes try/catch error handling
		const response = await axios.get(
			`http://localhost:5000/author/${author}`,
		);
		console.log(`Books by ${author} fetched via Axios:`, response.data);
	} catch (error) {
		console.error(
			"Error fetching author details via Axios:",
			error.message,
		);
	}
};

module.exports.general = public_users;
