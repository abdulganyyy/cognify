drop extension if exists "pg_net";


  create table "public"."activity_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "document_id" uuid,
    "activity_type" character varying(50) not null,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."bookmarks" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "document_id" uuid not null,
    "bookmark_type" character varying(20) not null,
    "section_id" uuid,
    "topic_id" uuid,
    "flashcard_id" uuid,
    "highlighted_text" text,
    "note" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."chat_messages" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" uuid not null,
    "role" character varying(20) not null,
    "content" text not null,
    "source_section_ids" uuid[],
    "status" character varying(20) not null default 'completed'::character varying,
    "error_message" text,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."chat_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "document_id" uuid not null,
    "title" text,
    "last_message_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."document_sections" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null,
    "section_index" integer not null,
    "title" text,
    "content" text not null,
    "page_start" integer,
    "page_end" integer,
    "char_start" integer,
    "char_end" integer,
    "token_count" integer,
    "embedding_status" character varying(30) not null default 'pending'::character varying,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."document_summaries" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null,
    "section_id" uuid,
    "summary_type" character varying(30) not null default 'full'::character varying,
    "content" text not null,
    "language" character varying(10),
    "model_name" text,
    "version" integer not null default 1,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."document_topics" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null,
    "section_id" uuid,
    "name" text not null,
    "description" text,
    "topic_order" integer not null default 0,
    "importance_score" numeric(5,2),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."documents" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "original_file_name" text not null,
    "storage_path" text not null,
    "file_size_bytes" integer not null,
    "mime_type" text not null default 'application/pdf'::text,
    "page_count" integer,
    "status" character varying(30) not null default 'uploaded'::character varying,
    "processing_error" text,
    "language" character varying(10),
    "raw_text" text,
    "text_extracted" boolean not null default false,
    "summary_status" character varying(30) not null default 'pending'::character varying,
    "flashcard_status" character varying(30) not null default 'pending'::character varying,
    "topic_status" character varying(30) not null default 'pending'::character varying,
    "last_opened_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."flashcards" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null,
    "section_id" uuid,
    "question" text not null,
    "answer" text not null,
    "card_order" integer not null default 0,
    "difficulty" character varying(20),
    "source_excerpt" text,
    "created_by" character varying(20) not null default 'ai'::character varying,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "avatar_url" text,
    "preferred_language" character varying(10),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


CREATE UNIQUE INDEX activity_logs_pkey ON public.activity_logs USING btree (id);

CREATE UNIQUE INDEX bookmarks_pkey ON public.bookmarks USING btree (id);

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX chat_sessions_pkey ON public.chat_sessions USING btree (id);

CREATE UNIQUE INDEX document_sections_pkey ON public.document_sections USING btree (id);

CREATE UNIQUE INDEX document_sections_unique_order ON public.document_sections USING btree (document_id, section_index);

CREATE UNIQUE INDEX document_summaries_pkey ON public.document_summaries USING btree (id);

CREATE UNIQUE INDEX document_topics_pkey ON public.document_topics USING btree (id);

CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id);

CREATE UNIQUE INDEX flashcards_pkey ON public.flashcards USING btree (id);

CREATE INDEX idx_activity_logs_document_created_at ON public.activity_logs USING btree (document_id, created_at DESC);

CREATE INDEX idx_activity_logs_user_created_at ON public.activity_logs USING btree (user_id, created_at DESC);

CREATE INDEX idx_bookmarks_document_type ON public.bookmarks USING btree (document_id, bookmark_type);

CREATE INDEX idx_bookmarks_user_doc_created_at ON public.bookmarks USING btree (user_id, document_id, created_at DESC);

CREATE INDEX idx_chat_messages_session_created_at ON public.chat_messages USING btree (session_id, created_at);

CREATE INDEX idx_chat_sessions_user_doc_last_message ON public.chat_sessions USING btree (user_id, document_id, last_message_at DESC);

CREATE INDEX idx_document_sections_document_order ON public.document_sections USING btree (document_id, section_index);

CREATE INDEX idx_document_summaries_document_active ON public.document_summaries USING btree (document_id, is_active);

