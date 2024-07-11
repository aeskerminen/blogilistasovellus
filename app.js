const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./utils/config')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogsRouter')
const usersRouter = require('./controllers/usersRouter')
const loginRouter = require('./controllers/loginRouter')
const tokenExtractor = require('./middleware/tokenExtractor')
const userExtractor = require('./middleware/userExtractor')


mongoose.set('strictQuery', false)
mongoose.connect(config.mongoUrl)

app.use(cors())
app.use(express.json())

app.use(tokenExtractor)
app.use(userExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') 
{  
    const testingRouter = require('./controllers/testingRouter') 
    app.use('/api/testing', testingRouter)
}

module.exports = app