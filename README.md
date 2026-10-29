# Chirag Lakhera: site + workspace

Plain HTML/CSS/JS, no build step. Follow `DEPLOY.md` for GitHub + Netlify + Supabase.

- `index.html`: homepage (loading screen, script name, 3D tunnel of frosted glass and chrome).
- `portfolio.html`: public portfolio; `pinboard.html`: public pinboard canvas. Both are edited from the Workspace by the owner only.
- `workspace.html`: contacts, files (with Pin and Bin), links, notes, settings; owner tabs: Portfolio, Pinboard, Site text, Users.
- `logo-maker.html`: open once in a browser to download your logo and app icons.
- `supabase.sql`: run once in Supabase. `config.js`: your Supabase URL and anon key.

`theme.js` applies the accent/background colours chosen in the Workspace on every page. `audio.js` plays the music and sound effects. `board.js` is the shared pinboard canvas.
