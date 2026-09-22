# The Sports Bar — Version 2

A deployable sports media + social platform built with Next.js and Supabase.

## Included
- Real email/password authentication
- Persistent Postgres database
- Public sports feed
- Replies, likes and reposts
- Article writer studio
- Article cover-image uploads
- Post image uploads
- Public writer profiles
- Role system: user, contributor, writer, editor, admin, owner, suspended
- Admin approval for publishing
- Per-user Feed posting permission
- Row Level Security policies
- Mobile-responsive design
- Vercel-ready Next.js structure

## 1. Create Supabase
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/migrations/001_initial.sql`.
4. Then run `supabase/migrations/002_harden_profile_permissions.sql`.
5. Copy `.env.example` to `.env.local` and add your Project URL and publishable key.

## 2. Create the owner account
1. Run the site and sign up normally with your email.
2. In Supabase SQL Editor, promote that account manually once:

```sql
update public.profiles
set role='owner', approval_status='approved', display_name='Chance Mauro'
where username='YOUR_USERNAME_HERE';
```

Only do this from the protected Supabase dashboard.

## 3. Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## 4. Deploy
Push this folder to a GitHub repository, import the repo into Vercel, and add the same two environment variables in Vercel project settings. Then deploy.

## Brand
Change the site/app name globally in `lib/brand.ts`.

Current working name: **The Sports Bar**
Tagline: **The game. The story. The conversation.**

## Production notes
Before a large public launch, add rate limiting, moderation/reporting, transactional email configuration, error monitoring, database backups, richer rich-text editing, image moderation, legal pages, and tests.


## Brand structure

- **The Sports Bar** — the overall application and media brand
- **The Bar** — the live social feed for posts, replies, likes and reposts
- **The Press Box** — long-form articles and published journalism
- Working tagline: **Where sports stories and conversation meet.**

Brand values are centralized in `lib/brand.ts` so names and copy can be changed later without restructuring the application.

## Live backend status
A Supabase production project has been created for The Sports Bar. Configure deployment with:
- NEXT_PUBLIC_SUPABASE_URL=https://xpduofpeoohrqgqnsaqs.supabase.co
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=use the publishable key from the Supabase project settings

The database includes profiles, roles, article publishing, feed posts/replies, likes, reposts, follows, and image-storage buckets with RLS enabled.
