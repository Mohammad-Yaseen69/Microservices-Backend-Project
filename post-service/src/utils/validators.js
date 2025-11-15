import joi from "joi"


export const postCreationValidation = (data) => {
    const schema = joi.object({
        title: joi.string().min(3).max(30).required(),
        content: joi.string().min(10).required(),
        tags: joi.array().items(joi.string()),
    })

    const { error } = schema.validate(data)

    if (error) {
        return {
            message: error.details.map(err => err.message.replace(/["]/g, '')).join(', '),
            errors: error.details.map((err) => err.message)
        }
    } else {
        return {
            message: null,
            errors: []
        };
    }
}
export const postUpdateValidation = (data) => {
    const schema = joi.object({
        title: joi.string().min(3).max(30),
        content: joi.string().min(10),
        tags: joi.array().items(joi.string()),
    })

    const { error } = schema.validate(data)

    if (error) {
        return {
            message: error.details.map(err => err.message.replace(/["]/g, '')).join(', '),
            errors: error.details.map((err) => err.message)
        }
    } else {
        return {
            message: null,
            errors: []
        };
    }
}