import { createFileRoute,redirect } from '@tanstack/react-router';
import { accountQuery } from '@/lib/account';
import { AdminShell } from '@/components/admin/AdminShell';
export const Route=createFileRoute('/_authenticated/admin')({beforeLoad:async({context})=>{const a=await context.queryClient.fetchQuery(accountQuery);if(a?.profile?.status!=='approved'||!a.roles.length)throw redirect({to:'/auth'});},component:AdminShell});
