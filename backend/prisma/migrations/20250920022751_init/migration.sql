-- CreateTable
CREATE TABLE "public"."cp_usuarios" (
    "cp_id" SERIAL NOT NULL,
    "cp_nome" VARCHAR(80) NOT NULL,
    "cp_email" VARCHAR(45) NOT NULL,
    "cp_login" VARCHAR(45) NOT NULL,
    "cp_password" VARCHAR(200) NOT NULL,
    "cp_tipo_user" INTEGER NOT NULL,
    "cp_rg" VARCHAR(20),
    "cp_cpf" VARCHAR(14) NOT NULL,
    "cp_datanascimento" DATE NOT NULL,
    "cp_estadocivil" VARCHAR(45),
    "cp_cnpj" BIGINT,
    "cp_ie" BIGINT,
    "cp_whatsapp" VARCHAR(14),
    "cp_telefone" VARCHAR(14),
    "cp_empresaatuacao" VARCHAR(45),
    "cp_profissao" VARCHAR(45),
    "cp_end_cidade_estado" VARCHAR(45),
    "cp_end_rua" VARCHAR(45),
    "cp_end_num" INTEGER,
    "cp_end_cep" BIGINT,
    "cp_descricao" TEXT,
    "cp_foto_perfil" VARCHAR(255),
    "cp_escola_id" INTEGER,
    "cp_turma_id" INTEGER,
    "cp_excluido" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cp_usuarios_pkey" PRIMARY KEY ("cp_id")
);

-- CreateTable
CREATE TABLE "public"."cp_escolas" (
    "cp_ec_id" SERIAL NOT NULL,
    "cp_ec_nome" VARCHAR(100),
    "cp_ec_data_cadastro" DATE,
    "cp_ec_responsavel" VARCHAR(50),
    "cp_ec_endereco_rua" VARCHAR(100),
    "cp_ec_endereco_numero" VARCHAR(20),
    "cp_ec_endereco_cidade" VARCHAR(50),
    "cp_ec_endereco_bairro" VARCHAR(50),
    "cp_ec_endereco_estado" VARCHAR(50),
    "cp_ec_excluido" BOOLEAN NOT NULL DEFAULT false,
    "cp_ec_descricao" VARCHAR(255),

    CONSTRAINT "cp_escolas_pkey" PRIMARY KEY ("cp_ec_id")
);

-- CreateTable
CREATE TABLE "public"."cp_turmas" (
    "cp_tr_id" SERIAL NOT NULL,
    "cp_tr_nome" VARCHAR(100) NOT NULL,
    "cp_tr_data" DATE NOT NULL,
    "cp_tr_id_professor" INTEGER NOT NULL,
    "cp_tr_id_escola" INTEGER NOT NULL,
    "cp_tr_curso_id" INTEGER,

    CONSTRAINT "cp_turmas_pkey" PRIMARY KEY ("cp_tr_id")
);

-- CreateTable
CREATE TABLE "public"."cp_curso" (
    "cp_curso_id" SERIAL NOT NULL,
    "cp_nome_curso" VARCHAR(100) NOT NULL,
    "cp_youtube_link_curso" VARCHAR(255),
    "cp_pdf1_curso" VARCHAR(255),
    "cp_pdf2_curso" VARCHAR(255),
    "cp_pdf3_curso" VARCHAR(255),

    CONSTRAINT "cp_curso_pkey" PRIMARY KEY ("cp_curso_id")
);

-- CreateTable
CREATE TABLE "public"."cp_audio" (
    "cp_audio_id" SERIAL NOT NULL,
    "cp_curso_id" INTEGER,
    "cp_nome_audio" VARCHAR(100) NOT NULL,
    "cp_arquivo_audio" VARCHAR(255) NOT NULL,

    CONSTRAINT "cp_audio_pkey" PRIMARY KEY ("cp_audio_id")
);

