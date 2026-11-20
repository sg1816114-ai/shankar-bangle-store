# Shankar Bangle Store — GitHub + Netlify Website

This folder contains the website files needed for the current Shankar Bangle Store catalog, including the Netlify backend used by Owner Mode to publish shared changes.

## Files and folders

- `index.html` — latest bilingual website page.
- `netlify.toml` — tells Netlify where the website and server function are located.
- `package.json` — installs the Netlify Blobs dependency.
- `netlify/functions/site-data.mjs` — handles Owner Login and shared live catalog/settings storage.
- `.gitignore` — excludes local development files and secrets.

## Upload to GitHub

1. Extract this ZIP file.
2. Open your GitHub repository: `Shankar-Bangle-Store`.
3. Upload **all files and folders inside** this extracted folder to the repository's main/root level. Do not upload only `index.html`.
4. Keep the folder structure exactly as shown, especially `netlify/functions/site-data.mjs`.
5. Commit the changes to the `main` branch.
6. Netlify should start a new deploy from the connected GitHub repository.

The repository root should look like this:

```text
Shankar-Bangle-Store/
├── index.html
├── netlify.toml
├── package.json
├── README.md
├── .gitignore
└── netlify/
    └── functions/
        └── site-data.mjs
```

## One-time Netlify settings

In Netlify, open your site's **Site configuration / Site settings → Environment variables** and add:

- `OWNER_PIN` — your private Owner Mode login PIN/password.
- `OWNER_SESSION_SECRET` — a long, random secret string (recommended).

Keep these values private. Do not put them in `index.html`, GitHub files, screenshots, or public messages. Then trigger a fresh deploy so the function receives the variables.

Build settings in `netlify.toml` are already set:

- Publish directory: `.`
- Functions directory: `netlify/functions`
- Node.js: `20`

No separate frontend build command is needed.

## Test after deployment

1. Open the live website.
2. Choose **Owner Login** and enter the `OWNER_PIN` you configured in Netlify.
3. Add or update one test design and save it.
4. Open the website in another browser or phone and confirm that the published change appears there too.

Product images are loaded from hosted ImageKit URLs entered through Owner Mode. They do not need to be added to this GitHub ZIP. The page also loads its fonts and visual libraries from their existing CDN links.

## हिंदी में ज़रूरी निर्देश

1. ZIP को extract करें।
2. Extract किए गए folder के **सभी files और folders** अपने GitHub repository `Shankar-Bangle-Store` के मुख्य स्तर पर upload करें। केवल `index.html` upload न करें।
3. `netlify/functions/site-data.mjs` का folder path बिल्कुल ऐसा ही रखें।
4. GitHub में `main` branch पर commit करें।
5. Netlify में Site configuration → Environment variables खोलें और `OWNER_PIN` तथा `OWNER_SESSION_SECRET` सेट करें। इन दोनों को private रखें।
6. इसके बाद Netlify में नया deploy चलाएँ।
7. Website पर Owner Login करके एक design जोड़कर जाँचें कि वह दूसरे phone/browser पर भी दिख रहा है।

**ध्यान दें:** रोज़ product जोड़ने या stock बदलने के लिए GitHub में HTML बदलने की ज़रूरत नहीं है। Owner Mode से सफलतापूर्वक Save करने पर बदलाव सभी visitors के लिए publish होते हैं। Website के layout/design/code में बदलाव करने पर GitHub update और नया Netlify deploy करना होगा।
