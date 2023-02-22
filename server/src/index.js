const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { createServer } = require('http');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { SubscriptionServer } = require("subscriptions-transport-ws")
const { makeExecutableSchema } = require("@graphql-tools/schema")
const { execute, subscribe } = require("graphql");

const TrackAPI = require('./datasources/track-api');

( async function() {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const subscriptionServer = SubscriptionServer.create(
    {schema, execute, subscribe},
    {server: httpServer, path: '/graphql'}
  )

  const server = new ApolloServer({
    schema,
    dataSources: () => {
      return {
        trackAPI: new TrackAPI(),
      };
    },
    plugins: [
      {
        async serverWillStart(){
          return {
            async drainServer() {
              subscriptionServer.close();
            }
          }
        }
      }
    ]
  })

  await server.start();
  server.applyMiddleware({app});
  
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`
      🚀  Server is running!
      🔉  Listening on port 4000
      📭  Query at http://localhost:4000
    `);
  });
})()