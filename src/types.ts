import { Post } from "@prisma/client";

type PostNullable = Post | undefined;

type JWToken = {
  token: string;
};

export { PostNullable, JWToken };
