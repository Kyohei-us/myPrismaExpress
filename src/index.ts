import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

// TODO: routes here
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

app.get("/", async (req, res) => {
    res.json({message: "Home Page"})
})

const server = app.listen(3001, () =>
  console.log("🚀 Server ready at: http://localhost:3001")
);
