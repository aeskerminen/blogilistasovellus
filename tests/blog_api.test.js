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
    assert(Object.hasOwn(res.body[0], 'id'))
    assert(!Object.hasOwn(res.body[0], '_id'))
})

test('post request to /api/blogs creates a new post', async () => {
    const testBlog = { title: "A test in a test", author: "The tester", url: "no url", likes: 0 };

    await api.post("/api/blogs").send(testBlog).expect(201).expect('Content-Type', /application\/json/)

    const res = await api.get("/api/blogs")

    const returnedBlog = res.body[2]

    assert.strictEqual(res.body.length, initialBlogs.length + 1)

    assert.strictEqual(returnedBlog.title, testBlog.title)
    assert.strictEqual(returnedBlog.author, testBlog.author)
    assert.strictEqual(returnedBlog.url, testBlog.url)
    assert.strictEqual(returnedBlog.likes, testBlog.likes)
})

test('test if likes property behaves correctly', async () => {
    const testBlog = { title: "A test in a test", author: "The tester", url: "no url"};

    await api.post("/api/blogs").send(testBlog).expect(201).expect('Content-Type', /application\/json/)

    const res = await api.get("/api/blogs")

    const returnedBlog = res.body[2]

    assert.strictEqual(returnedBlog.likes, 0)
})

test('test if missing title or url generates errror 400 Bad request', async () => {
    const noUrl = { title: "A test in a test", author: "The tester", likes: 0};
    const noTitle = { author: "The tester", url: "no url", likes: 0};

    const res1 = await api.post("/api/blogs").send(noUrl).expect(400)
    const res2 = await api.post("/api/blogs").send(noTitle).expect(400)
})

test('test if deleting a blog works', async () => {
    let res = await api.get("/api/blogs")
    const returnedBlog = res.body[0]
    const id = returnedBlog.id

    await api.delete(`/api/blogs/${id}/delete`).expect(204)

    res = await api.get("/api/blogs")

    assert.strictEqual(res.body.length, 1)
})

test('test if deleting a non-existent blog returns error', async () => {
    await api.delete(`/api/blogs/3219sajjs/delete`).expect(400)
})

after(async () => {
    await mongoose.connection.close()
})