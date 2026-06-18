const express = require('express');
const BookController = require('../controllers/BookController');

const router = express.Router();

router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);
router.post('/', BookController.createBook);
router.post('/quick', BookController.quickAddBook);
router.put('/:id', BookController.updateBook);
router.delete('/:id', BookController.deleteBook);
router.patch('/:id/rating', BookController.updateRating);
router.patch('/:id/progress', BookController.updateProgress);

module.exports = router;
