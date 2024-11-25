import axios from "axios";
import dotenv from "dotenv";
import axiosRetry from "axios-retry";

dotenv.config();

const tmdbClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
    accept: "application/json",
  },
  params: {
    api_key: process.env.TMDB_API_KEY, 
  },
});

axiosRetry(tmdbClient, {
  retries: 3, // Retry up to 3 times
  retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff (1s, 2s, 3s)
  retryCondition: (error) => {
    // Retry only on specific errors (e.g., ECONNRESET or 5xx responses)
    return (
      axiosRetry.isNetworkError(error)
    );
  },
});

export default tmdbClient;
