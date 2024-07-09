const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if(username === undefined || password == undefined)
    return response.status(400).json({"error": "Username and password must be given..."})

  if (username.length < 3 || password.length < 3)
    return response.status(400).json({"error": "Password and username must be three or more letters long."})


  const user_found = await User.find({username})
  console.log(user_found[0])
  if(user_found[0] !== undefined) {
    return response.status(400).json({"error": "Username is already taken..."})
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({
    username,
    name,
    passwordHash,
  })
  const savedUser = await user.save()


  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

module.exports = usersRouter