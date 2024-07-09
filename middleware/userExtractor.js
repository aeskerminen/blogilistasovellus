const jwt = require('jsonwebtoken')

const userExtractor = (request, response, next) => {
    if(request.token !== undefined) {
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        request.user = decodedToken
    }

    next()
}

module.exports = userExtractor