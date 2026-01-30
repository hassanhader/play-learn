require('dotenv').config()

module.exports = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'DB_play_and_learn',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000,
      ssl: false
    }
  }
}
