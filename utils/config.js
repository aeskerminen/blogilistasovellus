const dotenv = require('dotenv').config()

let mongoUrl = process.env.URL
let PORT = 3003

module.exports = {mongoUrl, PORT}