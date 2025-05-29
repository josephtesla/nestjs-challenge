export const getConfiguration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.MONGO_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  musicBrainz: {
    apiUrl: process.env.MUSICBRAINZ_API_URL || 'https://musicbrainz.org/ws/2',
  },
});
