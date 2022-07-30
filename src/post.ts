import express from "express";
import { PrismaClient } from "@prisma/client";
import { PostNullable } from "./types";

const prisma = new PrismaClient();

async function addPost(req: express.Request): Promise<PostNullable> {
  let title = req.body.title as string;
  let content = req.body.content as string;
  let authorId = req.body.authorId as number;

  if (!title || !content || !authorId) {
    return undefined;
  }

  const newPost = await prisma.post.create({
    data: {
      title,
      content,
      authorId,
    },
  });

  return newPost;
}

const getPostById = async (id: number) => {
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
    include: {
      author: true,
    },
  });

  return post;
};

export { addPost, getPostById };
