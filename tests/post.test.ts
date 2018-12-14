import "cross-fetch/polyfill";
import { ApolloQueryResult } from "apollo-boost";
import { seedDatabase, userOne, postOne } from "./utils/seedDatabase";
import { getClient } from "./utils/getClient";
import prisma from "../src/prisma";
import {
  getPosts,
  updatePost,
  createPost,
  deletePost
} from "./utils/operations";

const client = getClient();
beforeEach(seedDatabase);

test("should expose published posts", async () => {
  const response = (await client.query({
    query: getPosts
  })) as any;
  expect(response.data.posts).toHaveLength(1);
  expect(response.data.posts[0].published).toBe(true);
});

test("should fetch users own posts", async () => {
  const client = getClient(userOne.jwt);
  const variables = { onlyOwn: true };
  const response = (await client.query({
    query: getPosts,
    variables
  })) as ApolloQueryResult<any>;
  expect(response.data.posts).toHaveLength(2);
});

test("should be able to update own post", async () => {
  const client = getClient(userOne.jwt);
  const variables = {
    id: postOne.post.id,
    data: {
      published: false
    }
  };
  const response = await client.mutate({ mutation: updatePost, variables });
  expect(response.data.updatePost.id).toBe(postOne.post.id);
  expect(response.data.updatePost.published).toBe(false);
  const exists = await prisma.exists.Post({
    id: postOne.post.id,
    published: false
  });
  expect(exists).toBe(true);
});

test("should create a new post", async () => {
  const client = getClient(userOne.jwt);
  const variables = {
    data: { title: "foo", body: "bar", published: false }
  };
  const response = await client.mutate({ mutation: createPost, variables });
  expect(response.data.createPost.title).toBe("foo");
  expect(response.data.createPost.body).toBe("bar");
  expect(response.data.createPost.published).toBe(false);
  const exists = await prisma.exists.Post({ id: response.data.createPost.id });
  expect(exists).toBe(true);
});

test("should delete post", async () => {
  const client = getClient(userOne.jwt);
  const variables = { id: postOne.post.id };
  await client.mutate({ mutation: deletePost, variables });
  const exists = await prisma.exists.Post({ id: postOne.post.id });
  expect(exists).toBe(false);
});