-- CreateTable
CREATE TABLE "public"."cp_matriculas" (
    "cp_mt_id" SERIAL NOT NULL,
    "cp_mt_curso" VARCHAR(255),
    "cp_mt_escola" INTEGER,
    "cp_mt_usuario" VARCHAR(255),
    "cp_mt_nome_usuario" VARCHAR(255),
    "cp_mt_cadastro_usuario" VARCHAR(255),
    "cp_mt_valor_curso" DECIMAL(10,2),
    "cp_mt_quantas_parcelas" INTEGER,
    "cp_mt_parcelas_pagas" INTEGER,
    "cp_mt_primeira_parcela" DATE,
    "cp_status_matricula" VARCHAR(50),
    "cp_mt_nivel" VARCHAR(50),
    "cp_mt_horario_inicio" VARCHAR(10),
    "cp_mt_horario_fim" VARCHAR(10),
    "cp_mt_escolaridade" VARCHAR(100),
    "cp_mt_local_nascimento" VARCHAR(100),
    "cp_mt_rede_social" VARCHAR(100),
    "cp_mt_nome_pai" VARCHAR(100),
    "cp_mt_contato_pai" VARCHAR(20),
    "cp_mt_nome_mae" VARCHAR(100),
    "cp_mt_contato_mae" VARCHAR(20),
    "cp_mt_excluido" INTEGER NOT NULL DEFAULT 0,
    "cp_mt_tipo_pagamento" VARCHAR(20),
    "cp_mt_dias_semana" VARCHAR(100),

    CONSTRAINT "cp_matriculas_pkey" PRIMARY KEY ("cp_mt_id")
);

-- CreateTable
CREATE TABLE "public"."cp_matriculaParcelas" (
    "cp_mtp_id" SERIAL NOT NULL,
    "cp_mt_id" INTEGER NOT NULL,
    "cp_mtp_numero" INTEGER,
    "cp_mtp_valor" DECIMAL(10,2),
    "cp_mtp_vencimento" DATE,
    "cp_mtp_pago" BOOLEAN NOT NULL DEFAULT false,
    "cp_mtp_data_pagamento" DATE,

    CONSTRAINT "cp_matriculaParcelas_pkey" PRIMARY KEY ("cp_mtp_id")
);

-- CreateTable
CREATE TABLE "public"."cp_chamadas" (
    "cp_ch_id" SERIAL NOT NULL,
    "cp_ch_turma_id" INTEGER NOT NULL,
    "cp_ch_aluno_id" INTEGER NOT NULL,
    "cp_ch_data" DATE NOT NULL,
    "cp_ch_presente" BOOLEAN NOT NULL DEFAULT false,
    "cp_ch_observacao" TEXT,

    CONSTRAINT "cp_chamadas_pkey" PRIMARY KEY ("cp_ch_id")
);

-- CreateTable
CREATE TABLE "public"."cp_mat_extra" (
    "cp_me_id" SERIAL NOT NULL,
    "cp_me_nome" VARCHAR(100),
    "cp_me_arquivo" VARCHAR(255),
    "cp_me_descricao" TEXT,

    CONSTRAINT "cp_mat_extra_pkey" PRIMARY KEY ("cp_me_id")
);

-- CreateTable
CREATE TABLE "public"."cp_mat_materiais" (
    "cp_mm_id" SERIAL NOT NULL,
    "cp_mm_nome" VARCHAR(100),
    "cp_mm_arquivo" VARCHAR(255),
    "cp_mm_tipo" VARCHAR(50),

    CONSTRAINT "cp_mat_materiais_pkey" PRIMARY KEY ("cp_mm_id")
);

-- CreateTable
CREATE TABLE "public"."cp_resumos" (
    "cp_rs_id" SERIAL NOT NULL,
    "cp_rs_titulo" VARCHAR(150),
    "cp_rs_conteudo" TEXT,
    "cp_rs_data_criacao" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cp_resumos_pkey" PRIMARY KEY ("cp_rs_id")
);

-- CreateTable
CREATE TABLE "public"."cp_tr_aluno" (
    "cp_tra_id" SERIAL NOT NULL,
    "cp_tr_id_escola" INTEGER NOT NULL,
    "cp_tr_id_turma" INTEGER NOT NULL,
    "cp_tr_id_usuario" INTEGER NOT NULL,

    CONSTRAINT "cp_tr_aluno_pkey" PRIMARY KEY ("cp_tra_id")
);

