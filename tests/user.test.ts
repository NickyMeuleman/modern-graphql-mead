import "cross-fetch/polyfill";
import ApolloBoost, { gql } from "apollo-boost";
import prisma from "../src/prisma";
import bcrypt from "bcryptjs";

const client = new ApolloBoost({ uri: "http://localhost:4000" });

beforeEach(async () => {
  // ? why do we have to deleteManyPosts? does onDelete: CASCADE not work?
  await prisma.mutation.deleteManyPosts({})
  await prisma.mutation.deleteManyUsers({});
  const user = await prisma.mutation.createUser({
    data: {
      name: "Daniel",
      email: "rickybobby@test.com",
      password: bcrypt.hashSync("honeybadgerdontcare", 10)
    }
  });
  await prisma.mutation.createPost({
    data: {
      author: { connect: { id: user.id } },
      published: true,
      title: "published post",
      body: "I like turtles"
    }
  });
  await prisma.mutation.createPost({
    data: {
      author: { connect: { id: user.id } },
      published: false,
      title: "draft post",
      body: "there once was..."
    }
  });
});

test("should create user", async done => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "blalbla"
          email: "blalbla@test.com"
          password: "tisnietechttisnentest"
        }
      ) {
        token
        user {
          id
        }
      }
    }
  `;
  const response = await client.mutate({ mutation: createUser });
  const exists = await prisma.exists.User({
    id: response.data.createUser.user.id
  });
  expect(exists).toBe(true);
  done();
});
