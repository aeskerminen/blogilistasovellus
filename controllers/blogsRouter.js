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

blogsRouter.delete("/:id/delete", async (request, response) => {
  const id = request.params.id
  let blog;
  try {
    blog = await Blog.findByIdAndDelete(id)
  } catch(e) {
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

  if(isNaN(body.likes))
    return response.status(400).json()

  try {
    await Blog.findByIdAndUpdate(id, blog)
  } catch(e) {
    return response.status(400).json()
  }

  return response.status(200).json()

})

module.exports = blogsRouter
