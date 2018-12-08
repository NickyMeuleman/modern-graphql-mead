import bcrypt from "bcryptjs";
import { Context, getUserId, getJWT, getHashedPassword } from "../utils";

const Mutation = {
  // resolvers can return a promise, no need to await it, it will automatically become the result
  async createUser(parent, args, ctx: Context, info) {
    const { prisma } = ctx;
    const password = await getHashedPassword(args.data.password);
    const user = await prisma.mutation.createUser({
      data: { ...args.data, password }
    });
    const token = getJWT(user.id);
    return { user, token };
  },
  deleteUser(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    return prisma.mutation.deleteUser({ where: { id: userId } }, info);
  },
  updateUser(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    if (args.password === "string") {
      args.password = getHashedPassword(args.password);
    }
    return prisma.mutation.updateUser(
      { where: { id: userId }, data: args.data },
      info
    );
  },
  createPost(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    const { title, body, published } = args.data;
    return prisma.mutation.createPost(
      {
        data: {
          title,
          body,
          published,
          author: {
            connect: {
              id: userId
            }
          }
        }
      },
      info
    );
  },
  async deletePost(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: { id: userId }
    });
    if (!postExists) {
      throw new Error("cannot delete post");
    }
    return prisma.mutation.deletePost({ where: { id: args.id } }, info);
  },
  async updatePost(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: { id: userId }
    });
    if (!postExists) {
      throw new Error("cannot update post");
    }
    const isPostPublished = await prisma.exists.Post({
      published: true,
      id: args.id
    });
    if (isPostPublished && !args.data.published) {
      // Delete all comments when post gets unpublished
      await prisma.mutation.deleteManyComments({
        where: { post: { id: args.id } }
      });
    }
    return prisma.mutation.updatePost(
      { where: { id: args.id }, data: args.data },
      info
    );
  },
  async createComment(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    const postExists = await prisma.exists.Post({
      id: args.data.post,
      published: true
    });
    if (!postExists) {
      throw new Error(
        "cannot create comment for post with id: " + args.data.post
      );
    }
    return prisma.mutation.createComment(
      {
        data: {
          text: args.data.text,
          author: { connect: { id: userId } },
          post: { connect: { id: args.data.post } }
        }
      },
      info
    );
  },
  async deleteComment(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    const commentExists = await prisma.exists.Comment({
      id: args.id,
      author: { id: userId }
    });
    if (!commentExists) {
      throw new Error("cannot delete comment");
    }
    return prisma.mutation.deleteComment({ where: { id: args.id } }, info);
  },
  async updateComment(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    const commentExists = await prisma.exists.Comment({
      id: args.id,
      author: { id: userId }
    });
    if (!commentExists) {
      throw new Error("cannot update comment");
    }
    return prisma.mutation.updateComment(
      { where: { id: args.id }, data: args.data },
      info
    );
  },
  async login(parent, args, ctx: Context, info) {
    const { prisma } = ctx;
    const user = await prisma.query.user({ where: { email: args.data.email } });
    if (!user) {
      // error message is purposefully generic, don't give potential attackers context
      throw new Error("Unable to login");
    }
    const isMatch = await bcrypt.compare(args.data.password, user.password);
    if (!isMatch) {
      throw new Error("Unable to login");
    }
    const token = getJWT(user.id);
    return { user, token };
  }
};

export { Mutation as default };
