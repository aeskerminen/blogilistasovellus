const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const User = require('../models/user')
const mongoose = require('mongoose')

const api = supertest(app)

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salaisuus', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'aeskerm',
      name: 'Artturi Kerminen',
      password: 'secret',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })


  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('Username is already taken...'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })


  test('creation fails with proper statuscode and message if username or password is too short', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'te',
      name: 'Superuser',
      password: 'st',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('Password and username must be three or more letters long.'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username or password is undefined', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      name: 'Superuser',
      password: '',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('Username and password must be given...'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })