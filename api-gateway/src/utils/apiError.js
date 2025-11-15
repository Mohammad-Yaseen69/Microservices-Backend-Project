class ApiError extends Error {
    constructor(message, statusCode, errors) {
        super(message)
        this.statusCode = statusCode
        this.isApiError = true
        this.message = message
        this.errors = errors || []
    }

}

export default ApiError