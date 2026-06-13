"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.redisClient = redisClient;
redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err.message);
});
redisClient.on("connect", () => {
    console.log("Redis connected successfully");
});
redisClient.connect().catch((err) => {
    console.error("Failed to connect to Redis:", err.message);
});
