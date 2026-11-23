
const catalog = {
  github: {
    name: "GitHub",
    icon: "⌘",
    url: u => `https://github.com/${encodeURIComponent(u)}`
  },
  reddit: {
    name: "Reddit",
    icon: "●",
    url: u => `https://www.reddit.com/user/${encodeURIComponent(u)}/`
  },
  instagram: {
    name: "Instagram",
    icon: "◎",
    url: u => `https://www.instagram.com/${encodeURIComponent(u)}/`
  },
  tiktok: {
    name: "TikTok",
    icon: "♪",
    url: u => `https://www.tiktok.com/@${encodeURIComponent(u)}`
  },
  facebook: {
    name: "Facebook",
    icon: "f",
    url: u => `https://www.facebook.com/${encodeURIComponent(u)}`
  },
  youtube: {
    name: "YouTube",
    icon: "▶",
    url: u => `https://www.youtube.com/@${encodeURIComponent(u)}`
  },
  x: {
    name: "X / Twitter",
    icon: "𝕏",
    url: u => `https://x.com/${encodeURIComponent(u)}`
  }
};

const grid = document.getElementById("platforms");
const gate = document.getElementById("joinGate");
const confirmBox = document.getElementById("confirmJoin");
const continueBtn = document.getElementById("continueBtn");

const selected = () =>
  [...grid.querySelectorAll("input:checked")];

function updateSelection() {
  grid.querySelectorAll(".platform").forEach(el => {
    el.classList.toggle(
      "selected",
      el.querySelector("input").checked
    );
  });

  document.getElementById("count").textContent =
    `${selected().length} SELECTED`;
}

grid.addEventListener("change", updateSelection);

updateSelection();

// WELCOME POPUP FIX
function closeWelcomeGate() {
  if (!confirmBox.checked) {
    alert("Please confirm before entering.");
    return;
  }

  try {
    sessionStorage.setItem(
      "zamin_userfinder_gate",
      "confirmed"
    );
  } catch (error) {
    console.warn("Session storage unavailable:", error);
  }

  gate.hidden = true;
  gate.style.display = "none";
  gate.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "auto";
  document.documentElement.style.overflow = "auto";
}

confirmBox.addEventListener("change", () => {
  continueBtn.disabled = !confirmBox.checked;
});

continueBtn.addEventListener("click", closeWelcomeGate);

// CHECK PREVIOUS CONFIRMATION
let alreadyConfirmed = false;

try {
  alreadyConfirmed =
    sessionStorage.getItem("zamin_userfinder_gate") === "confirmed";
} catch (error) {
  alreadyConfirmed = false;
}

if (alreadyConfirmed) {
  gate.hidden = true;
  gate.style.display = "none";
  gate.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
} else {
  gate.hidden = false;
  gate.style.display = "grid";
  gate.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

document.getElementById("year").textContent =
  new Date().getFullYear();

let reportText = "";

// USERNAME SCANNER
document.getElementById("scanForm").addEventListener(
  "submit",
  async e => {
    e.preventDefault();

    const username = document
      .getElementById("username")
      .value.trim()
      .replace(/^@/, "");

    if (!/^[a-zA-Z0-9._-]{1,30}$/.test(username)) {
      alert("Use 1–30 letters, numbers, dots, underscores or hyphens.");
      return;
    }

    const keys = selected().map(x => x.value);

    if (!keys.length) {
      alert("Select at least one platform.");
      return;
    }

    const btn = document.getElementById("scanBtn");
    btn.disabled = true;
    btn.textContent = "SCANNING...";

    const list = document.getElementById("resultList");
    list.innerHTML = "";

    document.getElementById("forUser").textContent =
      "@" + username;

    document.getElementById("results").hidden = false;
    document.getElementById("summary").innerHTML = "";

    try {
      const rows = await Promise.all(
        keys.map(async key => {
          const p = catalog[key];
          const profile = p.url(username);

          let status = "unknown";
          let label = "UNKNOWN";
          let detail =
            "Automated verification is not reliably available.";

          if (key === "github" || key === "reddit") {
            try {
              const res = await fetch(
                `/api/check?platform=${encodeURIComponent(key)}&username=${encodeURIComponent(username)}`
              );

              const data = await res.json();

              if (data.status === "found") {
                status = "found";
                label = "FOUND";
                detail =
                  "Public profile endpoint returned a matching account.";
              } else if (data.status === "not_found") {
                status = "notfound";
                label = "NOT FOUND";
                detail =
                  "Public profile endpoint reported no matching account.";
              } else {
                detail =
                  data.message ||
                  "The platform did not allow a reliable check.";
              }
            } catch {
              detail =
                "Verification service unavailable. Try again later.";
            }
          } else {
            detail =
              "Platform restricts reliable unauthenticated verification; open profile to check manually.";
          }

          return {
            key,
            p,
            profile,
            status,
            label,
            detail
          };
        })
      );

      rows.forEach(r => {
        const row = document.createElement("div");
        row.className = "result-row";

        const name = document.createElement("div");
        name.className = "result-name";

        const icon = document.createElement("span");
        icon.className = "result-icon";
        icon.textContent = r.p.icon;

        const title = document.createElement("span");
        title.textContent = r.p.name;

        name.append(icon, title);

        const status = document.createElement("span");
        status.className = `status ${r.status}`;
        status.textContent = r.label;

        const link = document.createElement("a");
        link.className = "open-profile";
        link.href = r.profile;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open profile ↗";

        row.append(name, status, link);
        row.title = r.detail;

        list.append(row);
      });

      const counts = {
        found: rows.filter(x => x.status === "found").length,
        notfound: rows.filter(x => x.status === "notfound").length,
        unknown: rows.filter(x => x.status === "unknown").length
      };

      document.getElementById("summary").innerHTML =
        `<span>✓ ${counts.found} Found</span>
         <span>× ${counts.notfound} Not Found</span>
         <span>? ${counts.unknown} Unknown</span>`;

      reportText = [
        `ZAMIN UserFinder V2 — @${username}`,
        "",
        ...rows.map(
          r => `${r.p.name}: ${r.label} — ${r.profile} (${r.detail})`
        )
      ].join("\n");

      document.getElementById("results").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    } catch (error) {
      console.error(error);
      alert("Scanner error. Please try again.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'SCAN NOW <b>↗</b>';
    }
  }
);

// COPY REPORT
document.getElementById("copyBtn").addEventListener(
  "click",
  async () => {
    if (!reportText) return;

    try {
      await navigator.clipboard.writeText(reportText);
      document.getElementById("copyBtn").textContent =
        "Copied ✓";
    } catch {
      alert("Copy is unavailable in this browser.");
    }
  }
);
