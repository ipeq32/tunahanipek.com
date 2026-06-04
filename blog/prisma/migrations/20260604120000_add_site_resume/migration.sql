-- CreateTable
CREATE TABLE "SiteResume" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SiteResume_pkey" PRIMARY KEY ("id")
);
