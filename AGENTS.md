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
- Keep the managed auth gate intact; share short-lived account and staff-query caches, invalidate changed collections after writes, and clear private caches on sign-out to avoid redundant requests without changing database authorization.
- Start homepage secondary reads in parallel and render them behind Suspense so the opening content does not wait for lower-page data.
