import { Post, PrismaClient } from "@prisma/client";
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

// Users

/*
Show all users
*/
app.get("/users", async (req, res) => {

  // default: 10
  let skip = 0;
  if (req.query.offset) {
    const offset = req.query.offset as string;
    skip = parseInt(offset)
  }
  let take = 10;
  if (req.query.limit) {
    const limit = req.query.limit as string;
    take = parseInt(limit);
  }

  console.log(skip, take)

  const allUsers = await prisma.user.findMany({
    skip: skip,
    take: take,
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
    let fields: string[] = [];
    if (fieldsString) {
      fields = fieldsString.split(',');
    }

    const id = parseInt(req.params.id);

    const verified = protectedRoute(req);
    if (!verified) {
      return res.status(401).send({message: "Access Denied"});
    }

    const withProfile = fields.includes("profile") ? true : false;
    const withPosts = fields.includes("posts") ? true : false;

    const user = await prisma.user.findUnique({
      where: {
        id: id
      },
      include: {
        profile: withProfile,
        posts: withPosts
      }
    });

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

/*
Generate token for user
*/
app.post("/user/generateUserToken", (req, res) => {
  let maxTimeLimit = req.query.max_time_limit;
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  if (!jwtSecretKey) {
    res.send({ message: "jwt secret key is null" })
  } else {
    let userName = req.body.userName as string;

    if (maxTimeLimit){
      const token = signWithKey(userName, jwtSecretKey, (maxTimeLimit as string));
      res.send(token)
    } else {
      const token = signWithKey(userName, jwtSecretKey);
      res.send(token)
    }
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

// End of Users

// Posts

/*
Show all posts
if authorId is present in req.body params,
show posts by the author
*/
app.get("/posts", async (req, res) => {

  // default: 10
  let skip = 0;
  if (req.query.offset) {
    const offset = req.query.offset as string;
    skip = parseInt(offset)
  }
  let take = 10;
  if (req.query.limit) {
    const limit = req.query.limit as string;
    take = parseInt(limit);
  }

if (req.body.authorId){
  const allPosts = await prisma.post.findMany({
    skip: skip,
    take: take,
    where: {
      authorId: req.body.authorId as number
    }
  });
  console.dir(allPosts, { depth: null });
  res.json({posts: allPosts, length: allPosts.length});
}else{
  const allPosts = await prisma.post.findMany({
    skip: skip,
    take: take
  });
  console.dir(allPosts, { depth: null });
  res.json({posts: allPosts, length: allPosts.length});
}
});


/*
Add user
Required body params: title, content, authorId, user token (key is "token header key")
*/
app.post("/post", async (req, res) => {
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

// End of Posts

app.get("/", async (req, res) => {
  res.json({ message: "Home Page" })
})

const server = app.listen(3001, () =>
  console.log("🚀 Server ready at: http://localhost:3001")
);
