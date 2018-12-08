import { Prisma } from "./generated/prisma";
import { fragmentReplacements } from "./resolvers/index";

const prisma = new Prisma({
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  fragmentReplacements
});

export { prisma as default };
