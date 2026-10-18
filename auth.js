(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let client = null;
  let user = null;
  function showStatus(message, kind) {
    const node = $("auth-status");
    if (!node) return;
    node.textContent = message; node.dataset.kind = kind || "info"; node.hidden = false;
  }
  function renderAccount() {
    let bar = $("account-bar");
    if (!user) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement("div"); bar.id = "account-bar"; bar.className = "account-bar"; $("game-screen").prepend(bar); }
    bar.replaceChildren();
    const label = document.createElement("span"); label.textContent = "Connecté : " + (user.email || "Compte joueur");
    const logout = document.createElement("button"); logout.type = "button"; logout.textContent = "SE DÉCONNECTER";
    logout.addEventListener("click", async () => {
      if (!client) return;
      const { error } = await client.auth.signOut();
      if (error) return showStatus("Déconnexion impossible. Réessaie.", "error");
      user = null; renderAccount(); showStatus("Tu es déconnecté. Tu peux continuer à jouer.", "success");
    });
    bar.append(label, logout);
  }
  function init() {
    const game = $("game-screen"), toggle = $("auth-toggle");
    if (!game || !toggle) return;
    const panel = document.createElement("section");
    panel.id = "auth-panel"; panel.className = "auth-panel"; panel.hidden = true;
    panel.innerHTML = '<div class="auth-panel-head"><div><p class="eyebrow">TON HISTOIRE T’APPARTIENT</p><h2 id="auth-title">Connecte-toi à Abijan Life</h2><p>Ton compte est facultatif. Tu peux jouer sans te connecter.</p></div><button id="auth-close" type="button" aria-label="Fermer">×</button></div><form id="auth-form"><label for="auth-email">Adresse e-mail</label><input id="auth-email" type="email" autocomplete="email" required maxlength="254" placeholder="toi@exemple.com"><label for="auth-password">Mot de passe</label><input id="auth-password" type="password" autocomplete="current-password" minlength="8" required placeholder="8 caractères minimum"><div class="auth-actions"><button class="primary-button" type="submit" data-auth-submit>SE CONNECTER</button><button class="auth-secondary" type="button" id="auth-mode">CRÉER UN COMPTE</button></div><p class="auth-note">La progression reste enregistrée sur cet appareil; elle n’est pas synchronisée entre appareils.</p><p id="auth-status" role="status" aria-live="polite" hidden></p></form>';
    game.append(panel);
    const close = () => { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); toggle.classList.remove("is-open"); };
    toggle.addEventListener("click", () => { panel.hidden = !panel.hidden; toggle.setAttribute("aria-expanded", String(!panel.hidden)); toggle.classList.toggle("is-open", !panel.hidden); if (!panel.hidden) $("auth-email").focus(); });
    $("auth-close").addEventListener("click", close);
    $("auth-mode").addEventListener("click", () => {
      const signup = $("auth-form").dataset.mode !== "signup";
      $("auth-form").dataset.mode = signup ? "signup" : "login";
      $("auth-title").textContent = signup ? "Créer un compte joueur" : "Connecte-toi à Abijan Life";
      $("auth-form").querySelector("[data-auth-submit]").textContent = signup ? "CRÉER MON COMPTE" : "SE CONNECTER";
      $("auth-password").autocomplete = signup ? "new-password" : "current-password";
      $("auth-mode").textContent = signup ? "J’AI DÉJÀ UN COMPTE" : "CRÉER UN COMPTE";
      $("auth-status").hidden = true;
    });
    $("auth-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!client) return showStatus("Connexion indisponible : vérifie la configuration Supabase.", "error");
      const email = $("auth-email").value.trim(), password = $("auth-password").value, mode = $("auth-form").dataset.mode || "login";
      const submit = $("auth-form").querySelector("[data-auth-submit]"); submit.disabled = true;
      try {
        if (mode === "signup") {
          const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
          if (error) throw error;
          if (data.session && data.session.user) { user = data.session.user; renderAccount(); close(); showStatus("Compte créé et connecté.", "success"); }
          else showStatus("Compte créé. Vérifie ta boîte e-mail pour confirmer ton adresse.", "success");
        } else {
          const { data, error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          user = data.session.user; renderAccount(); close(); showStatus("Connexion réussie.", "success");
        }
      } catch (error) { showStatus(error && error.message ? error.message : "Une erreur est survenue.", "error"); }
      finally { submit.disabled = false; }
    });
    const config = window.ABIJAN_SUPABASE;
    if (config && config.url && config.publishableKey && window.supabase && window.supabase.createClient) {
      client = window.supabase.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      client.auth.onAuthStateChange((event, session) => { user = session && session.user ? session.user : null; renderAccount(); });
      client.auth.getSession().then(({ data }) => { user = data && data.session ? data.session.user : null; renderAccount(); });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();