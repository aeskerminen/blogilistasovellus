const dotenv = require('dotenv').config()

let PORT = 3003

let mongoUrl = process.env.NODE_END === 'test' ? process.env.TEST_URL : process.env.URL

module.exports = {mongoUrl, PORT}