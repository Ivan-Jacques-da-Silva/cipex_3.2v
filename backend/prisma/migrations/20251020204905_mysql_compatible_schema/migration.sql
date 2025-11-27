/*
  Warnings:

  - The primary key for the `cp_chamadas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_ch_aluno_id` on the `cp_chamadas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ch_data` on the `cp_chamadas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ch_id` on the `cp_chamadas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ch_observacao` on the `cp_chamadas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ch_presente` on the `cp_chamadas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ch_turma_id` on the `cp_chamadas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ec_descricao` on the `cp_escolas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ec_endereco_bairro` on the `cp_escolas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ec_endereco_cidade` on the `cp_escolas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_ec_endereco_estado` on the `cp_escolas` table. All the data in the column will be lost.
  - The `cp_ec_data_cadastro` column on the `cp_escolas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cp_ec_excluido` column on the `cp_escolas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `cp_mat_extra` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_me_arquivo` on the `cp_mat_extra` table. All the data in the column will be lost.
  - You are about to drop the column `cp_me_descricao` on the `cp_mat_extra` table. All the data in the column will be lost.
  - You are about to drop the column `cp_me_id` on the `cp_mat_extra` table. All the data in the column will be lost.
  - You are about to drop the column `cp_me_nome` on the `cp_mat_extra` table. All the data in the column will be lost.
  - The primary key for the `cp_mat_materiais` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_mm_arquivo` on the `cp_mat_materiais` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mm_id` on the `cp_mat_materiais` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mm_nome` on the `cp_mat_materiais` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mm_tipo` on the `cp_mat_materiais` table. All the data in the column will be lost.
  - The primary key for the `cp_matriculaParcelas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_mt_id` on the `cp_matriculaParcelas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mtp_data_pagamento` on the `cp_matriculaParcelas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mtp_id` on the `cp_matriculaParcelas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mtp_numero` on the `cp_matriculaParcelas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mtp_pago` on the `cp_matriculaParcelas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mtp_valor` on the `cp_matriculaParcelas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mtp_vencimento` on the `cp_matriculaParcelas` table. All the data in the column will be lost.
  - The primary key for the `cp_matriculas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_mt_cadastro_usuario` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_contato_mae` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_contato_pai` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_curso` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_dias_semana` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_escola` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_escolaridade` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_excluido` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_horario_fim` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_horario_inicio` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_id` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_local_nascimento` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_nivel` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_nome_mae` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_nome_pai` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_nome_usuario` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_parcelas_pagas` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_primeira_parcela` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_quantas_parcelas` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_rede_social` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_tipo_pagamento` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_usuario` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_mt_valor_curso` on the `cp_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_status_matricula` on the `cp_matriculas` table. All the data in the column will be lost.
  - The primary key for the `cp_resumos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_rs_conteudo` on the `cp_resumos` table. All the data in the column will be lost.
  - You are about to drop the column `cp_rs_data_criacao` on the `cp_resumos` table. All the data in the column will be lost.
  - You are about to drop the column `cp_rs_id` on the `cp_resumos` table. All the data in the column will be lost.
  - You are about to drop the column `cp_rs_titulo` on the `cp_resumos` table. All the data in the column will be lost.
  - The primary key for the `cp_tr_aluno` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_tr_id_escola` on the `cp_tr_aluno` table. All the data in the column will be lost.
  - You are about to drop the column `cp_tr_id_turma` on the `cp_tr_aluno` table. All the data in the column will be lost.
  - You are about to drop the column `cp_tr_id_usuario` on the `cp_tr_aluno` table. All the data in the column will be lost.
  - You are about to drop the column `cp_tra_id` on the `cp_tr_aluno` table. All the data in the column will be lost.
  - The primary key for the `cp_turmas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_tr_curso_id` on the `cp_turmas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_tr_data` on the `cp_turmas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_tr_id` on the `cp_turmas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_tr_id_escola` on the `cp_turmas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_tr_id_professor` on the `cp_turmas` table. All the data in the column will be lost.
  - You are about to drop the column `cp_tr_nome` on the `cp_turmas` table. All the data in the column will be lost.
  - The `cp_datanascimento` column on the `cp_usuarios` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `cp_cnpj` on the `cp_usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `cp_ie` on the `cp_usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `cp_end_cep` on the `cp_usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `cp_descricao` on the `cp_usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The primary key for the `cp_vizu_aud_usuarios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cp_id_audio` on the `cp_vizu_aud_usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `cp_id_usuario` on the `cp_vizu_aud_usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `cp_vau_data_vizualizacao` on the `cp_vizu_aud_usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `cp_vau_id` on the `cp_vizu_aud_usuarios` table. All the data in the column will be lost.
  - You are about to drop the `eventos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cp_chamada_id` to the `cp_chamadas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp_mat_extra_id` to the `cp_mat_extra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp_mat_materiais_id` to the `cp_mat_materiais` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp_parcela_id` to the `cp_matriculaParcelas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp_mat_id` to the `cp_matriculas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp_resumo_id` to the `cp_resumos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp_tr_id` to the `cp_tr_aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp_turma_id` to the `cp_turmas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp_vizu_id` to the `cp_vizu_aud_usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."cp_chamadas" DROP CONSTRAINT "cp_chamadas_cp_ch_aluno_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_chamadas" DROP CONSTRAINT "cp_chamadas_cp_ch_turma_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_matriculaParcelas" DROP CONSTRAINT "cp_matriculaParcelas_cp_mt_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_matriculas" DROP CONSTRAINT "cp_matriculas_cp_mt_escola_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_tr_aluno" DROP CONSTRAINT "cp_tr_aluno_cp_tr_id_escola_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_tr_aluno" DROP CONSTRAINT "cp_tr_aluno_cp_tr_id_turma_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_tr_aluno" DROP CONSTRAINT "cp_tr_aluno_cp_tr_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_turmas" DROP CONSTRAINT "cp_turmas_cp_tr_curso_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_turmas" DROP CONSTRAINT "cp_turmas_cp_tr_id_escola_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_turmas" DROP CONSTRAINT "cp_turmas_cp_tr_id_professor_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_usuarios" DROP CONSTRAINT "cp_usuarios_cp_escola_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_usuarios" DROP CONSTRAINT "cp_usuarios_cp_turma_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_vizu_aud_usuarios" DROP CONSTRAINT "cp_vizu_aud_usuarios_cp_id_audio_fkey";

-- DropForeignKey
ALTER TABLE "public"."cp_vizu_aud_usuarios" DROP CONSTRAINT "cp_vizu_aud_usuarios_cp_id_usuario_fkey";

-- AlterTable
ALTER TABLE "cp_audio" ALTER COLUMN "cp_audio_id" DROP DEFAULT,
ALTER COLUMN "cp_nome_audio" DROP NOT NULL,
ALTER COLUMN "cp_arquivo_audio" DROP NOT NULL;
DROP SEQUENCE "cp_audio_cp_audio_id_seq";

-- AlterTable
ALTER TABLE "cp_chamadas" DROP CONSTRAINT "cp_chamadas_pkey",
DROP COLUMN "cp_ch_aluno_id",
DROP COLUMN "cp_ch_data",
DROP COLUMN "cp_ch_id",
DROP COLUMN "cp_ch_observacao",
DROP COLUMN "cp_ch_presente",
DROP COLUMN "cp_ch_turma_id",
ADD COLUMN     "cp_chamada_id" INTEGER NOT NULL,
ADD COLUMN     "cp_data_chamada" VARCHAR(20),
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_presente" INTEGER DEFAULT 0,
ADD COLUMN     "cp_turma_id" INTEGER,
ADD COLUMN     "cp_usuario_id" INTEGER,
ADD CONSTRAINT "cp_chamadas_pkey" PRIMARY KEY ("cp_chamada_id");

-- AlterTable
ALTER TABLE "cp_curso" ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_pdf4_curso" VARCHAR(255),
ADD COLUMN     "cp_pdf5_curso" VARCHAR(255),
ALTER COLUMN "cp_curso_id" DROP DEFAULT,
ALTER COLUMN "cp_nome_curso" DROP NOT NULL;
DROP SEQUENCE "cp_curso_cp_curso_id_seq";

-- AlterTable
ALTER TABLE "cp_escolas" DROP COLUMN "cp_ec_descricao",
DROP COLUMN "cp_ec_endereco_bairro",
DROP COLUMN "cp_ec_endereco_cidade",
DROP COLUMN "cp_ec_endereco_estado",
ADD COLUMN     "cp_ec_cidade" VARCHAR(50),
ADD COLUMN     "cp_ec_email" VARCHAR(50),
ADD COLUMN     "cp_ec_endereco_cep" VARCHAR(20),
ADD COLUMN     "cp_ec_estado" VARCHAR(2),
ADD COLUMN     "cp_ec_telefone" VARCHAR(14),
ALTER COLUMN "cp_ec_id" DROP DEFAULT,
DROP COLUMN "cp_ec_data_cadastro",
ADD COLUMN     "cp_ec_data_cadastro" VARCHAR(20),
DROP COLUMN "cp_ec_excluido",
ADD COLUMN     "cp_ec_excluido" INTEGER DEFAULT 0;
DROP SEQUENCE "cp_escolas_cp_ec_id_seq";

-- AlterTable
ALTER TABLE "cp_mat_extra" DROP CONSTRAINT "cp_mat_extra_pkey",
DROP COLUMN "cp_me_arquivo",
DROP COLUMN "cp_me_descricao",
DROP COLUMN "cp_me_id",
DROP COLUMN "cp_me_nome",
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_mat_extra_arquivo" VARCHAR(255),
ADD COLUMN     "cp_mat_extra_descricao" TEXT,
ADD COLUMN     "cp_mat_extra_id" INTEGER NOT NULL,
ADD COLUMN     "cp_mat_extra_nome" VARCHAR(100),
ADD CONSTRAINT "cp_mat_extra_pkey" PRIMARY KEY ("cp_mat_extra_id");

-- AlterTable
ALTER TABLE "cp_mat_materiais" DROP CONSTRAINT "cp_mat_materiais_pkey",
DROP COLUMN "cp_mm_arquivo",
DROP COLUMN "cp_mm_id",
DROP COLUMN "cp_mm_nome",
DROP COLUMN "cp_mm_tipo",
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_mat_materiais_arquivo" VARCHAR(255),
ADD COLUMN     "cp_mat_materiais_descricao" TEXT,
ADD COLUMN     "cp_mat_materiais_id" INTEGER NOT NULL,
ADD COLUMN     "cp_mat_materiais_nome" VARCHAR(100),
ADD CONSTRAINT "cp_mat_materiais_pkey" PRIMARY KEY ("cp_mat_materiais_id");

-- AlterTable
ALTER TABLE "cp_matriculaParcelas" DROP CONSTRAINT "cp_matriculaParcelas_pkey",
DROP COLUMN "cp_mt_id",
DROP COLUMN "cp_mtp_data_pagamento",
DROP COLUMN "cp_mtp_id",
DROP COLUMN "cp_mtp_numero",
DROP COLUMN "cp_mtp_pago",
DROP COLUMN "cp_mtp_valor",
DROP COLUMN "cp_mtp_vencimento",
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_mat_id" INTEGER,
ADD COLUMN     "cp_parcela_data_pagto" VARCHAR(20),
ADD COLUMN     "cp_parcela_id" INTEGER NOT NULL,
ADD COLUMN     "cp_parcela_numero" VARCHAR(10),
ADD COLUMN     "cp_parcela_paga" INTEGER DEFAULT 0,
ADD COLUMN     "cp_parcela_valor" VARCHAR(20),
ADD COLUMN     "cp_parcela_vencimento" VARCHAR(20),
ADD CONSTRAINT "cp_matriculaParcelas_pkey" PRIMARY KEY ("cp_parcela_id");

-- AlterTable
ALTER TABLE "cp_matriculas" DROP CONSTRAINT "cp_matriculas_pkey",
DROP COLUMN "cp_mt_cadastro_usuario",
DROP COLUMN "cp_mt_contato_mae",
DROP COLUMN "cp_mt_contato_pai",
DROP COLUMN "cp_mt_curso",
DROP COLUMN "cp_mt_dias_semana",
DROP COLUMN "cp_mt_escola",
DROP COLUMN "cp_mt_escolaridade",
DROP COLUMN "cp_mt_excluido",
DROP COLUMN "cp_mt_horario_fim",
DROP COLUMN "cp_mt_horario_inicio",
DROP COLUMN "cp_mt_id",
DROP COLUMN "cp_mt_local_nascimento",
DROP COLUMN "cp_mt_nivel",
DROP COLUMN "cp_mt_nome_mae",
DROP COLUMN "cp_mt_nome_pai",
DROP COLUMN "cp_mt_nome_usuario",
DROP COLUMN "cp_mt_parcelas_pagas",
DROP COLUMN "cp_mt_primeira_parcela",
DROP COLUMN "cp_mt_quantas_parcelas",
DROP COLUMN "cp_mt_rede_social",
DROP COLUMN "cp_mt_tipo_pagamento",
DROP COLUMN "cp_mt_usuario",
DROP COLUMN "cp_mt_valor_curso",
DROP COLUMN "cp_status_matricula",
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_mat_data_matricula" VARCHAR(20),
ADD COLUMN     "cp_mat_desconto" VARCHAR(20),
ADD COLUMN     "cp_mat_forma_pagamento" VARCHAR(50),
ADD COLUMN     "cp_mat_id" INTEGER NOT NULL,
ADD COLUMN     "cp_mat_num_parcelas" VARCHAR(10),
ADD COLUMN     "cp_mat_observacoes" TEXT,
ADD COLUMN     "cp_mat_valor_final" VARCHAR(20),
ADD COLUMN     "cp_mat_valor_total" VARCHAR(20),
ADD COLUMN     "cp_usuario_id" INTEGER,
ADD CONSTRAINT "cp_matriculas_pkey" PRIMARY KEY ("cp_mat_id");

-- AlterTable
ALTER TABLE "cp_resumos" DROP CONSTRAINT "cp_resumos_pkey",
DROP COLUMN "cp_rs_conteudo",
DROP COLUMN "cp_rs_data_criacao",
DROP COLUMN "cp_rs_id",
DROP COLUMN "cp_rs_titulo",
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_resumo_conteudo" TEXT,
ADD COLUMN     "cp_resumo_data" VARCHAR(20),
ADD COLUMN     "cp_resumo_id" INTEGER NOT NULL,
ADD COLUMN     "cp_resumo_titulo" VARCHAR(100),
ADD COLUMN     "cp_turma_id" INTEGER,
ADD CONSTRAINT "cp_resumos_pkey" PRIMARY KEY ("cp_resumo_id");

-- AlterTable
ALTER TABLE "cp_tr_aluno" DROP CONSTRAINT "cp_tr_aluno_pkey",
DROP COLUMN "cp_tr_id_escola",
DROP COLUMN "cp_tr_id_turma",
DROP COLUMN "cp_tr_id_usuario",
DROP COLUMN "cp_tra_id",
ADD COLUMN     "cp_escola_id" INTEGER,
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_tr_id" INTEGER NOT NULL,
ADD COLUMN     "cp_turma_id" INTEGER,
ADD COLUMN     "cp_usuario_id" INTEGER,
ADD CONSTRAINT "cp_tr_aluno_pkey" PRIMARY KEY ("cp_tr_id");

-- AlterTable
ALTER TABLE "cp_turmas" DROP CONSTRAINT "cp_turmas_pkey",
DROP COLUMN "cp_tr_curso_id",
DROP COLUMN "cp_tr_data",
DROP COLUMN "cp_tr_id",
DROP COLUMN "cp_tr_id_escola",
DROP COLUMN "cp_tr_id_professor",
DROP COLUMN "cp_tr_nome",
ADD COLUMN     "cp_escola_id" INTEGER,
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_turma_ano" VARCHAR(4),
ADD COLUMN     "cp_turma_id" INTEGER NOT NULL,
ADD COLUMN     "cp_turma_nome" VARCHAR(100),
ADD COLUMN     "cp_turma_semestre" VARCHAR(1),
ADD COLUMN     "cp_usuario_id" INTEGER,
ADD CONSTRAINT "cp_turmas_pkey" PRIMARY KEY ("cp_turma_id");

-- AlterTable
ALTER TABLE "cp_usuarios" ALTER COLUMN "cp_id" DROP DEFAULT,
ALTER COLUMN "cp_nome" DROP NOT NULL,
ALTER COLUMN "cp_email" DROP NOT NULL,
ALTER COLUMN "cp_login" DROP NOT NULL,
ALTER COLUMN "cp_password" DROP NOT NULL,
ALTER COLUMN "cp_tipo_user" DROP NOT NULL,
ALTER COLUMN "cp_cpf" DROP NOT NULL,
DROP COLUMN "cp_datanascimento",
ADD COLUMN     "cp_datanascimento" VARCHAR(20),
ALTER COLUMN "cp_cnpj" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "cp_ie" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "cp_end_num" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "cp_end_cep" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "cp_descricao" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "cp_excluido" DROP NOT NULL;
DROP SEQUENCE "cp_usuarios_cp_id_seq";

-- AlterTable
ALTER TABLE "cp_vizu_aud_usuarios" DROP CONSTRAINT "cp_vizu_aud_usuarios_pkey",
DROP COLUMN "cp_id_audio",
DROP COLUMN "cp_id_usuario",
DROP COLUMN "cp_vau_data_vizualizacao",
DROP COLUMN "cp_vau_id",
ADD COLUMN     "cp_audio_id" INTEGER,
ADD COLUMN     "cp_data_vizu" VARCHAR(20),
ADD COLUMN     "cp_excluido" INTEGER DEFAULT 0,
ADD COLUMN     "cp_usuario_id" INTEGER,
ADD COLUMN     "cp_vizu_id" INTEGER NOT NULL,
ADD CONSTRAINT "cp_vizu_aud_usuarios_pkey" PRIMARY KEY ("cp_vizu_id");

-- DropTable
DROP TABLE "public"."eventos";

-- AddForeignKey
ALTER TABLE "cp_turmas" ADD CONSTRAINT "cp_turmas_cp_escola_id_fkey" FOREIGN KEY ("cp_escola_id") REFERENCES "cp_escolas"("cp_ec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_turmas" ADD CONSTRAINT "cp_turmas_cp_usuario_id_fkey" FOREIGN KEY ("cp_usuario_id") REFERENCES "cp_usuarios"("cp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_resumos" ADD CONSTRAINT "cp_resumos_cp_turma_id_fkey" FOREIGN KEY ("cp_turma_id") REFERENCES "cp_turmas"("cp_turma_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_chamadas" ADD CONSTRAINT "cp_chamadas_cp_turma_id_fkey" FOREIGN KEY ("cp_turma_id") REFERENCES "cp_turmas"("cp_turma_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_chamadas" ADD CONSTRAINT "cp_chamadas_cp_usuario_id_fkey" FOREIGN KEY ("cp_usuario_id") REFERENCES "cp_usuarios"("cp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_tr_aluno" ADD CONSTRAINT "cp_tr_aluno_cp_escola_id_fkey" FOREIGN KEY ("cp_escola_id") REFERENCES "cp_escolas"("cp_ec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_tr_aluno" ADD CONSTRAINT "cp_tr_aluno_cp_turma_id_fkey" FOREIGN KEY ("cp_turma_id") REFERENCES "cp_turmas"("cp_turma_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_tr_aluno" ADD CONSTRAINT "cp_tr_aluno_cp_usuario_id_fkey" FOREIGN KEY ("cp_usuario_id") REFERENCES "cp_usuarios"("cp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_vizu_aud_usuarios" ADD CONSTRAINT "cp_vizu_aud_usuarios_cp_audio_id_fkey" FOREIGN KEY ("cp_audio_id") REFERENCES "cp_audio"("cp_audio_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_vizu_aud_usuarios" ADD CONSTRAINT "cp_vizu_aud_usuarios_cp_usuario_id_fkey" FOREIGN KEY ("cp_usuario_id") REFERENCES "cp_usuarios"("cp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_matriculaParcelas" ADD CONSTRAINT "cp_matriculaParcelas_cp_mat_id_fkey" FOREIGN KEY ("cp_mat_id") REFERENCES "cp_matriculas"("cp_mat_id") ON DELETE SET NULL ON UPDATE CASCADE;
