import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** 1) Koble til Supabase (BYTT til dine nøkler) */
const supabase = createClient(
  "https://uopybyttidgcriomnohn.supabase.co",
  "sb_publishable_ylO6-h16mSMxTdBNsVF4cg_o5zBdwcQ",
);

const panel = document.getElementById("authPanel");
const openBtn = document.getElementById("authOpenBtn");
const closeBtn = document.getElementById("authCloseBtn");
const userBadge = document.getElementById("authUserBadge");
const loggedOut = document.getElementById("authLoggedOut");
const loggedIn = document.getElementById("authLoggedIn");
const whoami = document.getElementById("whoami");
const roleBadge = document.getElementById("roleBadge");
const tabButtons = document.querySelectorAll("[data-tab]");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginMsg = document.getElementById("loginMsg");
const signupMsg = document.getElementById("signupMsg");

function openPanel() {
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

function closePanel() {
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}

openBtn.addEventListener("click", openPanel);
closeBtn.addEventListener("click", closePanel);

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    loginForm.style.display = tab === "login" ? "" : "none";
    signupForm.style.display = tab === "signup" ? "" : "none";
  });
});

async function refreshAuthUI() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    loggedOut.style.display = "";
    loggedIn.style.display = "none";
    userBadge.textContent = "";
    whoami.textContent = "";
    roleBadge.textContent = "";
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "student";
  const blockedText = profile?.is_blocked ? " (venter på godkjenning)" : "";
  loggedOut.style.display = "none";
  loggedIn.style.display = "";
  whoami.textContent = `Innlogget som ${user.email}`;
  roleBadge.textContent = `Rolle: ${role}${blockedText}`;
  userBadge.textContent = role === "admin" ? "Admin" : "Innlogget";
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "Logger inn...";
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  loginMsg.textContent = error ? "Feil: " + error.message : "Innlogget ✅";
  if (!error) setTimeout(closePanel, 400);
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupMsg.textContent = "Oppretter...";
  const name = document.getElementById("signupName").value.trim();
  const className = document.getElementById("signupClass").value.trim();
  const email = document
    .getElementById("signupEmail")
    .value.trim()
    .toLowerCase();
  const pass = document.getElementById("signupPass").value;

  const { error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { display_name: name, class: className } },
  });

  signupMsg.textContent = error
    ? "Feil: " + error.message
    : "Konto opprettet ✅ Sjekk e-posten din for bekreftelse.";
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
});

async function hentProdukt() {
  const { data, error } = await supabase
    .from("produkter")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("produktNavn").textContent = data.navn;

  document.getElementById("produktPris").textContent = data.pris + " kr";

  document.getElementById("produktBeskrivelse").textContent = data.beskrivelse;

  document.getElementById("produktBilde").src = data.bilde_url;
}

hentProdukt();

supabase.auth.onAuthStateChange(() => refreshAuthUI());
refreshAuthUI();
