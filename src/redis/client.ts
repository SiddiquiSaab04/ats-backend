import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err.message);
});

redisClient.on("connect", () => {
    console.log("Redis connected successfully");
});

redisClient.connect().catch((err) => {
    console.error("Failed to connect to Redis:", err.message);
});

export { redisClient };
