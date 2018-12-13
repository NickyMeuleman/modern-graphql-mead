import bcrypt from "bcryptjs";
import prisma from "../../src/prisma";
import jwt from "jsonwebtoken";

const userOne = {
  input: {
    name: "Daniel",
    email: "rickybobby@test.com",
    password: bcrypt.hashSync("honeybadgerdontcare", 10)
  },
  user: undefined,
  jwt: undefined
};

const userTwo = {
  input: {
    name: "Fernando",
    email: "fasterthanyou@test.com",
    password: bcrypt.hashSync("issayoke", 10)
  },
  user: undefined,
  jwt: undefined
};

const postOne = {
  input: {
    published: true,
    title: "published post",
    body: "I like turtles"
  },
  post: undefined
};

const postTwo = {
  input: {
    published: false,
    title: "draft post",
    body: "there once was..."
  },
  post: undefined
};

const commentOne = {
  input: {
    text: "do a shooey"
  },
  comment: undefined
};

const commentTwo = {
  input: {
    text: "is this a GP2 engine?"
  },
  comment: undefined
};

const seedDatabase = async () => {
  // ? why do we have to deleteManyPosts? does onDelete: CASCADE not work?
  // A: XXXManyXXX prisma mutations don't support onDelete: CASCADE (yet)
  await prisma.mutation.deleteManyComments({});
  await prisma.mutation.deleteManyPosts({});
  await prisma.mutation.deleteManyUsers({});
  userOne.user = await prisma.mutation.createUser({
    data: userOne.input
  });
  userTwo.user = await prisma.mutation.createUser({
    data: userTwo.input
  });
  userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET);
  userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET);
  postOne.post = await prisma.mutation.createPost({
    data: {
      author: { connect: { id: userOne.user.id } },
      ...postOne.input
    }
  });
  postTwo.post = await prisma.mutation.createPost({
    data: {
      author: { connect: { id: userOne.user.id } },
      ...postTwo.input
    }
  });
  commentOne.comment = await prisma.mutation.createComment({
    data: {
      author: { connect: { id: userOne.user.id } },
      post: { connect: { id: postOne.post.id } },
      ...commentOne.input
    },
  });
  commentTwo.comment = await prisma.mutation.createComment({
    data: {
      author: { connect: { id: userTwo.user.id } },
      post: { connect: { id: postOne.post.id } },
      ...commentTwo.input
    },
  });
};

export { seedDatabase, userOne, userTwo, postOne, postTwo, commentOne, commentTwo };
