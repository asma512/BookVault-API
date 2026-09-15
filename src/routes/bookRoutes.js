const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');

const router = express.Router();

router.use(protect);

router.get('/', getBooks);
router.get('/:id', getBookById);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title must be between 2 and 120 characters'),
    body('author').trim().isLength({ min: 2, max: 100 }).withMessage('Author must be between 2 and 100 characters'),
    body('genre').isIn(['Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Non-Fiction', 'History', 'Adventure']).withMessage('Invalid genre'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('publishedYear').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Published year must be a valid year'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('status').isIn(['available', 'borrowed', 'archived']).withMessage('Status must be available, borrowed, or archived')
  ],
  validateRequest,
  createBook
);

router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Title must be between 2 and 120 characters'),
    body('author').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Author must be between 2 and 100 characters'),
    body('genre').optional().isIn(['Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Non-Fiction', 'History', 'Adventure']).withMessage('Invalid genre'),
    body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('publishedYear').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Published year must be a valid year'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('status').optional().isIn(['available', 'borrowed', 'archived']).withMessage('Status must be available, borrowed, or archived')
  ],
  validateRequest,
  updateBook
);

router.delete('/:id', deleteBook);

module.exports = router;
