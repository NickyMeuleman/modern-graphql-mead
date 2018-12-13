import "cross-fetch/polyfill";
import { getClient } from "./utils/getClient";
import {
  userOne,
  seedDatabase,
  postOne,
  commentOne,
  commentTwo
} from "./utils/seedDatabase";
import { deleteComment } from "./utils/operations";
import prisma from "../src/prisma";

beforeEach(seedDatabase);

test("should delete own comment", async () => {
  const client = getClient(userOne.jwt);
  const variables = { id: commentOne.comment.id };
  await client.mutate({ mutation: deleteComment, variables });
  const exists = await prisma.exists.Comment({ id: commentOne.comment.id });
  expect(exists).toBe(false);
});

test('should not delete other users comment',async () => {
    const client = getClient(userOne.jwt);
    const variables = { id: commentTwo.comment.id };
    const mutatePromise = client.mutate({ mutation: deleteComment, variables });
    await expect(mutatePromise).rejects.toThrow()
    const exists = await prisma.exists.Comment({ id: commentOne.comment.id });
    expect(exists).toBe(true);
})
