import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

export const config: { [Key: string]: Knex.Config } = {
  development: {
    client: env.DATABASE_CLIENT,
    connection:
      env.DATABASE_CLIENT === 'sqlite'
        ? { filename: env.DATABASE_URL }
        : env.DATABASE_URL,
    useNullAsDefault: true,
    migrations: {
      extension: 'ts',
      directory: './database/migrations',
    },
  },
  staging: {},
  production: {},
}

export const knex = setupKnex(config.development)
