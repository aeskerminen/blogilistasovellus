const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')

const api = supertest(app)

const initialBlogs = [
    { title: "The Trees", author: "Artturi", url: "no url", likes: 0 },
    { title: "The Moons", author: "Severi", url: "no url", likes: 2 },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json and there is the correct amount of them', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const res = await api.get("/api/blogs")
    assert.strictEqual(res.body.length, initialBlogs.length)
})

test('unique identifier property is named id, not _id', async () => {
    const res = await api.get("/api/blogs")

    // it is enough to check the first blog since they all share the same schema
    assert.equal(Object.hasOwn(res.body[0], 'id'), true)
    assert.equal(Object.hasOwn(res.body[0], '_id'), false)
})

after(async () => {
    await mongoose.connection.close()
})