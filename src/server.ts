import { GraphQLServer } from "graphql-yoga";
import { ContextParameters } from "graphql-yoga/dist/types";
import { resolvers } from "./resolvers/index";
import prisma from "./prisma";

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

export { server as default }