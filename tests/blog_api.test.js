const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const User = require('../models/user')

const api = supertest(app)

const initialBlogs = [
    { title: "The Trees", author: "Artturi", url: "no url", likes: 0 },
    { title: "The Moons", author: "Severi", url: "no url", likes: 2 },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()

    // Create temporary user
    await api.post("/api/users").send({username: 'test', name: 'test_name', password: 'test_pass'})
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
    // Login and receive jwt token
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token

    const testBlog = { title: "A test in a test", author: "The tester", url: "no url", likes: 0 };

    await api.post("/api/blogs").send(testBlog).set('Authorization', `Bearer ${auth_token}`).expect(201).expect('Content-Type', /application\/json/)

    const res = await api.get("/api/blogs")

    const returnedBlog = res.body[2]

    assert.strictEqual(res.body.length, initialBlogs.length + 1)

    assert.strictEqual(returnedBlog.title, testBlog.title)
    assert.strictEqual(returnedBlog.author, testBlog.author)
    assert.strictEqual(returnedBlog.url, testBlog.url)
    assert.strictEqual(returnedBlog.likes, testBlog.likes)
})

test('post request to /api/blogs returns 401 unauthorized if no token is supplied', async () => {
    // Login and receive jwt token
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token

    const testBlog = { title: "A test in a test", author: "The tester", url: "no url", likes: 0 };

    await api.post("/api/blogs").send(testBlog).expect(401)
})


test('test if likes property behaves correctly', async () => {
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token
    const testBlog = { title: "A test in a test", author: "The tester", url: "no url"};

    await api.post("/api/blogs").send(testBlog).set('Authorization', `Bearer ${auth_token}`).expect(201).expect('Content-Type', /application\/json/)

    const res = await api.get("/api/blogs")

    const returnedBlog = res.body[2]

    assert.strictEqual(returnedBlog.likes, 0)
})

test('test if missing title or url generates errror 400 Bad request', async () => {
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token
    
    const noUrl = { title: "A test in a test", author: "The tester", likes: 0};
    const noTitle = { author: "The tester", url: "no url", likes: 0};

    const res1 = await api.post("/api/blogs").set('Authorization', `Bearer ${auth_token}`).send(noUrl).expect(400)
    const res2 = await api.post("/api/blogs").set('Authorization', `Bearer ${auth_token}`).send(noTitle).expect(400)
})

test('test if deleting a blog works', async () => {
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token
   
    //set('Authorization', `Bearer ${auth_token}`)
    const testBlog = { title: "A test in a test", author: "The tester", url: "no url", likes: 0 };
    await api.post("/api/blogs").send(testBlog).set('Authorization', `Bearer ${auth_token}`).expect(201).expect('Content-Type', /application\/json/)

    let res = await api.get("/api/blogs")
    const id = res.body[res.body.length - 1].id

    await api.delete(`/api/blogs/${id}`).set('Authorization', `Bearer ${auth_token}`).expect(204)

    res = await api.get("/api/blogs")

    assert.strictEqual(res.body.length, 2)
})

test('test if deleting a non-existent blog returns error', async () => {
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token

    const testBlog = { title: "No-id-test", author: "The ID'er", url: "no url", likes: 0 };
    const blogObject = new Blog(testBlog)
    await blogObject.save()

    const req = await api.get("/api/blogs")
    const id = req.body[req.body.length - 1].id

    await Blog.findByIdAndDelete(id);
   
    await api.delete(`/api/blogs/${id}`).set('Authorization', `Bearer ${auth_token}`).expect(404)
})

test('test if updating a blog post works', async () => {
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token

    const testBlog = { title: "A test in a test", author: "The tester", url: "no url", likes: 0};

    await api.post("/api/blogs").send(testBlog).set('Authorization', `Bearer ${auth_token}`).expect(201).expect('Content-Type', /application\/json/)

    let res = await api.get("/api/blogs")

    const returnedBlog = res.body[2]
    const id = returnedBlog.id

    await api.put(`/api/blogs/${id}`).set('Authorization', `Bearer ${auth_token}`).send({likes: 30, author: 'testing bling'}).expect(200)

    res = await api.get("/api/blogs")

    console.log(res.body[2])

    assert.strictEqual(res.body[2].likes, 30)
    assert.strictEqual(res.body[2].author, 'testing bling')
})

test('test if passing wrong data type returns error', async () => {
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token

    const testBlog = { title: "A test in a test", author: "The tester", url: "no url", likes: 0};

    await api.post("/api/blogs").send(testBlog).set('Authorization', `Bearer ${auth_token}`).expect(201).expect('Content-Type', /application\/json/)

    let res = await api.get("/api/blogs")

    const returnedBlog = res.body[2]
    const id = returnedBlog.id

    await api.put(`/api/blogs/${id}`).set('Authorization', `Bearer ${auth_token}`).send({likes: "test"}).expect(400)
})

test('test if updating a non-existent blog returns error', async () => {
    const login_request = await api.post("/api/login").send({username: 'test', password: 'test_pass'})
    const auth_token = login_request.body.token

    const testBlog = { title: "No-id-test", author: "The ID'er", url: "no url", likes: 0 };
    const blogObject = new Blog(testBlog)
    await blogObject.save()

    const req = await api.get("/api/blogs")
    const id = req.body[req.body.length - 1].id

    await Blog.findByIdAndDelete(id);

    await api.put(`/api/blogs/${id}`).set('Authorization', `Bearer ${auth_token}`).expect(404)
})

after(async () => {
    await mongoose.connection.close()
})