module.exports = {
      type: process.env.DATABASE_TYPE,
      host: process.env.DATABASE_HOST,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      synchronize: true,
      logging: true,
      entities: [
          "src/entity/**/*.js"
      ],
      migrations: [
          "src/migrations/**/*.js"
      ],
      subscribers: [
          "src/subscribers/**/*.js"
      ]
};  