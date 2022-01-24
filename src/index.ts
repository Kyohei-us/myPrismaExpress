import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";

import { signWithKey, protectedRoute } from "./jwtAuth"
import { addPost, addUser } from "./user";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

// routes here

/*
Show all users
*/
app.get("/users", async (req, res) => {
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
  });
  console.dir(allUsers, { depth: null });
  res.json(allUsers);
});

/*
Show all posts
*/
app.get("/posts", async (req, res) => {
  const allPosts = await prisma.post.findMany();
  console.dir(allPosts, { depth: null });
  res.json(allPosts);
});

/*
Add user
Required body params: email, name
*/
app.post("/addUser", async (req, res) => {
  try {
    // add post method here
    let newUser = await addUser(req);
    return res.send(newUser);
    // return res.send("Successfully Verified");
  } catch (error) {
    // Access Denied
    return res.status(401).send(error);
  }
})

/*
Add user
Required body params: title, content, authorId, user token (key is "token header key")
*/
app.post("/addPost", async (req, res) => {
  try {
    const verified = protectedRoute(req);

    // Access Denied
    if (!verified) return res.status(401).send({ message: "Access denied" });
    else {
      // add post method here
      console.log("Adding post...");
      let newPost = await addPost(req);
      if (newPost) {
        console.log("Post added");
        return res.send({ title: newPost.title });
      } else {
        console.log("Post is not added");
        return res.send({ message: "Post is not added" })
      }
    }
  } catch (error) {
    // Access Denied
    return res.status(401).send(error);
  }
})

/*
Generate token for user
*/
app.post("/user/generateUserToken", (req, res) => {
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  if (!jwtSecretKey) {
    res.send({ message: "jwt secret key is null" })
  } else {
    let userName = req.body.userName as string;

    const token = signWithKey(userName, jwtSecretKey);
    res.send(token)
  }
})

/*
Validate user token
Required body params: user token (key is "token header key")
*/
app.get("/user/validateUserToken", (req: express.Request, res: express.Response) => {

  try {
    const verified: Boolean = protectedRoute(req);

    // Access Denied
    if (!verified) return res.status(401).send({ message: "Access denied" });
    else {
      return res.send("Successfully Verified");
    }

  } catch (error) {
    // Access Denied
    return res.status(401).send(error);
  }

})

app.get("/", async (req, res) => {
  res.json({ message: "Home Page" })
})

const server = app.listen(3001, () =>
  console.log("🚀 Server ready at: http://localhost:3001")
);
