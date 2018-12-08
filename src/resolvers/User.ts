import { Context, getUserId } from "../utils";

const User = {
  email: {
    fragment: "fragment userId on User { id }",
    resolve(parent, args, ctx: Context, info) {
      const { request } = ctx;
      const userId = getUserId(request, false);
      if (userId === parent.id) {
        return parent.email;
      }
      return null;
    }
  },
  posts: {
    fragment: "fragment userId on User { id }",
    resolve(parent, args, ctx: Context, info) {
      const { prisma, request } = ctx;
      const query = args.query && args.query.toLowerCase();
      const userId = getUserId(request, false);
      return prisma.query.posts({
        where: {
          published: userId === parent.id ? undefined : true,
          author: {
            id: parent.id
          },
          OR: [{ title_contains: query }, { body_contains: query }]
        }
      });
    }
  }
};

export { User as default };
