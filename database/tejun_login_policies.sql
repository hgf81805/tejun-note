alter policy tejun_owner_select on public.tejun_documents using ((select auth.uid()) = owner_id and (select (auth.jwt()->>'is_anonymous')::boolean) is false);
alter policy tejun_owner_insert on public.tejun_documents with check ((select auth.uid()) = owner_id and (select (auth.jwt()->>'is_anonymous')::boolean) is false);
alter policy tejun_owner_update on public.tejun_documents using ((select auth.uid()) = owner_id and (select (auth.jwt()->>'is_anonymous')::boolean) is false) with check ((select auth.uid()) = owner_id and (select (auth.jwt()->>'is_anonymous')::boolean) is false);
alter policy tejun_owner_delete on public.tejun_documents using ((select auth.uid()) = owner_id and (select (auth.jwt()->>'is_anonymous')::boolean) is false);
