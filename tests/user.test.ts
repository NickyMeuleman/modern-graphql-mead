import "cross-fetch/polyfill";
import { gql, ApolloQueryResult } from "apollo-boost";
import prisma from "../src/prisma";
import { seedDatabase, userOne } from "./utils/seedDatabase";
import { getClient } from "./utils/getClient";
import { createUser, getUsers, loginMutation, getProfile } from "./utils/operations";

const client = getClient();
beforeEach(seedDatabase);

test("should create user", async done => {
  const variables = {
    data: {
      name: "blalbla",
      email: "blalbla@test.com",
      password: "tisnietechttisnentest"
    }
  };
  const response = await client.mutate({ mutation: createUser, variables });
  const exists = await prisma.exists.User({
    id: response.data.createUser.user.id
  });
  expect(exists).toBe(true);
  done();
});

test("should expose public author profiles", async () => {
  const response = (await client.query({ query: getUsers })) as any;
  expect(response.data.users).toHaveLength(2);
  expect(response.data.users[0].email).toBe(null);
  expect(response.data.users[0].name).toBe("Daniel");
});

test("should not login with bad credentials", async () => {
  const variables = {
    data: {
      username: "dingsken",
      password: "kweetekikooknietoedatdagekomenishe"
    }
  };
  const mutationPromise = client.mutate({ mutation: loginMutation, variables });
  await expect(mutationPromise).rejects.toThrow();
});

test("should not signup use with invalid password", async () => {
  const variables = {
    data: { name: "fake", email: "fake@test.com", password: "short" }
  };
  const createPromise = client.mutate({
    mutation: createUser,
    variables
  });
  await expect(createPromise).rejects.toThrow();
});

test("should fetch user profile", async () => {
  const client = getClient(userOne.jwt);
  const response = (await client.query({
    query: getProfile
  })) as ApolloQueryResult<any>;
  expect(response.data.me.email).toBeDefined();
  expect(response.data.me.email).toBe(userOne.user.email);
  expect(response.data.me.id).toBe(userOne.user.id);
  expect(response.data.me.name).toBe(userOne.user.name);
});
