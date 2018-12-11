import server from "./server"

server.start({ port: process.env.PORT }, ({ port }) => {
  console.log(`app server is up at http://localhost:${port}
  prisma server at ${process.env.PRISMA_ENDPOINT}!`);
});
