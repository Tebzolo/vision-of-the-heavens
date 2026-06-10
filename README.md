# The Vision of the Heavens

A golden throne-room reading experience for the whole Bible, with the Books of
Enoch and Jubilees. Installable on phones as a Progressive Web App (PWA).

**Engineered by Tebogo Maruping.**

## What's in this repo

| File | Purpose |
|------|---------|
| `index.html` | The entire app (HTML, CSS, JS in one file). |
| `manifest.webmanifest` | PWA metadata so it installs to the home screen. |
| `sw.js` | Service worker — caches the app shell for offline launch. |
| `icon-192.png`, `icon-512.png`, `icon-180.png` | App icons. |

> `gospel-preacher.html` is the same app under its old name; `index.html` is the
> copy GitHub Pages serves by default. You can delete `gospel-preacher.html`.

## Host it on GitHub Pages (free)

1. Create a new repository on GitHub (e.g. `vision-of-the-heavens`).
2. Upload **all** the files above into the repository root (not in a subfolder).
   - On github.com: **Add file → Upload files**, drag them in, **Commit**.
3. Go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set **Branch** to `main` and folder to `/ (root)`, then **Save**.
6. Wait ~1 minute. Your app will be live at:
   `https://<your-username>.github.io/<repo-name>/`

A PWA requires HTTPS — GitHub Pages provides that automatically, so the
"Add to Home Screen" / install option will work.

## Install it as an app on a phone

- **Android (Chrome):** open the GitHub Pages link, tap the **⋮** menu →
  **Add to Home screen** / **Install app**.
- **iPhone (Safari):** open the link, tap **Share** → **Add to Home Screen**.

Once installed it launches fullscreen with its own icon, no browser bar.

## Offline use

- The **app itself** is cached by the service worker, so it opens with no
  connection.
- **Enoch and Jubilees** are bundled in and always work offline.
- The **Bible text** is fetched from public-domain sources on first view and
  cached in the browser. Use the in-app **"Download for offline use"** button to
  pre-fetch the whole Bible, or **"Load Bible from file"** to load a complete
  World English Bible JSON (e.g. from `https://api.getbible.net/v2/web.json`).

## Notes

- Text: World English Bible (Public Domain). Enoch & Jubilees: R.H. Charles,
  1913 (Public Domain).
- If you rename the repo, the app still works — all paths are relative.
- To replace the icons with your own, keep the same filenames and sizes.
