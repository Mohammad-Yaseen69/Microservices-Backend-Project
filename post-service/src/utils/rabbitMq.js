import amqp from "amqplib"
import logger from "./logger"

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

export const publishEvent = async (routingKey, content) => {
    try {

        if (!channel) {
            connectRabbitMQ()
        }

        const success = await channel.publish(EXCHANGE, routingKey, JSON.stringify(content))

        if (success) {
            console.log(`Event with routing key: ${routingKey} published successfully`)
        } else {
            logger.error(`Failed to publish event with routing key: ${routingKey}`)
        }

    } catch (error) {
        logger.error("Something went wrong while publishing event error:", error)
    }
}