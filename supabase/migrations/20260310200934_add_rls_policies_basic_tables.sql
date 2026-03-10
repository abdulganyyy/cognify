-- =========================
-- PROFILES
-- =========================

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);


-- =========================
-- DOCUMENTS
-- =========================

create policy "documents_select_own"
on public.documents
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "documents_insert_own"
on public.documents
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "documents_update_own"
on public.documents
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "documents_delete_own"
on public.documents
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- =========================
-- CHAT SESSIONS
-- =========================

create policy "chat_sessions_select_own"
on public.chat_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "chat_sessions_insert_own"
on public.chat_sessions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "chat_sessions_update_own"
on public.chat_sessions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "chat_sessions_delete_own"
on public.chat_sessions
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- =========================
-- BOOKMARKS
-- =========================

create policy "bookmarks_select_own"
on public.bookmarks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "bookmarks_insert_own"
on public.bookmarks
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "bookmarks_update_own"
on public.bookmarks
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "bookmarks_delete_own"
on public.bookmarks
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- =========================
-- ACTIVITY LOGS
-- =========================

create policy "activity_logs_select_own"
on public.activity_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "activity_logs_insert_own"
on public.activity_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "activity_logs_update_own"
on public.activity_logs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "activity_logs_delete_own"
on public.activity_logs
for delete
to authenticated
using ((select auth.uid()) = user_id);