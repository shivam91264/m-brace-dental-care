import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { accountQuery } from '@/lib/account';

// Reuses the verified account read (cleared on sign-out, refreshed on auth
// changes) so each staff click does not wait on a fresh sign-in round trip.
export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const a = await context.queryClient.fetchQuery(accountQuery);
    if (!a) throw redirect({ to: '/auth' });
  },
  component: Outlet,
});
