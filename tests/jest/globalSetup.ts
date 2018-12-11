require("ts-node/register");

const server = require("../../src/server").default;

module.exports = async () => {
  global["httpServer"] = await server.start({ port: 4000 });
  return null;
};
