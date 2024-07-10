const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    let token = undefined
    if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.replace('Bearer ', '')
    }

    request.token = token

    next()
}

module.exports = tokenExtractor