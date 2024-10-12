import Redis from "ioredis";
import { env } from "custom-env";

// Load environment variables
env();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost", 
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined, 
});


export { redisClient };
