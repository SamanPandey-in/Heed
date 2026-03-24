CREATE TABLE "project_note_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "project_note_messages_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "project_note_messages"
ADD CONSTRAINT "project_note_messages_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_note_messages"
ADD CONSTRAINT "project_note_messages_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "project_note_messages_project_id_created_at_idx"
ON "project_note_messages"("project_id", "created_at");

CREATE INDEX "project_note_messages_user_id_idx"
ON "project_note_messages"("user_id");
