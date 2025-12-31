import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis error", err));

if (!redisClient.isOpen) {
  await redisClient.connect();
}

export default redisClient;