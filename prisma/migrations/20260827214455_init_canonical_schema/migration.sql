-- CreateEnum
CREATE TYPE "CelebrationRank" AS ENUM ('SOLEMNITY', 'FEAST', 'MEMORIAL', 'OPTIONAL_MEMORIAL');

-- CreateEnum
CREATE TYPE "LiturgicalColor" AS ENUM ('GREEN', 'VIOLET', 'WHITE', 'RED', 'ROSE', 'BLACK');

-- CreateEnum
CREATE TYPE "ReadingType" AS ENUM ('FIRST_READING', 'RESPONSORIAL_PSALM', 'SECOND_READING', 'GOSPEL_ACCLAMATION', 'GOSPEL', 'OTHER');

-- CreateEnum
CREATE TYPE "EcclesialStatus" AS ENUM ('SERVANT_OF_GOD', 'VENERABLE', 'BLESSED', 'SAINT');

-- CreateEnum
CREATE TYPE "HistoricalConfidence" AS ENUM ('HISTORICALLY_DOCUMENTED', 'STRONG_TRADITIONAL_SOURCES', 'PIOUS_TRADITION');

-- CreateEnum
CREATE TYPE "PrayerType" AS ENUM ('BASIC', 'MARIAN', 'NOVENA_PRAYER', 'LITANY', 'CREED', 'LITURGICAL', 'CHAPLET', 'DEVOTIONAL');

-- CreateEnum
CREATE TYPE "CatechismPillar" AS ENUM ('PART_1_PROFESSION_OF_FAITH', 'PART_2_SACRAMENTS', 'PART_3_LIFE_IN_CHRIST', 'PART_4_CHRISTIAN_PRAYER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ENCYCLICAL', 'APOSTOLIC_EXHORTATION', 'BULL', 'MOTU_PROPRIO', 'COUNCIL_CONSTITUTION', 'COUNCIL_DECREE', 'DECLARATION', 'CATECHISM');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "YearCycle" AS ENUM ('YEAR_A', 'YEAR_B', 'YEAR_C');

-- CreateEnum
CREATE TYPE "WeekdayCycle" AS ENUM ('YEAR_1', 'YEAR_2');

