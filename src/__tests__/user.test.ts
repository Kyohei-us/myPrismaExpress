import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("adds a user", async () => {
  const newuser = await prisma.user.create({
    data: {
      email: "testuser@test.test",
      name: "test user",
    },
  });
  expect(newuser.email).toBe("testuser@test.test");
});
