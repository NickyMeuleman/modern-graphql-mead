import { Prisma } from "./generated/prisma";
import { ContextParameters } from "graphql-yoga/dist/types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface Context {
  prisma: Prisma;
  request: ContextParameters;
}

interface UserToken {
  userId: string;
  iat: string;
}

const getUserId = (request: ContextParameters, requireAuth = true) => {
  const header = request.request
    ? request.request.headers.authorization
    : request.connection.context.Authorization;
  if (header) {
    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserToken;
    return decoded.userId;
  }
  if (requireAuth) {
    throw new Error("Authentication required");
  }
  return null;
};

const getJWT = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  });
};

const getHashedPassword = (password: string) => {
  if (password.length < 8) {
    throw new Error("password must be 8 characters or longer");
  }
  return bcrypt.hash(password, 10);
};

export { Context, getUserId, getJWT, getHashedPassword };
