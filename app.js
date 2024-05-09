const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./utils/config')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogsRouter')

mongoose.set('strictQuery', false)
mongoose.connect(config.mongoUrl)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)


module.exports = app