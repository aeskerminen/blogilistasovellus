const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./utils/config')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogsRouter')
const usersRouter = require('./controllers/usersRouter')
const errorHandler = require('./middleware/errorHandler')

mongoose.set('strictQuery', false)
mongoose.connect(config.mongoUrl)

app.use(cors())
app.use(express.json())

app.use(errorHandler)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)


module.exports = app