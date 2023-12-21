-- CreateEnum
CREATE TYPE "Operation" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" "Operation" NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
