import ApolloBoost from "apollo-boost";
// import "@babel/polyfill/noConflict";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, Observable } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { OperationDefinitionNode } from "graphql";
import ws from "ws";

const getClientnoWS = (jwt: string | undefined = undefined) => {
  return new ApolloBoost({
    uri: `http://localhost:${process.env.PORT}`,
    async request(operation) {
      if (jwt) {
        operation.setContext({ headers: { Authorization: `Bearer ${jwt}` } });
      }
    }
  });
};

const getClient = (
  jwt: string | undefined = undefined,
  httpURL = "http://localhost:4000",
  websocketURL = "ws://localhost:4000"
) => {
  // Setup the authorization header for the http client
  const request = async operation => {
    if (jwt) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
    }
  };

  // Setup the request handlers for the http clients
  const requestLink = new ApolloLink((operation, forward) => {
    return new Observable(observer => {
      let handle;
      Promise.resolve(operation)
        .then(oper => {
          request(oper);
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) {
          handle.unsubscribe();
        }
      };
    });
  });

  // Web socket link for subscriptions
  const wsLink = ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }

      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }),
    requestLink,
    new WebSocketLink({
      uri: websocketURL,
      webSocketImpl: ws,
      options: {
        reconnect: true,
        connectionParams: () => {
          if (jwt) {
            return {
              Authorization: `Bearer ${jwt}`
            };
          }
        }
      }
    })
  ]);

  // HTTP link for queries and mutations
  const httpLink = ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }),
    requestLink,
    new HttpLink({
      uri: httpURL,
      credentials: "same-origin"
    })
  ]);

  // Link to direct ws and http traffic to the correct place
  const link = ApolloLink.split(
    // Pick which links get the data based on the operation kind
    ({ query }) => {
      const operationNode = getMainDefinition(query) as OperationDefinitionNode;
      const { kind, operation } = operationNode;
      return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink,
    httpLink
  );

  return new ApolloClient({
    link,
    cache: new InMemoryCache()
  });
};

export { getClient };
