import ApolloBoost from "apollo-boost";

const getClient = (jwt: string | undefined = undefined) => {
  return new ApolloBoost({
    uri: `http://localhost:${process.env.PORT}`,
    async request(operation) {
      if (jwt) {
        operation.setContext({ headers: { Authorization: `Bearer ${jwt}` } });
      }
    }
  });
};

export { getClient };
