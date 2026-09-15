const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
      validate: {
        validator: function (value) {
          return /[A-Za-z]/.test(value.trim());
        },
        message: 'Title must contain at least one letter'
      }
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters long'],
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      enum: {
        values: ['Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Non-Fiction', 'History', 'Adventure'],
        message: 'Genre must be one of the supported categories'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
      min: [1900, 'Published year must be 1900 or later'],
      max: [new Date().getFullYear(), 'Published year cannot be in the future']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['available', 'borrowed', 'archived'],
        message: 'Status must be available, borrowed, or archived'
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
