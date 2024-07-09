const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate('user', 'username name id')
  return response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  let body = request.body
  if (body.url == undefined || body.title == undefined)
    return response.status(400).json("Bad Request");

  if (request.token === null)
    return response.status(400).json("jwt must be provided...")

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)


  body.user = user._id.toJSON()

  const blog = new Blog(body);
  const saved_blog = await blog.save()

  user.blogs = user.blogs.concat(saved_blog._id)
  await user.save()

  return response.status(201).json();
});

blogsRouter.delete("/:id/delete", async (request, response) => {
  const id = request.params.id
  let blog;
  try {
    blog = await Blog.findByIdAndDelete(id)
  } catch (e) {
    return response.status(400).json(e)
  }

  return response.status(204).json()
})

blogsRouter.put("/:id/update", async (request, response) => {
  const id = request.params.id;
  const body = request.body

  const blog = {
    likes: body.likes
  }

  if (isNaN(body.likes))
    return response.status(400).json()

  try {
    await Blog.findByIdAndUpdate(id, blog)
  } catch (e) {
    return response.status(400).json()
  }

  return response.status(200).json()

})

module.exports = blogsRouter
