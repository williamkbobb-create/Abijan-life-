(function () {
  "use strict";
  const config = window.ABIJAN_SUPABASE;
  const $ = (id) => document.getElementById(id);
  const TUTORIAL_PREFIX = "abijan-life-tutorial-v1:";
  let client = null;
  let currentUser = null;
  let tutorialShown = false;

  function status(message, kind) {
    const node = $("auth-status");
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind || "info";
    node.hidden = false;
  }
  function setBusy(busy) {
    document.querySelectorAll("[data-auth-submit]").forEach((button) => {
      button.disabled = busy;
      button.dataset.originalText ||= button.textContent;
      button.textContent = busy ? "UN INSTANTE…" : button.dataset.originalText;
    });
  }
  function buildAuthPanel() {
    const welcome = $("welcome-screen");
    if (!welcome || $("auth-panel")) return;
    const panel = document.createElement("section");
    panel.id = "auth-panel";
    panel.className = "auth-panel";
    panel.setAttribute("aria-labelledby", "auth-title");
    panel.innerHTML = `
      <div class="auth-copy"><p class="eyebrow">TON HISTOIRE T’APPARTIENT</p><h2 id="auth-title">Crée ton compte joueur</h2><p>Inscris-toi ou connecte-toi pour entrer dans Abijan Life. Utilise une adresse e-mail à laquelle tu as accès.</p></div>
      <form id="auth-form">
        <label for="auth-email">Adresse e-mail</label><input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="toi@exemple.com">
        <label for="auth-password">Mot de passe</label><input id="auth-password" name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="8 caractères minimum">
        <div class="auth-actions"><button class="primary-button" type="submit" data-auth-submit data-auth-mode="signup">CRÉER MON COMPTE</button><button class="auth-secondary" type="button" id="auth-login">J’AI DÉJÀ UN COMPTE</button></div>
        <p class="auth-note">Ton compte sert à te connecter. La progression du jeu reste enregistrée sur cet appareil pour le moment.</p>
        <p id="auth-status" role="status" aria-live="polite" hidden></p>
      </form>`;
    welcome.prepend(panel);
    const characterForm = $("character-form");
    if (characterForm) characterForm.hidden = true;
    $("auth-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!client) return status("Connexion indisponible : la configuration Supabase manque.", "error");
      const email = $("auth-email").value.trim();
      const password = $("auth-password").value;
      const mode = $("auth-form").dataset.mode || "signup";
      setBusy(true);
      try {
        if (mode === "signup") {
          const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + window.location.pathname } });
          if (error) throw error;
          if (data.session) await acceptSession(data.session);
          else status("Compte créé. Vérifie ta boîte e-mail et confirme ton adresse avant de te connecter.", "success");
        } else {
          const { data, error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          await acceptSession(data.session);
        }
      } catch (error) {
        const message = error && error.message ? error.message : "Une erreur est survenue.";
        status(message, "error");
      } finally { setBusy(false); }
    });
    $("auth-login").addEventListener("click", () => {
      const form = $("auth-form");
      const signup = form.dataset.mode !== "login";
      form.dataset.mode = signup ? "login" : "signup";
      $("auth-title").textContent = signup ? "Content de te revoir" : "Crée ton compte joueur";
      form.querySelector('[data-auth-submit]').textContent = signup ? "SE CONNECTER" : "CRÉER MON COMPTE";
      form.querySelector('[data-auth-submit]').dataset.originalText = signup ? "SE CONNECTER" : "CRÉER MON COMPTE";
      $("auth-login").textContent = signup ? "CRÉER UN NOUVEAU COMPTE" : "J’AI DÉJÀ UN COMPTE";
      $("auth-password").autocomplete = signup ? "current-password" : "new-password";
      status("", "info"); $("auth-status").hidden = true;
    });
  }
  function showAccountBar() {
    let bar = $("account-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "account-bar";
      bar.className = "account-bar";
      const target = $("game-screen");
      if (target) target.prepend(bar);
    }
    bar.replaceChildren();
    const label = document.createElement("span");
    label.textContent = currentUser && currentUser.email ? "Connecté : " + currentUser.email : "Compte connecté";
    const logout = document.createElement("button");
    logout.type = "button"; logout.textContent = "SE DÉCONNECTER";
    logout.addEventListener("click", async () => {
      if (!client) return;
      const { error } = await client.auth.signOut();
      if (error) return alert("Déconnexion impossible. Réessaie.");
      currentUser = null;
      $("game-screen").hidden = true;
      $("welcome-screen").hidden = false;
      $("auth-panel").hidden = false;
      if ($("character-form")) $("character-form").hidden = true;
      $("account-bar").remove();
    });
    bar.append(label, logout);
  }
  async function acceptSession(session) {
    currentUser = session.user;
    $("auth-panel").hidden = true;
    if ($("character-form")) $("character-form").hidden = false;
    showAccountBar();
    status("Connexion réussie. Prépare ton personnage !", "success");
    const saved = (() => { try { return Boolean(localStorage.getItem("abijan-life-demo-v1")); } catch (_) { return false; } })();
    if (saved) {
      $("welcome-screen").hidden = true;
      $("game-screen").hidden = false;
      showAccountBar();
      setTimeout(showTutorialIfNeeded, 80);
    } else {
      $("welcome-screen").hidden = false;
      $("game-screen").hidden = true;
    }
  }
  function showTutorialIfNeeded() {
    if (!currentUser || tutorialShown || !$("game-screen") || $("game-screen").hidden) return;
    const key = TUTORIAL_PREFIX + currentUser.id;
    try { if (localStorage.getItem(key) === "done") return; } catch (_) {}
    tutorialShown = true;
    if ($("first-play-tutorial")) return;
    const overlay = document.createElement("div");
    overlay.id = "first-play-tutorial";
    overlay.className = "tutorial-backdrop";
    overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true"); overlay.setAttribute("aria-labelledby", "tutorial-title");
    overlay.innerHTML = `<div class="tutorial-card"><p class="eyebrow">GUIDE DE DÉPART · GRAND-BASSAM</p><h2 id="tutorial-title">Bienvenue dans ta nouvelle vie !</h2><p>Voici comment commencer. Tu pourras retrouver ce guide à chaque nouvelle partie si tu effaces les données du navigateur.</p><ol><li><b>Choisis un lieu.</b><span>Appuie sur un repère de la carte : plage, bar, restaurant ou lavage auto.</span></li><li><b>Fais une activité.</b><span>Les actions peuvent consommer de l’énergie et parfois des FCFA fictifs.</span></li><li><b>Prends soin de toi.</b><span>Surveille ton énergie et utilise le bouton de repos pour récupérer.</span></li><li><b>Rencontre les habitants.</b><span>Ouvre les rencontres pour discuter et faire progresser les amitiés de la démo.</span></li><li><b>Reviens plus tard.</b><span>Ta progression est enregistrée sur cet appareil, pas encore dans le cloud.</span></li></ol><button id="tutorial-finish" class="primary-button" type="button">C’EST PARTI !</button></div>`;
    $("game-screen").append(overlay);
    $("tutorial-finish").addEventListener("click", () => {
      try { localStorage.setItem(key, "done"); } catch (_) {}
      overlay.remove();
    });
  }
  function init() {
    buildAuthPanel();
    if (!config || !config.url || !config.publishableKey || !window.supabase || !window.supabase.createClient) {
      status("Supabase n’est pas configuré. Vérifie l’URL et la clé publique.", "error");
      return;
    }
    client = window.supabase.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    client.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        currentUser = session.user;
        if ($("auth-panel")) $("auth-panel").hidden = true;
        if ($("character-form")) $("character-form").hidden = false;
        showAccountBar();
        setTimeout(showTutorialIfNeeded, 100);
      } else if (event === "SIGNED_OUT") {
        currentUser = null;
      }
    });
    client.auth.getSession().then(({ data, error }) => {
      if (error) status("Impossible de vérifier la session. Recharge la page.", "error");
      if (data && data.session) acceptSession(data.session);
      else {
        $("game-screen").hidden = true;
        $("welcome-screen").hidden = false;
        $("auth-panel").hidden = false;
        if ($("character-form")) $("character-form").hidden = true;
      }
    });
    const observer = new MutationObserver(() => showTutorialIfNeeded());
    observer.observe($("game-screen"), { attributes: true, attributeFilter: ["hidden"] });
    $("character-form").addEventListener("submit", () => setTimeout(showTutorialIfNeeded, 100));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();