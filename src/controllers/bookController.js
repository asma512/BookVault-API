const Book = require('../models/Book');

const buildBookQuery = (req) => {
  const query = {};

  if (req.query.genre) query.genre = req.query.genre;
  if (req.query.status) query.status = req.query.status;
  if (req.query.author) query.author = { $regex: req.query.author, $options: 'i' };
  if (req.query.minPrice) query.price = { ...query.price, $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) query.price = { ...query.price, $lte: Number(req.query.maxPrice) };

  return query;
};

const buildSortObject = (sortValue) => {
  const defaultSort = { createdAt: -1 };

  if (!sortValue) return defaultSort;

  const sortEntries = sortValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (sortEntries.length === 0) return defaultSort;

  const sort = {};

  sortEntries.forEach((entry) => {
    const [field, direction = 'asc'] = entry.split(':');
    if (!field) return;

    const normalizedField = field.trim();
    const normalizedDirection = direction.trim().toLowerCase();

    sort[normalizedField] = normalizedDirection === 'desc' || normalizedDirection === '-1' ? -1 : 1;
  });

  return Object.keys(sort).length > 0 ? sort : defaultSort;
};

const getBooks = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = buildBookQuery(req);
    const sort = buildSortObject(req.query.sort || 'createdAt:-1');

    const [books, total] = await Promise.all([
      Book.find(query)
        .populate('owner', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Book.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      results: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const book = await Book.create({
      ...req.body,
      owner: req.user._id
    });

    const populatedBook = await book.populate('owner', 'username email');

    return res.status(201).json({
      success: true,
      book: populatedBook
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('owner', 'username email');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    return res.status(200).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own books' });
    }

    Object.assign(book, req.body);
    await book.save();

    const updatedBook = await book.populate('owner', 'username email');

    return res.status(200).json({ success: true, book: updatedBook });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own books' });
    }

    await book.deleteOne();

    return res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  createBook,
  getBookById,
  updateBook,
  deleteBook
};
