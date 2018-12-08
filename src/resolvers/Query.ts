import { Context, getUserId } from "../utils";

const Query = {
  users(parent, args, ctx: Context, info) {
    const { prisma } = ctx;
    let opArgs = {};
    if (args.query) {
      const query = args.query.toLowerCase();
      const where = {
        OR: [{ name_contains: query }]
      };
      opArgs = { first: args.first, after: args.after, skip: args.skip, where };
    }
    return prisma.query.users(opArgs, info);
  },
  user(parent, args, ctx: Context, info) {
    const { prisma } = ctx;
    const { id } = args;
    return prisma.query.user({ where: { id } }, info);
  },
  posts(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request, false);
    const query = args.query && args.query.toLowerCase();
    const queryOR = [{ title_contains: query }, { body_contains: query }];
    const ownPostsArgs = { AND: [{ author: { id: userId } }, { OR: queryOR }] };
    const publicPostsArgs = { AND: [{ published: true }, { OR: queryOR }] };
    return prisma.query.posts(
      {
        first: args.first,
        after: args.after,
        skip: args.skip,
        where: { OR: [ownPostsArgs, args.onlyOwn ? {} : publicPostsArgs] }
      },
      info
    );
  },
  myPosts(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    const query = args.query && args.query.toLowerCase();
    return prisma.query.posts({
      first: args.first,
      after: args.after,
      skip: args.skip,
      where: {
        author: { id: userId },
        OR: [{ title_contains: query }, { body_contains: query }]
      }
    });
  },
  async post(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    // use prisma.posts instead of prisma.post for the options in the arguments
    const posts = await prisma.query.posts(
      {
        where: {
          id: args.id,
          OR: [{ published: true }, { author: { id: userId } }]
        }
      },
      info
    );
    if (!posts.length) {
      throw new Error("post not found");
    }
    return posts[0];
  },
  comments(parent, args, ctx: Context, info) {
    const { prisma } = ctx;
    return prisma.query.comments(
      { first: args.first, after: args.after, skip: args.skip },
      info
    );
  },
  comment(parent, args, ctx: Context, info) {
    const { prisma } = ctx;
    return prisma.query.comment({ where: { id: args.id } }, info);
  },
  me(parent, args, ctx: Context, info) {
    const { prisma, request } = ctx;
    const userId = getUserId(request);
    return prisma.query.user({ where: { id: userId } }, info);
  }
};

export { Query as default };
