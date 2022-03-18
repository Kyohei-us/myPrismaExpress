-- CreateTable
CREATE TABLE "Jwtoken" (
    "id" SERIAL NOT NULL,
    "jwt" TEXT NOT NULL,
    "expired" BOOLEAN NOT NULL,

    CONSTRAINT "Jwtoken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Jwtoken_jwt_key" ON "Jwtoken"("jwt");
