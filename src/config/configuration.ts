export default function configuration() {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number.parseInt(process.env.PORT ?? '4000', 10),
    database: {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_DATABASE ?? 'nexario',
    },
    jwt: {
      accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'secret',
      refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'refresh-secret',
      accessTokenTtl: Number.parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '900', 10),
      refreshTokenTtl: Number.parseInt(
        process.env.JWT_REFRESH_TOKEN_TTL ?? '604800',
        10,
      ),
    },
  };
}
