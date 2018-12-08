import { Context, getUserId } from "../utils";

const Subscription = {
  comment: {
    subscribe(parent, args, ctx: Context, info) {
      const { prisma } = ctx;
      const { postId } = args;
      return prisma.subscription.comment(
        { where: { node: { post: { id: postId } } } },
        info
      );
    }
  },
  post: {
    subscribe(parent, args, ctx: Context, info) {
      const { prisma } = ctx;
      return prisma.subscription.post(
        { where: { node: { published: true } } },
        info
      );
    }
  },
  myPost: {
    subscribe(parent, args, ctx: Context, info) {
      const { prisma, request } = ctx;
      const userId = getUserId(request);
      return prisma.subscription.post({
        where: { node: { author: { id: userId } } }
      }, info);
    }
  }
};

export { Subscription as default };
