class ApiResponse {
    constructor(statusCode, message, data, additionalInformation) {
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.additionalInformation = additionalInformation
    }
}

export default ApiResponse