-- CreateTable
CREATE TABLE "LiturgicalSeason" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultColor" "LiturgicalColor" NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiturgicalSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiturgicalDay" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "calendarCode" TEXT NOT NULL DEFAULT 'UNIVERSAL',
    "seasonId" TEXT NOT NULL,
    "seasonWeek" INTEGER,
    "yearCycle" "YearCycle" NOT NULL,
    "weekdayCycle" "WeekdayCycle" NOT NULL,
    "liturgicalColor" "LiturgicalColor" NOT NULL,
    "gloriaRequired" BOOLEAN NOT NULL DEFAULT false,
    "creedRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiturgicalDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Celebration" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "rank" "CelebrationRank" NOT NULL,
    "color" "LiturgicalColor",
    "isMovable" BOOLEAN NOT NULL DEFAULT false,
    "fixedMonth" INTEGER,
    "fixedDay" INTEGER,
    "saintId" TEXT,
    "biographySummary" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Celebration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiturgicalDayCelebration" (
    "id" TEXT NOT NULL,
    "liturgicalDayId" TEXT NOT NULL,
    "celebrationId" TEXT NOT NULL,
    "precedenceOrder" INTEGER NOT NULL DEFAULT 1,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isCommemoration" BOOLEAN NOT NULL DEFAULT false,
    "isTransferred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LiturgicalDayCelebration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL,
    "liturgicalDayId" TEXT,
    "celebrationId" TEXT,
    "type" "ReadingType" NOT NULL,
    "readingOrder" INTEGER NOT NULL DEFAULT 1,
    "citationRef" TEXT NOT NULL,
    "response" TEXT,
    "text" TEXT NOT NULL,
    "copyrightInfo" TEXT NOT NULL DEFAULT 'Public Domain — Douay-Rheims Translation',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "slug" TEXT NOT NULL,
    "titleTeaser" TEXT,
    "biography" TEXT NOT NULL,
    "birthYear" TEXT,
    "deathYear" TEXT,
    "century" INTEGER,
    "feastDateMonth" INTEGER,
    "feastDateDay" INTEGER,
    "ecclesialStatus" "EcclesialStatus" NOT NULL,
    "canonizationYear" TEXT,
    "canonizedBy" TEXT,
    "isDoctorOfTheChurch" BOOLEAN NOT NULL DEFAULT false,
    "isMartyr" BOOLEAN NOT NULL DEFAULT false,
    "religiousOrder" TEXT,
    "historicalConfidence" "HistoricalConfidence" NOT NULL,
    "regionSpecificStatus" TEXT,
    "primaryImageUrl" TEXT,
    "relicImageUrl" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Saint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patronage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patronage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaintPatronage" (
    "id" TEXT NOT NULL,
    "saintId" TEXT NOT NULL,
    "patronageId" TEXT NOT NULL,

    CONSTRAINT "SaintPatronage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaintVocation" (
    "id" TEXT NOT NULL,
    "saintId" TEXT NOT NULL,
    "vocationId" TEXT NOT NULL,

    CONSTRAINT "SaintVocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prayer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "latinTitle" TEXT,
    "slug" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "latinText" TEXT,
    "prayerType" "PrayerType" NOT NULL,
    "isOfficialFormula" BOOLEAN NOT NULL DEFAULT false,
    "isIndulgenced" BOOLEAN NOT NULL DEFAULT false,
    "seasonalUse" TEXT,
    "sourceDocumentId" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaintPrayer" (
    "id" TEXT NOT NULL,
    "saintId" TEXT NOT NULL,
    "prayerId" TEXT NOT NULL,

    CONSTRAINT "SaintPrayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Novena" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "openingPrayer" TEXT,
    "closingPrayer" TEXT,
    "historicalOrigin" TEXT,
    "isIndulgenced" BOOLEAN NOT NULL DEFAULT false,
    "saintId" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Novena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaintNovena" (
    "id" TEXT NOT NULL,
    "saintId" TEXT NOT NULL,
    "novenaId" TEXT NOT NULL,

    CONSTRAINT "SaintNovena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NovenaDay" (
    "id" TEXT NOT NULL,
    "novenaId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "intention" TEXT NOT NULL,
    "prayerText" TEXT NOT NULL,
    "reflectionText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NovenaDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatechismEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "paragraphStart" INTEGER NOT NULL,
    "paragraphEnd" INTEGER NOT NULL,
    "pillar" "CatechismPillar" NOT NULL,
    "doctrinalLevel" TEXT,
    "magisterialWeight" TEXT,
    "councilSource" TEXT,
    "bodyText" TEXT NOT NULL,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatechismEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "latinTitle" TEXT,
    "slug" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "promulgationDate" TIMESTAMP(3),
    "issuingAuthority" TEXT NOT NULL,
    "officialUrl" TEXT,
    "summary" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "liturgicalDayId" TEXT,
    "celebrationId" TEXT,
    "readingId" TEXT,
    "saintId" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormationPathway" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedHours" INTEGER,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormationPathway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormationModule" (
    "id" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "moduleOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormationModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormationLesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "lessonOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "catechismEntryId" TEXT,
    "churchDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormationLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MigrationRecord" (
    "id" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL DEFAULT 'wordpress',
    "legacyObjectType" TEXT NOT NULL,
    "legacyObjectId" INTEGER NOT NULL,
    "legacySlug" TEXT,
    "legacyUrl" TEXT,
    "migrationVersion" TEXT NOT NULL DEFAULT '1.0',
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saintId" TEXT,
    "prayerId" TEXT,
    "novenaId" TEXT,
    "readingId" TEXT,
    "liturgicalDayId" TEXT,
    "catechismEntryId" TEXT,
    "churchDocumentId" TEXT,
    "formationPathwayId" TEXT,

    CONSTRAINT "MigrationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiturgicalSeason_code_key" ON "LiturgicalSeason"("code");

-- CreateIndex
CREATE INDEX "LiturgicalDay_date_idx" ON "LiturgicalDay"("date");

-- CreateIndex
CREATE INDEX "LiturgicalDay_calendarCode_idx" ON "LiturgicalDay"("calendarCode");

-- CreateIndex
CREATE UNIQUE INDEX "LiturgicalDay_calendarCode_date_key" ON "LiturgicalDay"("calendarCode", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Celebration_slug_key" ON "Celebration"("slug");

-- CreateIndex
CREATE INDEX "Celebration_slug_idx" ON "Celebration"("slug");

-- CreateIndex
CREATE INDEX "Celebration_rank_idx" ON "Celebration"("rank");

-- CreateIndex
CREATE INDEX "Celebration_fixedMonth_fixedDay_idx" ON "Celebration"("fixedMonth", "fixedDay");

-- CreateIndex
CREATE INDEX "LiturgicalDayCelebration_liturgicalDayId_idx" ON "LiturgicalDayCelebration"("liturgicalDayId");

-- CreateIndex
CREATE INDEX "LiturgicalDayCelebration_celebrationId_idx" ON "LiturgicalDayCelebration"("celebrationId");

-- CreateIndex
CREATE UNIQUE INDEX "LiturgicalDayCelebration_liturgicalDayId_celebrationId_key" ON "LiturgicalDayCelebration"("liturgicalDayId", "celebrationId");

-- CreateIndex
CREATE INDEX "Reading_liturgicalDayId_readingOrder_idx" ON "Reading"("liturgicalDayId", "readingOrder");

-- CreateIndex
CREATE INDEX "Reading_celebrationId_readingOrder_idx" ON "Reading"("celebrationId", "readingOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Saint_slug_key" ON "Saint"("slug");

-- CreateIndex
CREATE INDEX "Saint_slug_idx" ON "Saint"("slug");

-- CreateIndex
CREATE INDEX "Saint_ecclesialStatus_idx" ON "Saint"("ecclesialStatus");

-- CreateIndex
CREATE INDEX "Saint_feastDateMonth_feastDateDay_idx" ON "Saint"("feastDateMonth", "feastDateDay");

-- CreateIndex
CREATE INDEX "Saint_publicationStatus_idx" ON "Saint"("publicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Patronage_name_key" ON "Patronage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Patronage_slug_key" ON "Patronage"("slug");

-- CreateIndex
CREATE INDEX "SaintPatronage_saintId_idx" ON "SaintPatronage"("saintId");

-- CreateIndex
CREATE INDEX "SaintPatronage_patronageId_idx" ON "SaintPatronage"("patronageId");

-- CreateIndex
CREATE UNIQUE INDEX "SaintPatronage_saintId_patronageId_key" ON "SaintPatronage"("saintId", "patronageId");

-- CreateIndex
CREATE UNIQUE INDEX "Vocation_name_key" ON "Vocation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vocation_slug_key" ON "Vocation"("slug");

-- CreateIndex
CREATE INDEX "SaintVocation_saintId_idx" ON "SaintVocation"("saintId");

-- CreateIndex
CREATE INDEX "SaintVocation_vocationId_idx" ON "SaintVocation"("vocationId");

-- CreateIndex
CREATE UNIQUE INDEX "SaintVocation_saintId_vocationId_key" ON "SaintVocation"("saintId", "vocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Prayer_slug_key" ON "Prayer"("slug");

-- CreateIndex
CREATE INDEX "Prayer_slug_idx" ON "Prayer"("slug");

-- CreateIndex
CREATE INDEX "Prayer_prayerType_idx" ON "Prayer"("prayerType");

-- CreateIndex
CREATE INDEX "Prayer_publicationStatus_idx" ON "Prayer"("publicationStatus");

-- CreateIndex
CREATE INDEX "SaintPrayer_saintId_idx" ON "SaintPrayer"("saintId");

-- CreateIndex
CREATE INDEX "SaintPrayer_prayerId_idx" ON "SaintPrayer"("prayerId");

-- CreateIndex
CREATE UNIQUE INDEX "SaintPrayer_saintId_prayerId_key" ON "SaintPrayer"("saintId", "prayerId");

-- CreateIndex
CREATE UNIQUE INDEX "Novena_slug_key" ON "Novena"("slug");

-- CreateIndex
CREATE INDEX "Novena_slug_idx" ON "Novena"("slug");

-- CreateIndex
CREATE INDEX "Novena_publicationStatus_idx" ON "Novena"("publicationStatus");

-- CreateIndex
CREATE INDEX "SaintNovena_saintId_idx" ON "SaintNovena"("saintId");

-- CreateIndex
CREATE INDEX "SaintNovena_novenaId_idx" ON "SaintNovena"("novenaId");

-- CreateIndex
CREATE UNIQUE INDEX "SaintNovena_saintId_novenaId_key" ON "SaintNovena"("saintId", "novenaId");

-- CreateIndex
CREATE INDEX "NovenaDay_novenaId_idx" ON "NovenaDay"("novenaId");

-- CreateIndex
CREATE UNIQUE INDEX "NovenaDay_novenaId_dayNumber_key" ON "NovenaDay"("novenaId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CatechismEntry_slug_key" ON "CatechismEntry"("slug");

-- CreateIndex
CREATE INDEX "CatechismEntry_slug_idx" ON "CatechismEntry"("slug");

-- CreateIndex
CREATE INDEX "CatechismEntry_paragraphStart_paragraphEnd_idx" ON "CatechismEntry"("paragraphStart", "paragraphEnd");

-- CreateIndex
CREATE INDEX "CatechismEntry_pillar_idx" ON "CatechismEntry"("pillar");

-- CreateIndex
CREATE INDEX "CatechismEntry_publicationStatus_idx" ON "CatechismEntry"("publicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchDocument_slug_key" ON "ChurchDocument"("slug");

-- CreateIndex
CREATE INDEX "ChurchDocument_slug_idx" ON "ChurchDocument"("slug");

-- CreateIndex
CREATE INDEX "ChurchDocument_documentType_idx" ON "ChurchDocument"("documentType");

-- CreateIndex
CREATE INDEX "ChurchDocument_publicationStatus_idx" ON "ChurchDocument"("publicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_slug_key" ON "Reflection"("slug");

-- CreateIndex
CREATE INDEX "Reflection_slug_idx" ON "Reflection"("slug");

-- CreateIndex
CREATE INDEX "Reflection_liturgicalDayId_idx" ON "Reflection"("liturgicalDayId");

-- CreateIndex
CREATE INDEX "Reflection_celebrationId_idx" ON "Reflection"("celebrationId");

-- CreateIndex
CREATE INDEX "Reflection_saintId_idx" ON "Reflection"("saintId");

-- CreateIndex
CREATE INDEX "Reflection_publicationStatus_idx" ON "Reflection"("publicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "FormationPathway_slug_key" ON "FormationPathway"("slug");

-- CreateIndex
CREATE INDEX "FormationPathway_slug_idx" ON "FormationPathway"("slug");

-- CreateIndex
CREATE INDEX "FormationPathway_publicationStatus_idx" ON "FormationPathway"("publicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "FormationModule_slug_key" ON "FormationModule"("slug");

-- CreateIndex
CREATE INDEX "FormationModule_pathwayId_idx" ON "FormationModule"("pathwayId");

-- CreateIndex
CREATE UNIQUE INDEX "FormationModule_pathwayId_moduleOrder_key" ON "FormationModule"("pathwayId", "moduleOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FormationLesson_slug_key" ON "FormationLesson"("slug");

-- CreateIndex
CREATE INDEX "FormationLesson_moduleId_idx" ON "FormationLesson"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "FormationLesson_moduleId_lessonOrder_key" ON "FormationLesson"("moduleId", "lessonOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_saintId_key" ON "MigrationRecord"("saintId");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_prayerId_key" ON "MigrationRecord"("prayerId");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_novenaId_key" ON "MigrationRecord"("novenaId");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_readingId_key" ON "MigrationRecord"("readingId");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_liturgicalDayId_key" ON "MigrationRecord"("liturgicalDayId");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_catechismEntryId_key" ON "MigrationRecord"("catechismEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_churchDocumentId_key" ON "MigrationRecord"("churchDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_formationPathwayId_key" ON "MigrationRecord"("formationPathwayId");

-- CreateIndex
CREATE INDEX "MigrationRecord_legacyObjectType_legacyObjectId_idx" ON "MigrationRecord"("legacyObjectType", "legacyObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "MigrationRecord_sourceSystem_legacyObjectType_legacyObjectI_key" ON "MigrationRecord"("sourceSystem", "legacyObjectType", "legacyObjectId");

-- AddForeignKey
ALTER TABLE "LiturgicalDay" ADD CONSTRAINT "LiturgicalDay_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "LiturgicalSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Celebration" ADD CONSTRAINT "Celebration_saintId_fkey" FOREIGN KEY ("saintId") REFERENCES "Saint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiturgicalDayCelebration" ADD CONSTRAINT "LiturgicalDayCelebration_liturgicalDayId_fkey" FOREIGN KEY ("liturgicalDayId") REFERENCES "LiturgicalDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiturgicalDayCelebration" ADD CONSTRAINT "LiturgicalDayCelebration_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_liturgicalDayId_fkey" FOREIGN KEY ("liturgicalDayId") REFERENCES "LiturgicalDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaintPatronage" ADD CONSTRAINT "SaintPatronage_saintId_fkey" FOREIGN KEY ("saintId") REFERENCES "Saint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaintPatronage" ADD CONSTRAINT "SaintPatronage_patronageId_fkey" FOREIGN KEY ("patronageId") REFERENCES "Patronage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaintVocation" ADD CONSTRAINT "SaintVocation_saintId_fkey" FOREIGN KEY ("saintId") REFERENCES "Saint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaintVocation" ADD CONSTRAINT "SaintVocation_vocationId_fkey" FOREIGN KEY ("vocationId") REFERENCES "Vocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prayer" ADD CONSTRAINT "Prayer_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "ChurchDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaintPrayer" ADD CONSTRAINT "SaintPrayer_saintId_fkey" FOREIGN KEY ("saintId") REFERENCES "Saint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaintPrayer" ADD CONSTRAINT "SaintPrayer_prayerId_fkey" FOREIGN KEY ("prayerId") REFERENCES "Prayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novena" ADD CONSTRAINT "Novena_saintId_fkey" FOREIGN KEY ("saintId") REFERENCES "Saint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaintNovena" ADD CONSTRAINT "SaintNovena_saintId_fkey" FOREIGN KEY ("saintId") REFERENCES "Saint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaintNovena" ADD CONSTRAINT "SaintNovena_novenaId_fkey" FOREIGN KEY ("novenaId") REFERENCES "Novena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NovenaDay" ADD CONSTRAINT "NovenaDay_novenaId_fkey" FOREIGN KEY ("novenaId") REFERENCES "Novena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_liturgicalDayId_fkey" FOREIGN KEY ("liturgicalDayId") REFERENCES "LiturgicalDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_saintId_fkey" FOREIGN KEY ("saintId") REFERENCES "Saint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationModule" ADD CONSTRAINT "FormationModule_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "FormationPathway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationLesson" ADD CONSTRAINT "FormationLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "FormationModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationLesson" ADD CONSTRAINT "FormationLesson_catechismEntryId_fkey" FOREIGN KEY ("catechismEntryId") REFERENCES "CatechismEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationLesson" ADD CONSTRAINT "FormationLesson_churchDocumentId_fkey" FOREIGN KEY ("churchDocumentId") REFERENCES "ChurchDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationRecord" ADD CONSTRAINT "MigrationRecord_saintId_fkey" FOREIGN KEY ("saintId") REFERENCES "Saint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationRecord" ADD CONSTRAINT "MigrationRecord_prayerId_fkey" FOREIGN KEY ("prayerId") REFERENCES "Prayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationRecord" ADD CONSTRAINT "MigrationRecord_novenaId_fkey" FOREIGN KEY ("novenaId") REFERENCES "Novena"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationRecord" ADD CONSTRAINT "MigrationRecord_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationRecord" ADD CONSTRAINT "MigrationRecord_liturgicalDayId_fkey" FOREIGN KEY ("liturgicalDayId") REFERENCES "LiturgicalDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationRecord" ADD CONSTRAINT "MigrationRecord_catechismEntryId_fkey" FOREIGN KEY ("catechismEntryId") REFERENCES "CatechismEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationRecord" ADD CONSTRAINT "MigrationRecord_churchDocumentId_fkey" FOREIGN KEY ("churchDocumentId") REFERENCES "ChurchDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationRecord" ADD CONSTRAINT "MigrationRecord_formationPathwayId_fkey" FOREIGN KEY ("formationPathwayId") REFERENCES "FormationPathway"("id") ON DELETE SET NULL ON UPDATE CASCADE;
