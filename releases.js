/* ---------------------------------------------------------------------------
   Analab — automatic version listing from GitHub Releases.

   HOW TO USE
   1. Put your repository below, e.g. REPO = "harshit/analab-website".
   2. To publish a new Analab version: go to your repo -> Releases ->
      "Draft a new release", tag it v1.4.0, attach the installer file,
      write the changelog in the description box, publish.
   For AnalabSafe use a tag like safe-v1.0.0 (the "safe-" prefix routes it
   to the AnalabSafe section).
   The Downloads page, Release Notes page and the version badge in the header
   then update themselves. Nothing has to be rebuilt or re-uploaded.

   If REPO is left empty, or GitHub cannot be reached, the pages simply keep
   showing the text that is written in the HTML. Nothing breaks.
--------------------------------------------------------------------------- */

   const REPO = "hxrshittt/analab-website";
(function () {
  if (!REPO || REPO.indexOf("/") === -1) return;

  const API = "https://api.github.com/repos/" + REPO + "/releases";

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  const esc = (s) =>
    String(s || "").replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );

  const cleanVersion = (tag) => String(tag || "").replace(/^(safe-)?v/i, "");

  const fmtDate = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fmtSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb >= 1024
      ? (mb / 1024).toFixed(2) + " GB"
      : Math.round(mb) + " MB";
  };

  // Pick the installer out of a release's attached files.
  const pickAsset = (release) => {
    const assets = release.assets || [];
    if (!assets.length) return null;
    const preferred = /\.(exe|msi)$/i;
    return assets.find((a) => preferred.test(a.name)) || assets[0];
  };

  // Very small Markdown subset: headings, bullet lists, **bold**, paragraphs.
  const renderBody = (text) => {
    if (!text || !text.trim()) return "<p>No details provided.</p>";
    const lines = text.replace(/\r/g, "").split("\n");
    let html = "";
    let inList = false;
    const inline = (s) =>
      esc(s)
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/`(.+?)`/g, "<code>$1</code>");

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const bullet = line.match(/^[-*]\s+(.*)$/);
      const heading = line.match(/^#{1,6}\s+(.*)$/);

      if (bullet) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += "<li>" + inline(bullet[1]) + "</li>";
        continue;
      }
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += heading
        ? "<b>" + inline(heading[1]) + "</b>"
        : "<p>" + inline(line) + "</p>";
    }
    if (inList) html += "</ul>";
    return html;
  };

  const setText = (node, value) => {
    if (node && value) node.textContent = value;
  };

  function applyHeaderVersion(version) {
    document.querySelectorAll(".version").forEach((badge) => {
      const dot = badge.querySelector(".dot");
      badge.textContent = "Current Version: " + version;
      if (dot) badge.insertBefore(dot, badge.firstChild);
    });
  }

  function applyDownloads(releases, p) {
    const versionBig = $("#" + p + "-version");
    if (!versionBig) return; // not the downloads page

    const latest = releases[0];
    const asset = pickAsset(latest);

    setText(versionBig, "v" + cleanVersion(latest.tag_name));
    setText($("#" + p + "-date"), "Released: " + fmtDate(latest.published_at));

    if (asset) {
      setText($("#" + p + "-size"), fmtSize(asset.size));
      const link = $("#" + p + "-link");
      if (link) link.setAttribute("href", asset.browser_download_url);

      const shaLine = $("#" + p + "-sha");
      if (shaLine) {
        const digest = (asset.digest || "").replace(/^sha256:/i, "");
        if (digest) {
          shaLine.innerHTML =
            "SHA-256: <b>" +
            esc(digest.slice(0, 4) + "..." + digest.slice(-4)) +
            "</b>";
          shaLine.title = digest;
        } else {
          shaLine.style.display = "none";
        }
      }
    }

    const previous = $("#" + p + "-previous");
    if (!previous) return;
    const older = releases.slice(1, 7);
    previous.innerHTML = "";

    if (!older.length) {
      previous.appendChild(
        el("p", null, "<small>No previous releases yet.</small>")
      );
      return;
    }

    older.forEach((rel) => {
      const a = pickAsset(rel);
      const row = el("div", "release-row");
      row.appendChild(
        el(
          "div",
          null,
          "<b>v" +
            esc(cleanVersion(rel.tag_name)) +
            "</b><br><small>" +
            esc(fmtDate(rel.published_at)) +
            "</small>"
        )
      );
      const btn = el("a", "btn outline", "Download");
      btn.style.height = "38px";
      btn.style.fontSize = "12px";
      btn.setAttribute("href", a ? a.browser_download_url : rel.html_url);
      row.appendChild(btn);
      previous.appendChild(row);
    });
  }

  function applyReleaseNotes(releases, listId, name) {
    const list = $(listId);
    if (!list) return; // not the release notes page

    list.innerHTML = "";
    releases.slice(0, 12).forEach((rel, i) => {
      const note = el("div", "note reveal" + (i === 0 ? " open" : ""));
      const btn = el(
        "button",
        null,
        name + " v" +
          esc(cleanVersion(rel.tag_name)) +
          " — " +
          esc(fmtDate(rel.published_at)) +
          " <span>" +
          (i === 0 ? "−" : "+") +
          "</span>"
      );
      btn.addEventListener("click", () => {
        note.classList.toggle("open");
        const sign = btn.querySelector("span");
        if (sign) sign.textContent = note.classList.contains("open") ? "−" : "+";
      });
      note.appendChild(btn);
      note.appendChild(el("div", "body", renderBody(rel.body)));
      list.appendChild(note);
    });
  }

  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => {
      const releases = (data || []).filter((r) => !r.draft && !r.prerelease);
      // AnalabSafe releases are tagged "safe-vX.Y.Z"; everything else is Analab.
      const isSafe = (r) => /^safe-/i.test(r.tag_name);
      const analab = releases.filter((r) => !isSafe(r));
      const safe = releases.filter(isSafe);
      if (analab.length) {
        applyHeaderVersion(cleanVersion(analab[0].tag_name));
        applyDownloads(analab, "dl");
        applyReleaseNotes(analab, "#rn-list", "Analab");
      }
      if (safe.length) {
        applyDownloads(safe, "safe-dl");
        applyReleaseNotes(safe, "#safe-rn-list", "AnalabSafe");
      }
    })
    .catch(() => {
      /* Offline or repo not set — the static HTML stays as written. */
    });
})();
