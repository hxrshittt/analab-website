# Analab Website

Plain static website — HTML, CSS and a little JavaScript. **There is no build
step, no Node.js, no npm and no Jekyll.** GitHub Pages serves these files
exactly as they are.

## Pages
- `index.html` — Home
- `features.html` — Features
- `downloads.html` — Downloads
- `release-notes.html` — Release Notes
- `support.html` — Support

Shared files: `styles.css`, `script.js`, `releases.js`, `assets/`.

---

## 1. Put it on GitHub Pages

1. Create a repository and push every file in this folder to the `main` branch,
   keeping the folder structure (`assets/` and `.github/` included).
2. In the repository: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
   It will pick up `.github/workflows/deploy.yml`, which only uploads the files.
4. Wait for the green tick in the **Actions** tab. The address appears on the
   Settings → Pages screen.

Alternative, even simpler: set Source to **Deploy from a branch**, branch
`main`, folder `/ (root)`. The `.nojekyll` file already stops GitHub from
trying to run Jekyll. In that case `.github/workflows/deploy.yml` is unused and
can be deleted.

### If a build was failing before
A Node.js error means a workflow was trying to run `npm install` / `npm run
build` on a project that has no `package.json`. Delete any other workflow file
in `.github/workflows/` and keep only `deploy.yml`.

---

## 2. Publish a new version of the software

Do **not** commit installers to the repository — GitHub rejects files over
100 MB, and the Analab installer is far larger than that. Use Releases instead.

One-time setup: open `releases.js` and set your repository on the first line:

```js
const REPO = "your-username/your-repo";
```

Then, for every new version:

1. Repository → **Releases** → **Draft a new release**.
2. Tag: `v1.4.0`. Title: anything.
3. Drag the installer (`.exe` / `.msi`) into the attachments box.
4. Write the changelog in the description box. Plain bullets work:

   ```
   **What's New**
   - Improved reference comparison workflow.

   **Bug Fixes**
   - Minor UI corrections.
   ```
5. **Publish release.**

The Downloads page, the Release Notes page and the version badge in the header
update themselves on the next page load. No commit, no redeploy.

If `REPO` is left empty, or GitHub cannot be reached, every page keeps showing
the text written in the HTML. Nothing breaks either way.