-- CreateTable
CREATE TABLE "public"."cp_vizu_aud_usuarios" (
    "cp_vau_id" SERIAL NOT NULL,
    "cp_id_usuario" INTEGER NOT NULL,
    "cp_id_audio" INTEGER NOT NULL,
    "cp_vau_data_vizualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cp_vizu_aud_usuarios_pkey" PRIMARY KEY ("cp_vau_id")
);

-- CreateTable
CREATE TABLE "public"."eventos" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(100),
    "descricao" TEXT,
    "data_evento" DATE,
    "data_criacao" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."cp_usuarios" ADD CONSTRAINT "cp_usuarios_cp_escola_id_fkey" FOREIGN KEY ("cp_escola_id") REFERENCES "public"."cp_escolas"("cp_ec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_usuarios" ADD CONSTRAINT "cp_usuarios_cp_turma_id_fkey" FOREIGN KEY ("cp_turma_id") REFERENCES "public"."cp_turmas"("cp_tr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_turmas" ADD CONSTRAINT "cp_turmas_cp_tr_id_professor_fkey" FOREIGN KEY ("cp_tr_id_professor") REFERENCES "public"."cp_usuarios"("cp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_turmas" ADD CONSTRAINT "cp_turmas_cp_tr_id_escola_fkey" FOREIGN KEY ("cp_tr_id_escola") REFERENCES "public"."cp_escolas"("cp_ec_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_turmas" ADD CONSTRAINT "cp_turmas_cp_tr_curso_id_fkey" FOREIGN KEY ("cp_tr_curso_id") REFERENCES "public"."cp_curso"("cp_curso_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_audio" ADD CONSTRAINT "cp_audio_cp_curso_id_fkey" FOREIGN KEY ("cp_curso_id") REFERENCES "public"."cp_curso"("cp_curso_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_matriculas" ADD CONSTRAINT "cp_matriculas_cp_mt_escola_fkey" FOREIGN KEY ("cp_mt_escola") REFERENCES "public"."cp_escolas"("cp_ec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_matriculaParcelas" ADD CONSTRAINT "cp_matriculaParcelas_cp_mt_id_fkey" FOREIGN KEY ("cp_mt_id") REFERENCES "public"."cp_matriculas"("cp_mt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_chamadas" ADD CONSTRAINT "cp_chamadas_cp_ch_turma_id_fkey" FOREIGN KEY ("cp_ch_turma_id") REFERENCES "public"."cp_turmas"("cp_tr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_chamadas" ADD CONSTRAINT "cp_chamadas_cp_ch_aluno_id_fkey" FOREIGN KEY ("cp_ch_aluno_id") REFERENCES "public"."cp_usuarios"("cp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_tr_aluno" ADD CONSTRAINT "cp_tr_aluno_cp_tr_id_escola_fkey" FOREIGN KEY ("cp_tr_id_escola") REFERENCES "public"."cp_escolas"("cp_ec_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_tr_aluno" ADD CONSTRAINT "cp_tr_aluno_cp_tr_id_turma_fkey" FOREIGN KEY ("cp_tr_id_turma") REFERENCES "public"."cp_turmas"("cp_tr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_tr_aluno" ADD CONSTRAINT "cp_tr_aluno_cp_tr_id_usuario_fkey" FOREIGN KEY ("cp_tr_id_usuario") REFERENCES "public"."cp_usuarios"("cp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_vizu_aud_usuarios" ADD CONSTRAINT "cp_vizu_aud_usuarios_cp_id_usuario_fkey" FOREIGN KEY ("cp_id_usuario") REFERENCES "public"."cp_usuarios"("cp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cp_vizu_aud_usuarios" ADD CONSTRAINT "cp_vizu_aud_usuarios_cp_id_audio_fkey" FOREIGN KEY ("cp_id_audio") REFERENCES "public"."cp_audio"("cp_audio_id") ON DELETE RESTRICT ON UPDATE CASCADE;
