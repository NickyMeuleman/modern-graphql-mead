import { GraphQLServer } from "graphql-yoga";
import { resolvers } from "./resolvers/index";
import prisma from "./prisma";
import { ContextParameters } from "graphql-yoga/dist/types";

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context(request: ContextParameters) {
    return {
      prisma,
      request
    };
  }
});

server.start({ port: process.env.PORT }, ({ port }) => {
  console.log(`app server is up at http://localhost:${port}
  prisma server at ${process.env.PRISMA_ENDPOINT}!`);
});
