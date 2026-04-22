const express = require('express');
const router = express.Router();
const { addBook, getReadingList, deleteBook, updateStatus } = require('../controllers/readingListController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, addBook);
router.get('/', authMiddleware, getReadingList);
router.delete('/:id', authMiddleware  ,deleteBook);
router.put('/:id', authMiddleware, updateStatus);

module.exports = router;