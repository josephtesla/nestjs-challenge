import * as Joi from 'joi';

export const ConfigValidationSchema = Joi.object({
  MONGO_URL: Joi.string().uri().required(),
  MONGO_USE_ATLAS: Joi.boolean().default(false),
  PORT: Joi.number().default(3000),
  MUSICBRAINZ_API_URL: Joi.string().uri().default('https://musicbrainz.org/ws/2'),
  REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),
});
