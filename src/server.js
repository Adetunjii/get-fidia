const {ApolloServer} = require("apollo-server-express");
const {ApolloServerPluginDrainHttpServer} = require("apollo-server-core");
const express = require("express");
const http = require("http");
const dotenv = require("dotenv").config();
const {typeDefs, resolvers} = require("./graphQL");
const {connectDB} = require("./config/database.config");
const cors = require("cors");

const app = express();
app.use(cors());

const startApolloServer = async (typeDefs, resolvers) => {
  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({httpServer})],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({app});
  await connectDB();

  httpServer.listen(process.env.PORT || 4001, () => console.log(`🚀 Server is listening on port ${process.env.PORT}`));
};

startApolloServer(typeDefs, resolvers);
