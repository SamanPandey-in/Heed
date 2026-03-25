-- CreateTable
CREATE TABLE "team_note_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "team_note_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "team_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_note_messages_team_id_created_at_idx" ON "team_note_messages"("team_id", "created_at");

-- CreateIndex
CREATE INDEX "team_note_messages_user_id_idx" ON "team_note_messages"("user_id");

-- CreateIndex
CREATE INDEX "team_chat_messages_team_id_created_at_idx" ON "team_chat_messages"("team_id", "created_at");

-- CreateIndex
CREATE INDEX "team_chat_messages_user_id_idx" ON "team_chat_messages"("user_id");

-- AddForeignKey
ALTER TABLE "team_note_messages" ADD CONSTRAINT "team_note_messages_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_note_messages" ADD CONSTRAINT "team_note_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_chat_messages" ADD CONSTRAINT "team_chat_messages_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_chat_messages" ADD CONSTRAINT "team_chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
