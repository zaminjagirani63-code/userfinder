// Vercel serverless endpoint. Only public, unauthenticated account endpoints are queried.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ status: "unknown", message: "Method not allowed." });
  const platform = String(req.query.platform || "");
  const username = String(req.query.username || "").trim();
  if (!/^[a-zA-Z0-9._-]{1,30}$/.test(username)) {
    return res.status(400).json({ status: "unknown", message: "Invalid username." });
  }
  try {
    if (platform === "github") {
      const r = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { "Accept": "application/vnd.github+json", "User-Agent": "ZAMIN-UserFinder/2.0" }
      });
      if (r.status === 200) return res.status(200).json({ status: "found" });
      if (r.status === 404) return res.status(200).json({ status: "not_found" });
      return res.status(200).json({ status: "unknown", message: `GitHub returned HTTP ${r.status}; check could not be confirmed.` });
    }
    if (platform === "reddit") {
      const r = await fetch(`https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`, {
        headers: { "Accept": "application/json", "User-Agent": "web:ZAMINUserFinder:v2.0 (public username lookup)" }
      });
      if (r.status === 200) {
        const data = await r.json();
        if (data && data.data && data.data.name) return res.status(200).json({ status: "found" });
        return res.status(200).json({ status: "unknown", message: "Reddit response did not confirm a username." });
      }
      if (r.status === 404) return res.status(200).json({ status: "not_found" });
      return res.status(200).json({ status: "unknown", message: `Reddit returned HTTP ${r.status}; check could not be confirmed.` });
    }
    return res.status(200).json({ status: "unknown", message: "Automated verification is not implemented for this platform." });
  } catch {
    return res.status(200).json({ status: "unknown", message: "Network or platform verification error." });
  }
}
