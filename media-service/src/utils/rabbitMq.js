import amqp from "amqplib"
import logger from "./logger.js"

let channel = null

const EXCHANGE = "microservices_events"
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel()
        await channel.assertExchange(EXCHANGE, "topic", { durable: false })
        console.log("Connected to RabbitMQ")
    } catch (error) {
        console.error("Failed to connect to RabbitMQ", error)
    }
}
export const getRabbitMQChannel = () => {
    if (!channel) {
        throw new Error("RabbitMQ channel is not initialized. Call connectRabbitMQ first.")
    }
    return channel
}

export const consumeEvent = async (routingKey, callback) => {
    try {

        if (!channel) {
            await connectRabbitMQ()
        }

        const q = await channel.assertQueue("", { exclusive: true })
        await channel.bindQueue(q.queue, EXCHANGE, routingKey)

        await channel.consume(q.queue, (msg) => {
            if (msg) {
                const content = JSON.parse(msg.content.toString())
                callback(content)
                channel.ack(msg)
            }
        })

        console.log("Event consumed with routing key:", routingKey)

    } catch (error) {
        logger.error("Something went wrong while consuming event error:", error)
    }
}