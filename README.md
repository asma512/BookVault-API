# BookVault API

BookVault API is a Node.js + Express + MongoDB project built to meet the WA3677 and WA3678 assessment requirements. It demonstrates Mongoose schema design, validation, relationship modeling, query features, JWT authentication, and centralized error handling.

## Features
- Express API with MongoDB persistence using Mongoose
- Two related models: User and Book
- Full CRUD for books with JWT protection
- Filtering, sorting, and pagination on GET /api/books
- User registration and login using bcrypt + JWT
- Validation with express-validator
- Centralized error handling for validation, auth, not found, and server errors

## Tech Stack
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- express-validator
- dotenv

## Project Structure
```bash
src/
  app.js
  server.js
  config/
    db.js
  controllers/
    authController.js
    bookController.js
  middleware/
    authMiddleware.js
    errorHandler.js
    validateRequest.js
  models/
    User.js
    Book.js
  routes/
    authRoutes.js
    bookRoutes.js
  tests/
    app.test.js
```

## Setup
1. Clone the repository.
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file based on `.env.example`.
4. Start MongoDB locally or use MongoDB Atlas.
5. Run the app:
```bash
npm run dev
```

## Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bookvault
JWT_SECRET=your_super_secret_key_here
```

## API Endpoints

### Auth
#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "reader1",
  "email": "reader1@example.com",
  "password": "Password123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "reader1@example.com",
  "password": "Password123!"
}
```

### Books
#### Create a book
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "genre": "Fantasy",
  "description": "A classic adventure story full of bravery and wonder.",
  "publishedYear": 1937,
  "price": 18.5,
  "status": "available"
}
```

#### Get all books
```http
GET /api/books?genre=Fantasy&status=available&sort=price:-1&limit=2&page=1
Authorization: Bearer <token>
```

#### Get one book
```http
GET /api/books/:id
Authorization: Bearer <token>
```

#### Update a book
```http
PUT /api/books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 20,
  "status": "borrowed"
}
```

#### Delete a book
```http
DELETE /api/books/:id
Authorization: Bearer <token>
```

## Query Features
The GET /api/books endpoint supports:
- filtering by genre, status, author, and price range
- sorting via the `sort` query parameter using one or more fields
- pagination through `page` and `limit`

Examples:
```http
GET /api/books?genre=Fantasy&sort=price:-1&limit=2&page=1
GET /api/books?status=available&sort=price:-1,createdAt:desc&limit=5&page=1
```

This design is useful because it keeps the API flexible without overloading the database layer. The trade-off is that query complexity can grow if too many filter combinations are added at once, but it remains readable and efficient for this assessment scope.

## Mongoose Schema Design
### User model
The User model includes `username`, `email`, and `password` with validation rules such as minimum length and email validation. The `password` field is hashed before saving using bcrypt, which keeps authentication secure.

### Book model
The Book model includes `title`, `author`, `genre`, `description`, `publishedYear`, `price`, `status`, and a reference to the owner user. It uses strict validation rules like enums, minimum values, and length constraints. A custom validator on the `title` field ensures each title includes at least one letter, which shows a more detailed validation rule beyond standard `required` and `minlength` checks.

The `owner` field is an ObjectId reference to `User`, creating a real relationship between documents. The relationship is demonstrated with `populate('owner', 'username email')` in the Book controllers, showing how MongoDB documents are linked and fetched together.

## Authentication Approach
Registration and login use bcrypt to hash and verify passwords, while JWT is used to issue signed tokens. Protected routes check the `Authorization` header and verify the token before continuing.

This keeps the API secure and demonstrates a common production pattern for stateless authentication.

## Error Handling
The project includes centralized middleware to return consistent JSON responses for:
- 400 Validation errors
- 401 Unauthorized access
- 404 Resource not found
- 500 Internal server errors

Mongoose validation errors are transformed into readable messages, which helps users understand what went wrong without exposing internal details.

## NoSQL vs Relational Databases
MongoDB is a good choice when data is flexible, document-oriented, and evolves often. It is especially useful for rapidly changing application data, catalog systems, user-generated content, and a data model that benefits from embedded or referenced documents.

A relational database is a better option when data has strict schemas, strong transactional integrity, and complex joined queries are central to the system. For example, accounting systems or highly structured ERP-style domains often require relational consistency.

## Assessment Alignment
This project addresses the main assessment goals:
- Express + MongoDB API
- Mongoose schema design with validation and relationships
- CRUD endpoints persisted to MongoDB
- Query filtering, sorting, and pagination
- JWT authentication and protected routes
- express-validator input validation
- centralized error handling

## Running Tests
```bash
npm test
```

The test suite uses an in-memory MongoDB instance, so no local MongoDB setup is required for test execution.
