/*
  Warnings:

  - The `cp_mt_usuario` column on the `cp_matriculas` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."cp_matriculas" DROP COLUMN "cp_mt_usuario",
ADD COLUMN     "cp_mt_usuario" INTEGER;

-- AlterTable
ALTER TABLE "public"."cp_usuarios" ALTER COLUMN "cp_cnpj" SET DATA TYPE TEXT,
ALTER COLUMN "cp_ie" SET DATA TYPE TEXT,
ALTER COLUMN "cp_end_cep" SET DATA TYPE TEXT;