CREATE INDEX idx_document_topics_document_order ON public.document_topics USING btree (document_id, topic_order);

CREATE INDEX idx_documents_user_created_at ON public.documents USING btree (user_id, created_at DESC);

CREATE INDEX idx_documents_user_last_opened ON public.documents USING btree (user_id, last_opened_at DESC);

CREATE INDEX idx_documents_user_status ON public.documents USING btree (user_id, status);

CREATE INDEX idx_flashcards_document_order ON public.flashcards USING btree (document_id, card_order);

CREATE INDEX idx_flashcards_section ON public.flashcards USING btree (section_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."activity_logs" add constraint "activity_logs_pkey" PRIMARY KEY using index "activity_logs_pkey";

alter table "public"."bookmarks" add constraint "bookmarks_pkey" PRIMARY KEY using index "bookmarks_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."chat_sessions" add constraint "chat_sessions_pkey" PRIMARY KEY using index "chat_sessions_pkey";

alter table "public"."document_sections" add constraint "document_sections_pkey" PRIMARY KEY using index "document_sections_pkey";

alter table "public"."document_summaries" add constraint "document_summaries_pkey" PRIMARY KEY using index "document_summaries_pkey";

alter table "public"."document_topics" add constraint "document_topics_pkey" PRIMARY KEY using index "document_topics_pkey";

alter table "public"."documents" add constraint "documents_pkey" PRIMARY KEY using index "documents_pkey";

alter table "public"."flashcards" add constraint "flashcards_pkey" PRIMARY KEY using index "flashcards_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."activity_logs" add constraint "activity_logs_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE not valid;

alter table "public"."activity_logs" validate constraint "activity_logs_document_id_fkey";

alter table "public"."activity_logs" add constraint "activity_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."activity_logs" validate constraint "activity_logs_user_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_document_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_flashcard_id_fkey" FOREIGN KEY (flashcard_id) REFERENCES public.flashcards(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_flashcard_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_section_id_fkey" FOREIGN KEY (section_id) REFERENCES public.document_sections(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_section_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES public.document_topics(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_topic_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_type_check" CHECK (((bookmark_type)::text = ANY ((ARRAY['section'::character varying, 'topic'::character varying, 'flashcard'::character varying, 'text'::character varying])::text[]))) not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_type_check";

alter table "public"."bookmarks" add constraint "bookmarks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_user_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_role_check";

alter table "public"."chat_messages" add constraint "chat_messages_session_id_fkey" FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_session_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_status_check";

alter table "public"."chat_sessions" add constraint "chat_sessions_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE not valid;

alter table "public"."chat_sessions" validate constraint "chat_sessions_document_id_fkey";

alter table "public"."chat_sessions" add constraint "chat_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chat_sessions" validate constraint "chat_sessions_user_id_fkey";

alter table "public"."document_sections" add constraint "document_sections_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE not valid;

alter table "public"."document_sections" validate constraint "document_sections_document_id_fkey";

alter table "public"."document_sections" add constraint "document_sections_embedding_status_check" CHECK (((embedding_status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."document_sections" validate constraint "document_sections_embedding_status_check";

alter table "public"."document_sections" add constraint "document_sections_unique_order" UNIQUE using index "document_sections_unique_order";

alter table "public"."document_summaries" add constraint "document_summaries_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE not valid;

alter table "public"."document_summaries" validate constraint "document_summaries_document_id_fkey";

alter table "public"."document_summaries" add constraint "document_summaries_section_id_fkey" FOREIGN KEY (section_id) REFERENCES public.document_sections(id) ON DELETE CASCADE not valid;

alter table "public"."document_summaries" validate constraint "document_summaries_section_id_fkey";

alter table "public"."document_summaries" add constraint "document_summaries_type_check" CHECK (((summary_type)::text = ANY ((ARRAY['full'::character varying, 'short'::character varying, 'section'::character varying])::text[]))) not valid;

alter table "public"."document_summaries" validate constraint "document_summaries_type_check";

alter table "public"."document_topics" add constraint "document_topics_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE not valid;

alter table "public"."document_topics" validate constraint "document_topics_document_id_fkey";

alter table "public"."document_topics" add constraint "document_topics_section_id_fkey" FOREIGN KEY (section_id) REFERENCES public.document_sections(id) ON DELETE CASCADE not valid;

alter table "public"."document_topics" validate constraint "document_topics_section_id_fkey";

alter table "public"."documents" add constraint "documents_file_size_bytes_check" CHECK (((file_size_bytes > 0) AND (file_size_bytes <= 10485760))) not valid;

alter table "public"."documents" validate constraint "documents_file_size_bytes_check";

alter table "public"."documents" add constraint "documents_flashcard_status_check" CHECK (((flashcard_status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."documents" validate constraint "documents_flashcard_status_check";

alter table "public"."documents" add constraint "documents_status_check" CHECK (((status)::text = ANY ((ARRAY['uploaded'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."documents" validate constraint "documents_status_check";

alter table "public"."documents" add constraint "documents_summary_status_check" CHECK (((summary_status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."documents" validate constraint "documents_summary_status_check";

alter table "public"."documents" add constraint "documents_topic_status_check" CHECK (((topic_status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."documents" validate constraint "documents_topic_status_check";

alter table "public"."documents" add constraint "documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_user_id_fkey";

alter table "public"."flashcards" add constraint "flashcards_created_by_check" CHECK (((created_by)::text = ANY ((ARRAY['ai'::character varying, 'user'::character varying])::text[]))) not valid;

alter table "public"."flashcards" validate constraint "flashcards_created_by_check";

alter table "public"."flashcards" add constraint "flashcards_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE not valid;

alter table "public"."flashcards" validate constraint "flashcards_document_id_fkey";

alter table "public"."flashcards" add constraint "flashcards_section_id_fkey" FOREIGN KEY (section_id) REFERENCES public.document_sections(id) ON DELETE CASCADE not valid;

alter table "public"."flashcards" validate constraint "flashcards_section_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

grant delete on table "public"."activity_logs" to "anon";

grant insert on table "public"."activity_logs" to "anon";

grant references on table "public"."activity_logs" to "anon";

grant select on table "public"."activity_logs" to "anon";

grant trigger on table "public"."activity_logs" to "anon";

grant truncate on table "public"."activity_logs" to "anon";

grant update on table "public"."activity_logs" to "anon";

grant delete on table "public"."activity_logs" to "authenticated";

grant insert on table "public"."activity_logs" to "authenticated";

grant references on table "public"."activity_logs" to "authenticated";

grant select on table "public"."activity_logs" to "authenticated";

grant trigger on table "public"."activity_logs" to "authenticated";

grant truncate on table "public"."activity_logs" to "authenticated";

grant update on table "public"."activity_logs" to "authenticated";

grant delete on table "public"."activity_logs" to "service_role";

grant insert on table "public"."activity_logs" to "service_role";

grant references on table "public"."activity_logs" to "service_role";

grant select on table "public"."activity_logs" to "service_role";

grant trigger on table "public"."activity_logs" to "service_role";

grant truncate on table "public"."activity_logs" to "service_role";

grant update on table "public"."activity_logs" to "service_role";

grant delete on table "public"."bookmarks" to "anon";

grant insert on table "public"."bookmarks" to "anon";

grant references on table "public"."bookmarks" to "anon";

grant select on table "public"."bookmarks" to "anon";

grant trigger on table "public"."bookmarks" to "anon";

grant truncate on table "public"."bookmarks" to "anon";

grant update on table "public"."bookmarks" to "anon";

grant delete on table "public"."bookmarks" to "authenticated";

grant insert on table "public"."bookmarks" to "authenticated";

grant references on table "public"."bookmarks" to "authenticated";

grant select on table "public"."bookmarks" to "authenticated";

grant trigger on table "public"."bookmarks" to "authenticated";

grant truncate on table "public"."bookmarks" to "authenticated";

grant update on table "public"."bookmarks" to "authenticated";

grant delete on table "public"."bookmarks" to "service_role";

grant insert on table "public"."bookmarks" to "service_role";

grant references on table "public"."bookmarks" to "service_role";

grant select on table "public"."bookmarks" to "service_role";

grant trigger on table "public"."bookmarks" to "service_role";

grant truncate on table "public"."bookmarks" to "service_role";

grant update on table "public"."bookmarks" to "service_role";

grant delete on table "public"."chat_messages" to "anon";

grant insert on table "public"."chat_messages" to "anon";

grant references on table "public"."chat_messages" to "anon";

grant select on table "public"."chat_messages" to "anon";

grant trigger on table "public"."chat_messages" to "anon";

grant truncate on table "public"."chat_messages" to "anon";

grant update on table "public"."chat_messages" to "anon";

grant delete on table "public"."chat_messages" to "authenticated";

grant insert on table "public"."chat_messages" to "authenticated";

grant references on table "public"."chat_messages" to "authenticated";

grant select on table "public"."chat_messages" to "authenticated";

grant trigger on table "public"."chat_messages" to "authenticated";

grant truncate on table "public"."chat_messages" to "authenticated";

grant update on table "public"."chat_messages" to "authenticated";

grant delete on table "public"."chat_messages" to "service_role";

grant insert on table "public"."chat_messages" to "service_role";

grant references on table "public"."chat_messages" to "service_role";

grant select on table "public"."chat_messages" to "service_role";

grant trigger on table "public"."chat_messages" to "service_role";

grant truncate on table "public"."chat_messages" to "service_role";

grant update on table "public"."chat_messages" to "service_role";

grant delete on table "public"."chat_sessions" to "anon";

grant insert on table "public"."chat_sessions" to "anon";

grant references on table "public"."chat_sessions" to "anon";

grant select on table "public"."chat_sessions" to "anon";

grant trigger on table "public"."chat_sessions" to "anon";

grant truncate on table "public"."chat_sessions" to "anon";

grant update on table "public"."chat_sessions" to "anon";

grant delete on table "public"."chat_sessions" to "authenticated";

grant insert on table "public"."chat_sessions" to "authenticated";

grant references on table "public"."chat_sessions" to "authenticated";

grant select on table "public"."chat_sessions" to "authenticated";

grant trigger on table "public"."chat_sessions" to "authenticated";

grant truncate on table "public"."chat_sessions" to "authenticated";

grant update on table "public"."chat_sessions" to "authenticated";

grant delete on table "public"."chat_sessions" to "service_role";

grant insert on table "public"."chat_sessions" to "service_role";

grant references on table "public"."chat_sessions" to "service_role";

grant select on table "public"."chat_sessions" to "service_role";

grant trigger on table "public"."chat_sessions" to "service_role";

grant truncate on table "public"."chat_sessions" to "service_role";

grant update on table "public"."chat_sessions" to "service_role";

grant delete on table "public"."document_sections" to "anon";

grant insert on table "public"."document_sections" to "anon";

grant references on table "public"."document_sections" to "anon";

grant select on table "public"."document_sections" to "anon";

grant trigger on table "public"."document_sections" to "anon";

grant truncate on table "public"."document_sections" to "anon";

grant update on table "public"."document_sections" to "anon";

grant delete on table "public"."document_sections" to "authenticated";

grant insert on table "public"."document_sections" to "authenticated";

grant references on table "public"."document_sections" to "authenticated";

grant select on table "public"."document_sections" to "authenticated";

grant trigger on table "public"."document_sections" to "authenticated";

grant truncate on table "public"."document_sections" to "authenticated";

grant update on table "public"."document_sections" to "authenticated";

grant delete on table "public"."document_sections" to "service_role";

grant insert on table "public"."document_sections" to "service_role";

grant references on table "public"."document_sections" to "service_role";

grant select on table "public"."document_sections" to "service_role";

grant trigger on table "public"."document_sections" to "service_role";

grant truncate on table "public"."document_sections" to "service_role";

grant update on table "public"."document_sections" to "service_role";

grant delete on table "public"."document_summaries" to "anon";

grant insert on table "public"."document_summaries" to "anon";

grant references on table "public"."document_summaries" to "anon";

grant select on table "public"."document_summaries" to "anon";

grant trigger on table "public"."document_summaries" to "anon";

grant truncate on table "public"."document_summaries" to "anon";

grant update on table "public"."document_summaries" to "anon";

grant delete on table "public"."document_summaries" to "authenticated";

grant insert on table "public"."document_summaries" to "authenticated";

grant references on table "public"."document_summaries" to "authenticated";

grant select on table "public"."document_summaries" to "authenticated";

grant trigger on table "public"."document_summaries" to "authenticated";

grant truncate on table "public"."document_summaries" to "authenticated";

grant update on table "public"."document_summaries" to "authenticated";

grant delete on table "public"."document_summaries" to "service_role";

grant insert on table "public"."document_summaries" to "service_role";

grant references on table "public"."document_summaries" to "service_role";

grant select on table "public"."document_summaries" to "service_role";

grant trigger on table "public"."document_summaries" to "service_role";

grant truncate on table "public"."document_summaries" to "service_role";

grant update on table "public"."document_summaries" to "service_role";

grant delete on table "public"."document_topics" to "anon";

grant insert on table "public"."document_topics" to "anon";

grant references on table "public"."document_topics" to "anon";

grant select on table "public"."document_topics" to "anon";

grant trigger on table "public"."document_topics" to "anon";

grant truncate on table "public"."document_topics" to "anon";

grant update on table "public"."document_topics" to "anon";

grant delete on table "public"."document_topics" to "authenticated";

grant insert on table "public"."document_topics" to "authenticated";

grant references on table "public"."document_topics" to "authenticated";

grant select on table "public"."document_topics" to "authenticated";

grant trigger on table "public"."document_topics" to "authenticated";

grant truncate on table "public"."document_topics" to "authenticated";

grant update on table "public"."document_topics" to "authenticated";

grant delete on table "public"."document_topics" to "service_role";

grant insert on table "public"."document_topics" to "service_role";

grant references on table "public"."document_topics" to "service_role";

grant select on table "public"."document_topics" to "service_role";

grant trigger on table "public"."document_topics" to "service_role";

grant truncate on table "public"."document_topics" to "service_role";

grant update on table "public"."document_topics" to "service_role";

grant delete on table "public"."documents" to "anon";

grant insert on table "public"."documents" to "anon";

grant references on table "public"."documents" to "anon";

grant select on table "public"."documents" to "anon";

grant trigger on table "public"."documents" to "anon";

grant truncate on table "public"."documents" to "anon";

grant update on table "public"."documents" to "anon";

grant delete on table "public"."documents" to "authenticated";

grant insert on table "public"."documents" to "authenticated";

grant references on table "public"."documents" to "authenticated";

grant select on table "public"."documents" to "authenticated";

grant trigger on table "public"."documents" to "authenticated";

grant truncate on table "public"."documents" to "authenticated";

grant update on table "public"."documents" to "authenticated";

grant delete on table "public"."documents" to "service_role";

grant insert on table "public"."documents" to "service_role";

grant references on table "public"."documents" to "service_role";

grant select on table "public"."documents" to "service_role";

grant trigger on table "public"."documents" to "service_role";

grant truncate on table "public"."documents" to "service_role";

grant update on table "public"."documents" to "service_role";

grant delete on table "public"."flashcards" to "anon";

grant insert on table "public"."flashcards" to "anon";

grant references on table "public"."flashcards" to "anon";

grant select on table "public"."flashcards" to "anon";

grant trigger on table "public"."flashcards" to "anon";

grant truncate on table "public"."flashcards" to "anon";

grant update on table "public"."flashcards" to "anon";

grant delete on table "public"."flashcards" to "authenticated";

grant insert on table "public"."flashcards" to "authenticated";

grant references on table "public"."flashcards" to "authenticated";

grant select on table "public"."flashcards" to "authenticated";

grant trigger on table "public"."flashcards" to "authenticated";

grant truncate on table "public"."flashcards" to "authenticated";

grant update on table "public"."flashcards" to "authenticated";

grant delete on table "public"."flashcards" to "service_role";

grant insert on table "public"."flashcards" to "service_role";

grant references on table "public"."flashcards" to "service_role";

grant select on table "public"."flashcards" to "service_role";

grant trigger on table "public"."flashcards" to "service_role";

grant truncate on table "public"."flashcards" to "service_role";

grant update on table "public"."flashcards" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


