import { Post, PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";

import { signWithKey, protectedRoute, invalidateJWT, extractJWT } from "./jwtAuth"
import { addPost, addUser, getPostById, getUserById, parseUserFields, parseOffsetAndLimit } from "./user";
import { PostNullable } from "./types";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

// routes here

// Users

/*
Show all users
*/
app.get("/users", async (req, res) => {

  const parsedSkipAndTake = parseOffsetAndLimit(req);

  const allUsers = await prisma.user.findMany({
    skip: parsedSkipAndTake.skip,
    take: parsedSkipAndTake.take,
    include: {
      posts: false,
      profile: false,
    },
  });
  console.dir(allUsers, { depth: null });
  res.json({users: allUsers, length: allUsers.length});
});

/**
 * Get a user by id
 */
app.get("/user/:id", async (req, res) => {
  try {

    const fieldsString = req.query.fields as string;
    const parsedFields = parseUserFields(fieldsString);

    const id = parseInt(req.params.id);

    const verified = await protectedRoute(req);
    if (!verified) {
      return res.status(401).send({message: "Access Denied"});
    }

    const user = await getUserById(id, parsedFields.withProfile, parsedFields.withPosts);

    console.log(user);
    res.json(user);
  } catch (error) {
    // Access Denied
    return res.status(401).send(error);
  }

})

/*
Add user
Required body params: email, name
*/
app.post("/user", async (req, res) => {
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

// End of Users

// Posts

/*
Show all posts
if authorId is present in req.body params,
show posts by the author
*/
app.get("/posts", async (req, res) => {

  const parsedSkipAndTake = parseOffsetAndLimit(req);

  if (req.body.authorId){
    const allPosts = await prisma.post.findMany({
      skip: parsedSkipAndTake.skip,
      take: parsedSkipAndTake.take,
      where: {
        authorId: req.body.authorId as number
      }
    });
    console.dir(allPosts, { depth: null });
    res.json({posts: allPosts, length: allPosts.length});
  }else{
    const allPosts = await prisma.post.findMany({
      skip: parsedSkipAndTake.skip,
      take: parsedSkipAndTake.take
    });
    console.dir(allPosts, { depth: null });
    res.json({posts: allPosts, length: allPosts.length});
  }
});

app.get("/post/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const verified = await protectedRoute(req);
    if (!verified) {
      return res.status(401).send({message: "Access Denied"});
    }

    const user = await getPostById(id);

    console.log(user);
    res.json(user);
  } catch (error) {
    // Access Denied
    return res.status(401).send(error);
  }
})

/*
Add post
Required body params: title, content, authorId, user token (key is "token header key")
*/
app.post("/post", async (req, res) => {
  try {
    const verified = await protectedRoute(req);

    // Access Denied
    if (!verified) return res.status(401).send({ message: "Access denied" });
    else {
      // add post method here
      console.log("Adding post...");
      let newPost: PostNullable = await addPost(req);
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

// End of Posts

// JWT

/*
Generate token for user
*/
app.post("/generateUserToken", async (req, res) => {
  let maxTimeLimit = req.query.max_time_limit;
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  if (!jwtSecretKey) {
    res.send({ message: "jwt secret key is null" })
  } else {
    let userName = req.body.userName as string;

    if (maxTimeLimit){
      const token = await signWithKey(userName, jwtSecretKey, (maxTimeLimit as string));
      res.send(token)
    } else {
      const token = await signWithKey(userName, jwtSecretKey, "");
      res.send(token)
    }
  }
})

/*
Validate user token
Required body params: user token (key is "token header key")
*/
app.get("/validateUserToken", async (req: express.Request, res: express.Response) => {
  try {
    const verified: Boolean = await protectedRoute(req);

    // Access Denied
    if (!verified) return res.status(401).send({ message: "Access denied" });
    
    return res.status(200).send("Successfully Verified");

  } catch (error) {
    // Access Denied
    return res.status(401).send({message: "error in validation", error: error});
  }
})

app.get("/invalidateUserToken", async (req: express.Request, res: express.Response) => {

  try {
    const extracted = await extractJWT(req);

    if (await invalidateJWT(extracted.bearerToken)){
      return res.send("Successfully invalidated jwt")
    } else {
      return res.status(404).send({ message: "JWT not found" })
    }
  } catch (error) {
    // Access Denied
    return res.status(404).send({ message: "JWT not found" });
  }

})

// End JWT

app.get("/", async (req, res) => {
  res.json({ message: "Home Page" })
})

const server = app.listen(process.env.PORT, () =>
  console.log("🚀 Server ready at: http://localhost:" + process.env.PORT)
);
