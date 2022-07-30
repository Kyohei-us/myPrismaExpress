import express from "express";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

async function addUser(req: express.Request): Promise<User> {
  let email = req.body.email;
  let name = req.body.name;

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
    },
  });

  console.log(newUser);

  return newUser;
}

const getUserById = async (
  id: number,
  withProfile: boolean,
  withPosts: boolean
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      profile: withProfile,
      posts: withPosts,
    },
  });

  return user;
};

const parseUserFields = (fieldsString: string) => {
  let fields: string[] = [];
  if (fieldsString) {
    fields = fieldsString.split(",");
  }

  const withProfile = fields.includes("profile") ? true : false;
  const withPosts = fields.includes("posts") ? true : false;

  return { withProfile, withPosts };
};

const parseOffsetAndLimit = (req: express.Request) => {
  // default: 10
  let skip = 0;
  if (req.query.offset) {
    const offset = req.query.offset as string;
    skip = parseInt(offset);
  }
  let take = 10;
  if (req.query.limit) {
    const limit = req.query.limit as string;
    take = parseInt(limit);
  }

  return { skip, take };
};

export {
  addUser,
  getUserById,
  parseUserFields,
  parseOffsetAndLimit
};
