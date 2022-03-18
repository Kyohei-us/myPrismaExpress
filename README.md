# About this application
This is an application that I developed to learn about prisma, with typescript.

Demo Link: [https://my-prisma-express.herokuapp.com/](https://my-prisma-express.herokuapp.com/)

## npm commands
`npm run dev`: to run server for development purpose
`npm run genTypedoc`: to generate documentation with Typedoc

## prisma commands
`npx prisma migrate dev`: to apply schema change to the database

## TODO
To invalidate a jwt, create a blacklist.
Until the jwt is expired, keep it in the blacklist.
When the jwt expires, remove it from the blacklist.

