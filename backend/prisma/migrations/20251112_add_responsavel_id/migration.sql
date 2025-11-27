-- Adiciona coluna para armazenar o responsável por ID e faz backfill por nome

-- Add column
ALTER TABLE "public"."cp_escolas"
  ADD COLUMN IF NOT EXISTS "cp_ec_responsavel_id" INTEGER;

-- Add foreign key constraint (opcional, segura para nulos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'cp_escolas_cp_ec_responsavel_id_fkey'
  ) THEN
    ALTER TABLE "public"."cp_escolas"
      ADD CONSTRAINT "cp_escolas_cp_ec_responsavel_id_fkey"
      FOREIGN KEY ("cp_ec_responsavel_id")
      REFERENCES "public"."cp_usuarios"("cp_id")
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

-- Backfill: mapeia o ID do usuário pelo nome já salvo
UPDATE "public"."cp_escolas" e
SET "cp_ec_responsavel_id" = u."cp_id"
FROM "public"."cp_usuarios" u
WHERE e."cp_ec_responsavel" IS NOT NULL
  AND u."cp_nome" = e."cp_ec_responsavel"
  AND (e."cp_ec_responsavel_id" IS NULL OR e."cp_ec_responsavel_id" = 0);

-- Índice auxiliar
CREATE INDEX IF NOT EXISTS "idx_cp_escolas_responsavel_id"
  ON "public"."cp_escolas"("cp_ec_responsavel_id");

