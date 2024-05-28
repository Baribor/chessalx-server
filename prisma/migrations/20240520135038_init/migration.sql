-- CreateEnum
CREATE TYPE "GAME_STATUS" AS ENUM ('ongoing', 'completed', 'pending');

-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "TERMINATION" AS ENUM ('checkmate', 'stalemate', 'resignation', 'draw');

-- CreateEnum
CREATE TYPE "SIGNUP_MODE" AS ENUM ('google', 'form');

-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePic" TEXT,
    "passwordHash" TEXT,
    "gender" "GENDER" NOT NULL,
    "role" "ROLE" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signupMode" "SIGNUP_MODE" NOT NULL DEFAULT 'form',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "status" "GAME_STATUS" NOT NULL DEFAULT 'pending',
    "pgn" TEXT,
    "started" TIMESTAMP(3),
    "ended" TIMESTAMP(3),
    "termination" "TERMINATION",
    "whitePlayerId" TEXT,
    "blackPlayerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_whitePlayerId_fkey" FOREIGN KEY ("whitePlayerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
