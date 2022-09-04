-- CreateTable
CREATE TABLE "transactions" (
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("user_id")
);
