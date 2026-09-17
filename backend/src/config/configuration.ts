export default () => ({
  port: process.env.PORT ?? 3000,
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    expiration: process.env.JWT_EXPIRATION ?? '1d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
});
