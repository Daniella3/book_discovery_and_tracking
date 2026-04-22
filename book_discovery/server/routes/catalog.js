const express = require('express');
const router = express.Router();
const { getBookById, searchBooks } = require('../controllers/catalogController');

router.get('/search', searchBooks);
router.get('/books/:id', getBookById);

module.exports = router;
