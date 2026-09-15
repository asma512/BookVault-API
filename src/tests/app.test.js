const test = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const app = require('../app');

let mongoServer;
let request;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  request = supertest(app);
});

test.after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('registers a user and logs in', async () => {
  const registerResponse = await request
    .post('/api/auth/register')
    .send({
      username: 'reader1',
      email: 'reader1@example.com',
      password: 'Password123!'
    })
    .expect(201);

  assert.ok(registerResponse.body.token);
  assert.equal(registerResponse.body.user.email, 'reader1@example.com');

  const loginResponse = await request
    .post('/api/auth/login')
    .send({
      email: 'reader1@example.com',
      password: 'Password123!'
    })
    .expect(200);

  assert.ok(loginResponse.body.token);
});

test('creates, lists, filters, sorts, paginates and deletes books', async () => {
  const registerResponse = await request
    .post('/api/auth/register')
    .send({
      username: 'librarian',
      email: 'librarian@example.com',
      password: 'Password123!'
    })
    .expect(201);

  const token = registerResponse.body.token;

  const createdBook = await request
    .post('/api/books')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      genre: 'Fantasy',
      description: 'A classic adventure.',
      publishedYear: 1937,
      price: 18.5,
      status: 'available'
    })
    .expect(201);

  assert.equal(createdBook.body.book.title, 'The Hobbit');

  await request
    .post('/api/books')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      genre: 'Fantasy',
      description: 'A fantasy novel.',
      publishedYear: 2007,
      price: 25,
      status: 'available'
    })
    .expect(201);

  const listResponse = await request
    .get('/api/books?genre=Fantasy&sort=price:-1&limit=1&page=1')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(listResponse.body.results.length, 1);
  assert.ok(listResponse.body.pagination.totalPages >= 1);
  assert.ok(listResponse.body.results[0].price >= 18.5);

  const deleteResponse = await request
    .delete(`/api/books/${createdBook.body.book._id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(deleteResponse.body.message, 'Book deleted successfully');
});

test('returns validation errors for invalid book payloads', async () => {
  const userResponse = await request
    .post('/api/auth/register')
    .send({
      username: 'validator',
      email: 'validator@example.com',
      password: 'Password123!'
    })
    .expect(201);

  const token = userResponse.body.token;

  const response = await request
    .post('/api/books')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'A',
      author: '',
      genre: 'Unknown',
      description: 'short',
      publishedYear: 1800,
      price: -5,
      status: 'not-valid'
    })
    .expect(400);

  assert.ok(response.body.errors.length >= 1 || response.body.message);
});
