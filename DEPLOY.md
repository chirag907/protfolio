# Deploy guide: GitHub + Netlify + Supabase (about 45 minutes)

You need free accounts at github.com, netlify.com and supabase.com.

## Part 1. Prepare the files
1. Unzip `portfolio.zip`. Everything inside the `portfolio` folder goes to GitHub (you will not edit the social links in code any more; you will edit them from your Workspace, see Part 7).
2. Make your logo images (once): open `logo-maker.html` in Chrome (double-click it, or use your Netlify address + `/logo-maker.html` after deploying). Click each **Download** button. Replace the files `icon-512.png`, `icon-192.png`, `apple-touch-icon.png`, `favicon-32.png` in the folder with the downloaded ones. `logo.png` is your transparent logo file for any other use.

## Part 2. GitHub
1. github.com -> **+** -> **New repository**. Name it `portfolio`. Do not tick "Add a README". Create it.
2. Click **uploading an existing file**. Select ALL files inside the unzipped folder (not the folder itself) and drag them in. `index.html` must be at the top level. Click **Commit changes**.
3. Using an older repo? Delete its old files first (especially `app.js`, `icon.svg` and the `images` folder). A fresh repo is easier.

## Part 3. Netlify
1. app.netlify.com -> **Add new site** -> **Import an existing project** -> **GitHub**, authorise, choose the repo.
2. Leave **Build command** empty and set **Publish directory** to `.` (or blank). Click **Deploy**.
3. **Site configuration -> Change site name**, e.g. `chiraglakhera`. Your address is `https://chiraglakhera.netlify.app`. Note it.

## Part 4. Supabase
1. supabase.com -> **New project**. Save the database password, wait about 2 minutes.
2. **SQL Editor -> New query**, paste the whole of `supabase.sql`, click **Run**. It is safe to run again later.
3. **Authentication -> Sign In / Providers -> Email**: Email on, **Allow new users to sign up** ON, **Confirm email** ON.
4. **Authentication -> URL Configuration**: **Site URL** = your Netlify address. Add `https://YOURSITE.netlify.app/**` to **Redirect URLs**.
5. **Project Settings -> API Keys**: copy the **Project URL**; on **Legacy API keys** copy the **anon** key (starts `eyJ`). Never the `service_role` key.

## Part 5. Connect the site
1. GitHub -> `config.js` -> pencil icon -> paste the URL and anon key between the quotes -> **Commit changes**.
2. Wait for Netlify **Deploys** to show **Published**.

## Part 6. Make yourself the owner
1. Open `https://YOURSITE.netlify.app/workspace.html` -> **Create an account** with `chiraglakhera3@gmail.com` and a strong unique password (10+ characters, never `12345678`).
2. Click the link in the confirmation email (check spam). Supabase's built-in email only sends a few per hour; wait, or add your own SMTP under **Authentication -> SMTP**.
3. In the Supabase **SQL Editor** run only this line:
   `insert into public.site_admins (user_id) select id from auth.users where email = 'chiraglakhera3@gmail.com' on conflict do nothing;`
4. Sign out and in again in the workspace. Four extra tabs appear for you only: **Portfolio, Pinboard, Site text, Users**.

## Part 7. Fill in the site (all from the Workspace, no code)
- **Site text**: change the hero line, tunnel phrases, "I'm Chirag Lakhera..." statement, your email, and your GitHub / LinkedIn / X / Instagram links.
- **Portfolio**: headline, bio, and projects with a cover image and an optional link. Visitors see large sharp-cornered images; clicking one opens it full size, with a **Visit project** button when there is a link.
- **Pinboard**: add links and apps (YouTube, Netflix, Instagram...), a YouTube video, your own uploaded video or image, notes. Drag by the top bar, resize from the corner. You can also open any note, link or file in the workspace and press **Pin to board**. Everything on the Pinboard is PUBLIC.

## Part 8. Test
- Homepage: loading screen (the site opens on its own; sound starts after your first click or key press), scroll the tunnel, hover the frosted glass objects.
- `/portfolio.html` and `/pinboard.html` in a private window show your content.
- Workspace: add a contact (mark Emergency), a pinned note, a link, upload a file (tiles show thumbnails only; open one to see its name and details, pin it, bin it). Check **Bin** restores and deletes forever. Edit a note.
- Settings: enter another name; the top of the workspace reads "Workspace for ...". Leave it empty to get the default back.
- Create a second test account in a private window: it must not show the admin tabs and must not see your data.
- Phone: open the workspace address, browser menu -> **Add to Home Screen**.

## Part 9. Finish
- Add a link to your Netlify address on chirag.code.blog (free WordPress can't redirect).
- Optional: custom domain (Netlify -> Domain management), multi-factor authentication on Supabase and GitHub, turn sign-ups off in Supabase if you don't want other accounts.

## Passwords
This site never stores or shows anyone's password, including yours. Supabase keeps only a one-way scrambled version. The Users tab shows names, emails and dates, and can send a reset email. Don't ask people to send you passwords, and don't store passwords, bank details or ID numbers in the workspace.

## Updating later
Edit files on GitHub (pencil icon) or upload new versions; Netlify redeploys in about a minute. Workspace content, portfolio, pinboard and site text are edited in the Workspace and need no redeploy.

## Troubleshooting
- **No 3D / plain page:** turn on hardware acceleration, or try Chrome. The site falls back to a simple page without WebGL.
- **No sound:** browsers only allow audio after a click, tap or key press. Click anywhere once, or press the Sound button in the header.
- **"Not connected yet":** `config.js` is empty or not deployed. Hard refresh (Ctrl+Shift+R).
- **"Invalid API key":** use the legacy `anon` key (starts `eyJ`).
- **"Failed to fetch":** wrong Project URL, or the free project is paused (open the dashboard to restore it).
- **No admin tabs:** the account must exist first; run the owner line again, then sign out and in.
- **Pin to board / upload fails:** run the latest `supabase.sql` (it creates the public `pinboard` storage bucket).
- **Changes not showing:** wait for Netlify **Published**, then hard refresh.
