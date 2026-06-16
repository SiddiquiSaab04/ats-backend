/*
  Warnings:

  - Made the column `jobType` on table `job` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Application_candidateId_fkey` ON `application`;

-- DropIndex
DROP INDEX `Application_jobId_fkey` ON `application`;

-- DropIndex
DROP INDEX `Job_createdBy_fkey` ON `job`;

-- DropIndex
DROP INDEX `title` ON `job`;

-- AlterTable
ALTER TABLE `job` MODIFY `jobType` ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE', 'HYBRID', 'ON_SITE') NOT NULL;

-- CreateIndex
CREATE INDEX `JobSkill_jobId_idx` ON `JobSkill`(`jobId`);

-- AddForeignKey
ALTER TABLE `JobSkill` ADD CONSTRAINT `JobSkill_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobSkill` ADD CONSTRAINT `JobSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `job` RENAME INDEX `Job_companyId_fkey` TO `Job_companyId_idx`;

-- RenameIndex
ALTER TABLE `jobskill` RENAME INDEX `JobSkill_skillId_fkey` TO `JobSkill_skillId_idx`;
