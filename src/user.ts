import express from "express"
import { PrismaClient } from "@prisma/client"
import { PostNullable } from "./types";

const prisma = new PrismaClient();

async function addUser(req: express.Request) {
    let email = req.body.email;
    let name = req.body.name;

    const newUser = await prisma.user.create({
        data: {
            email,
            name,
        },
    })

    console.log(newUser);

    return newUser
}

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
            authorId
        },
    })

    return newPost
}

export { addPost, addUser }