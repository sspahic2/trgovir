-- CreateTable
CREATE TABLE "TableRow" (
    "id" SERIAL NOT NULL,
    "oblikIMere" TEXT NOT NULL,
    "diameter" DOUBLE PRECISION,
    "lg" DOUBLE PRECISION,
    "n" INTEGER,
    "lgn" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TableRow_pkey" PRIMARY KEY ("id")
);
