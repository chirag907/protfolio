# Deploy guide: GitHub + Netlify + Supabase (about 40 minutes)

You need free accounts at github.com, netlify.com and supabase.com.

## Part 1. Prepare the files
1. Unzip `portfolio.zip`. You get a folder `portfolio` containing `index.html`, `portfolio.html`, `workspace.html`, `style.css`, `workspace.css`, `site.js`, `portfolio.js`, `workspace.js`, `config.js`, `supabase.sql`, `icon.svg`, `manifest.webmanifest`.
2. Open `index.html` in a text editor. Near the bottom, replace `your-username` in the GitHub, LinkedIn, X and Instagram links with your own handles (delete a link if you don't use it).

## Part 2. GitHub
1. github.com -> **+** -> **New repository**. Name it `portfolio`. Do not tick "Add a README". Create it.
2. Click **uploading an existing file**. Open the unzipped folder, select ALL the files inside it (not the folder itself) and drag them into the page. `index.html` must be at the top level of the repo.
3. Click **Commit changes**.
4. Using an older repo? Delete its old files first (open a file -> trash icon), especially `app.js`, the `images` folder and any old `style.css`. A fresh repo is easier.

## Part 3. Netlify
1. app.netlify.com -> **Add new site** -> **Import an existing project** -> **GitHub**, authorise, pick the repo.
2. Leave **Build command** empty and set **Publish directory** to `.` (or leave it blank). Click **Deploy**.
3. After about a minute you get `https://something.netlify.app`. Open it: the loader and the 3D hero should appear.
4. **Site configuration -> Change site name**, e.g. `chiraglakhera`. Your URL is now `https://chiraglakhera.netlify.app`. Note it.

## Part 4. Supabase
1. supabase.com -> **New project**. Choose a name, save the database password, pick the nearest region, wait about 2 minutes.
2. **SQL Editor -> New query**. Paste the whole of `supabase.sql` and click **Run**. "Success" is the expected result. (The last line, which makes you the owner, does nothing yet because your account doesn't exist.)
3. **Authentication -> Sign In / Providers -> Email**: Email enabled, **Allow new users to sign up** ON, **Confirm email** ON.
4. **Authentication -> URL Configuration**: set **Site URL** to your Netlify URL. Under **Redirect URLs** add `https://YOURSITE.netlify.app/**`.
5. **Project Settings -> API Keys**: copy the **Project URL**. Open the **Legacy API keys** tab and copy the **anon** key (a long string starting `eyJ`). Never use the `service_role` key.

## Part 5. Connect the site to Supabase
1. In your GitHub repo open `config.js`, click the pencil icon, paste the URL and the anon key between the quotes, and **Commit changes**.
2. Netlify redeploys automatically. Wait until **Deploys** shows **Published**.

## Part 6. Create your owner account
1. Open `https://YOURSITE.netlify.app/workspace.html`, choose **Create an account**, use `chiraglakhera3@gmail.com` and a strong, unique password of 10+ characters.
2. Open the confirmation email and click the link (check spam). Supabase's built-in email sends only a few messages per hour. If nothing arrives, wait, or set up your own SMTP under **Authentication -> SMTP**.
3. Back in the Supabase **SQL Editor** run only this line:
   `insert into public.site_admins (user_id) select id from auth.users where email = 'chiraglakhera3@gmail.com' on conflict do nothing;`
   Check **Table Editor -> site_admins** shows one row.
4. Sign out of the workspace and sign in again. A **Portfolio** tab now appears.

## Part 7. Fill in the portfolio
Workspace -> **Portfolio**: save a headline and bio, then add projects (title, link, tags, short description, cover image). Open `/portfolio.html` in a private window to see what visitors see.

## Part 8. Test everything
- Homepage: loader, script name, scroll through the glass and chrome tunnel, dark glass footer.
- `/portfolio.html` in a private window shows your content.
- Workspace: add a contact (mark it Emergency), a pinned note, a link, upload a file and open its preview. The Emergency tab should show the contact and note.
- On your phone: open the workspace URL, browser menu -> **Add to Home Screen**.
- Create a second test account in a private window. It must NOT show a Portfolio tab and must not see your data.

## Part 9. Finish
- On chirag.code.blog add a link to your Netlify URL (free WordPress can't redirect).
- Optional: custom domain (Netlify -> Domain management), multi-factor authentication on your Supabase and GitHub accounts, and turn sign-ups off in Supabase if you don't want other accounts.

## Updating later
Edit any file on GitHub (pencil icon) or upload new versions; Netlify redeploys in about a minute. Portfolio, contacts, notes, links and files are edited inside the workspace and need no redeploy.

## Troubleshooting
- **No 3D / plain page:** turn on hardware acceleration in the browser, or try Chrome. The site falls back to a simple layout when WebGL is unavailable.
- **"Not connected yet":** `config.js` is empty or not deployed. Hard refresh (Ctrl+Shift+R).
- **"Invalid API key":** use the legacy `anon` key (starts `eyJ`).
- **"Failed to fetch":** wrong Project URL, or the free Supabase project is paused (open the dashboard to restore it).
- **No Portfolio tab:** the account must exist first; run the owner line again, then sign out and in.
- **Changes not showing:** wait for Netlify **Published**, then hard refresh.
- Don't store passwords, bank details or ID numbers in the workspace.
