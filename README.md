# ZAMIN UserFinder V2

Premium neon/glassmorphism public username lookup site, prepared for GitHub + Vercel.

## Deploy
1. Extract the ZIP.
2. Upload all files and the `api` folder to the root of a GitHub repository.
3. Import that repository into Vercel.
4. Framework preset: **Other**. No build command is required.
5. Deploy. The `/api/check` serverless function is deployed automatically.

## What is genuinely verified?
- **GitHub:** uses the official unauthenticated public user API. HTTP 200 = Found; HTTP 404 = Not Found; other responses = Unknown.
- **Reddit:** uses its public `.json` profile endpoint. HTTP 200 with a username = Found; HTTP 404 = Not Found; blocked/rate-limited/other responses = Unknown.
- **Instagram, TikTok, Facebook, YouTube, X:** shown as Unknown because reliable automated account-existence verification without approved platform APIs/authentication is not generally available. The tool provides a direct profile link for manual review.

No false positive or fabricated status is intentionally shown. A platform can change or restrict its public endpoints, so even supported checks can return Unknown.

## Channel welcome popup
The site opens with a Telegram + YouTube welcome gate. Visitors can open both channel links and tick the confirmation checkbox. This is **not** automatic membership/subscription verification. YouTube subscription status cannot reliably be checked for arbitrary visitors. Telegram membership verification requires a Telegram bot added as an administrator to the channel and a secure backend integration. Do not put bot tokens in browser JavaScript.

## Project details
- Developer: ZAMIN JAGIRANI
- Support: zaminjagirani63@gmail.com
- Telegram: https://t.me/KINGPROFESSORBACK
- YouTube: https://www.youtube.com/@PROXZAMIN-z9l

Static frontend: `index.html`, `style.css`, `script.js`
Backend: `api/check.js`
Vercel config: `vercel.json`
