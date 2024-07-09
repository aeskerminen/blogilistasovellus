const app = require('./app')
const config = require('./utils/config')
const errorHandler = require('./middleware/errorHandler')

app.use(errorHandler)

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})