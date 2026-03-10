-- =========================
-- DOCUMENT SECTIONS
-- =========================

create policy "document_sections_select_by_document_owner"
on public.document_sections
for select
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_sections.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_sections_insert_by_document_owner"
on public.document_sections
for insert
to authenticated
with check (
  exists (
    select 1
    from public.documents d
    where d.id = document_sections.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_sections_update_by_document_owner"
on public.document_sections
for update
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_sections.document_id
      and d.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.documents d
    where d.id = document_sections.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_sections_delete_by_document_owner"
on public.document_sections
for delete
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_sections.document_id
      and d.user_id = (select auth.uid())
  )
);

-- =========================
-- DOCUMENT SUMMARIES
-- =========================

create policy "document_summaries_select_by_document_owner"
on public.document_summaries
for select
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_summaries.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_summaries_insert_by_document_owner"
on public.document_summaries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.documents d
    where d.id = document_summaries.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_summaries_update_by_document_owner"
on public.document_summaries
for update
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_summaries.document_id
      and d.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.documents d
    where d.id = document_summaries.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_summaries_delete_by_document_owner"
on public.document_summaries
for delete
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_summaries.document_id
      and d.user_id = (select auth.uid())
  )
);

-- =========================
-- DOCUMENT TOPICS
-- =========================

create policy "document_topics_select_by_document_owner"
on public.document_topics
for select
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_topics.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_topics_insert_by_document_owner"
on public.document_topics
for insert
to authenticated
with check (
  exists (
    select 1
    from public.documents d
    where d.id = document_topics.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_topics_update_by_document_owner"
on public.document_topics
for update
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_topics.document_id
      and d.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.documents d
    where d.id = document_topics.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "document_topics_delete_by_document_owner"
on public.document_topics
for delete
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = document_topics.document_id
      and d.user_id = (select auth.uid())
  )
);

-- =========================
-- FLASHCARDS
-- =========================

create policy "flashcards_select_by_document_owner"
on public.flashcards
for select
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = flashcards.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "flashcards_insert_by_document_owner"
on public.flashcards
for insert
to authenticated
with check (
  exists (
    select 1
    from public.documents d
    where d.id = flashcards.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "flashcards_update_by_document_owner"
on public.flashcards
for update
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = flashcards.document_id
      and d.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.documents d
    where d.id = flashcards.document_id
      and d.user_id = (select auth.uid())
  )
);

create policy "flashcards_delete_by_document_owner"
on public.flashcards
for delete
to authenticated
using (
  exists (
    select 1
    from public.documents d
    where d.id = flashcards.document_id
      and d.user_id = (select auth.uid())
  )
);

-- =========================
-- CHAT MESSAGES
-- =========================

create policy "chat_messages_select_by_session_owner"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_sessions s
    where s.id = chat_messages.session_id
      and s.user_id = (select auth.uid())
  )
);

create policy "chat_messages_insert_by_session_owner"
on public.chat_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.chat_sessions s
    where s.id = chat_messages.session_id
      and s.user_id = (select auth.uid())
  )
);

create policy "chat_messages_update_by_session_owner"
on public.chat_messages
for update
to authenticated
using (
  exists (
    select 1
    from public.chat_sessions s
    where s.id = chat_messages.session_id
      and s.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.chat_sessions s
    where s.id = chat_messages.session_id
      and s.user_id = (select auth.uid())
  )
);

create policy "chat_messages_delete_by_session_owner"
on public.chat_messages
for delete
to authenticated
using (
  exists (
    select 1
    from public.chat_sessions s
    where s.id = chat_messages.session_id
      and s.user_id = (select auth.uid())
  )
);