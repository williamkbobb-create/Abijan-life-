(function () {
  "use strict";
  const form = document.getElementById("player-feedback-form");
  if (!form) return;
  const status = document.getElementById("feedback-status");
  const submit = form.querySelector('button[type="submit"]');
  const config = window.ABIJAN_SUPABASE;
  const COOLDOWN_MS = 30000;
  const COOLDOWN_KEY = "abijan-life-feedback-last-submit";

  function showStatus(message, kind) {
    status.textContent = message;
    status.dataset.kind = kind || "info";
    status.hidden = false;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    // Honeypot for basic bot filtering. This is not a substitute for server-side rate limiting.
    if (String(data.get("website") || "").trim()) {
      showStatus("Thanks for sharing your feedback.", "success");
      form.reset();
      return;
    }

    if (!config || !config.url || !config.publishableKey) {
      showStatus("Feedback is temporarily unavailable. Please try again later.", "error");
      return;
    }

    let lastSubmit = 0;
    try { lastSubmit = Number(localStorage.getItem(COOLDOWN_KEY) || 0); } catch (_) {}
    if (Date.now() - lastSubmit < COOLDOWN_MS) {
      showStatus("Please wait 30 seconds before sending another review.", "error");
      return;
    }

    const payload = {
      player_name: String(data.get("player_name") || "").trim() || null,
      rating: Number(data.get("rating")),
      category: String(data.get("category") || ""),
      message: String(data.get("message") || "").trim(),
      page_path: window.location.pathname.slice(0, 200)
    };

    submit.disabled = true;
    submit.textContent = "SENDING…";
    try {
      const response = await fetch(config.url + "/rest/v1/player_feedback", {
        method: "POST",
        headers: {
          apikey: config.publishableKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Feedback request failed (" + response.status + ")");
      try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (_) {}
      form.reset();
      showStatus("Thank you — your review has been received. Your feedback will help improve Abijan Life.", "success");
    } catch (_) {
      showStatus("We couldn’t send that review right now. Please check your connection and try again.", "error");
    } finally {
      submit.disabled = false;
      submit.textContent = "SEND REVIEW";
    }
  });
})();