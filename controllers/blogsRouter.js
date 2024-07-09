const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({})
    return response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body);

  if(request.body.url == undefined || request.body.title == undefined)
    return response.status(400).json("Bad Request");

  const res = await blog.save()
  return response.status(201).json(res);
});

module.exports = blogsRouter
