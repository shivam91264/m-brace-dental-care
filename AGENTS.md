<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep all appearance roles, including primary hover, card and alternate-section backgrounds, in the shared editable palette and CSS tokens so saved themes consistently control public and staff pages.
- Public testimonial display and submission share the homepage section; the legacy testimonials URL redirects there to preserve existing links.
- The sign-in gate, staff guard and shell share one verified account query (session id for parallel profile/role reads, verified by getUser); staff lists prefetch on link intent, invalidate changed collections after writes, and private caches clear on sign-out. Database RLS stays the real authorization.
- Start homepage secondary reads in parallel and render them behind Suspense so the opening content does not wait for lower-page data.
