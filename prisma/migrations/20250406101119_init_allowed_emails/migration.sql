-- CreateTable
CREATE TABLE "AllowedEmail" (
    "email" TEXT NOT NULL,
    "is_super_admin" BOOLEAN NOT NULL,

    CONSTRAINT "AllowedEmail_pkey" PRIMARY KEY ("email")
);

INSERT INTO "AllowedEmail" ("email", "is_super_admin")
VALUES ('spahic.sabahudin1@gmail.com', true)
ON CONFLICT ("email") DO NOTHING;
