import argon2 from "argon2";
import prisma from "../../utils/prisma";
import { LoginInput, RegisterUserInput } from "./user.dto";
import { ApolloError } from "apollo-server-core";
import { Context } from "../../utils/createServer";

export async function createUser(input: RegisterUserInput) {
  const password = await argon2.hash(input.password);

  return prisma.user.create({
    data: {
      ...input,
      email: input.email.toLowerCase(),
      username: input.username.toLowerCase(),
      password,
    },
  });
}

export async function login(input: LoginInput, context: Context){
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: input.usernameOrEmail }, { email: input.usernameOrEmail }],
    },
  });

  if (!user) {
    throw new ApolloError("Invalid credentials");
  }

  const isValid = await verifyPassword({
    password: user.password,
    candidatePassword: input.password,
  });

  if (!isValid) {
    throw new ApolloError("Invalid credentials");
  }

  const token = await context.reply?.jwtSign({
    id: user.id,
    username: user.username,
    email: user.email,
  });

  if (!token) {
    throw new ApolloError("Error signing token");
  }

  context.reply?.setCookie("token", token, {
    domain: "localhost",
    path: "/",
    secure: false,
    httpOnly: true,
    sameSite: false,
  });

  return token
}

export async function verifyPassword({
  password,
  candidatePassword,
}: {
  password: string;
  candidatePassword: string;
}) {
  return argon2.verify(password, candidatePassword);
}

export async function followUser({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      following: {
        connect: {
          username,
        },
      },
    },
  });
}

export async function unfollowUser({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      following: {
        disconnect: {
          username,
        },
      },
    },
  });
}

export async function findUsers() {
  return prisma.user.findMany();
}

export async function findUserFollowing(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      following: true,
    },
  });
}

export async function findUserFollowedBy(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      followedBy: true,
    },
  });
}

export async function findUserById(userId: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
}
