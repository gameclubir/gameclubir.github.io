/* GAME CLUB — صفحه پروفایل کاربر عادی (ورود، ثبت‌نام، تنظیمات) */
const pOk = (m) => notice(m, false);
const pErr = (m) => notice(m);

function showProfileView(v) {
  $("#view-guest").classList.toggle("hidden", v !== "guest");
  $("#view-me").classList.toggle("hidden", v !== "me");
}

function fillLangSelect(current) {
  $("#pref-lang").innerHTML = LANGS.map(
    (l) => `<option value="${l.code}" ${l.code === current ? "selected" : ""}>${esc(l.name)}</option>`
  ).join("");
}

async function onSignIn(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const { error } = await sb.auth.signInWithPassword({ email: fd.get("email"), password: fd.get("password") });
  if (error) pErr("ورود ناموفق: " + error.message);
}

async function onSignUp(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const { data, error } = await sb.auth.signUp({
    email: fd.get("email"),
    password: fd.get("password"),
    options: { data: { display_name: String(fd.get("display_name") || "").trim() } },
  });
  if (error) return pErr("ثبت‌نام ناموفق: " + error.message);
  if (!data.session) return pOk("ثبت‌نام انجام شد. ایمیل خود را برای تأیید حساب بررسی کنید.");
  pOk("حساب شما ساخته شد.");
}

async function loadMe(user) {
  const { data, error } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) return pErr(error.message);
  const p = data || { display_name: user.email, language: LANG };
  $("#me-email").textContent = user.email;
  $("#name-form [name='display_name']").value = p.display_name || "";
  fillLangSelect(p.language || LANG);
  showProfileView("me");
  // اگر زبان ذخیره‌شده با زبان این مرورگر فرق دارد، یک بار همگام‌سازی می‌کنیم.
  if (p.language && p.language !== LANG && STRINGS[p.language]) {
    try { localStorage.setItem("gc_lang", p.language); } catch (x) {}
    location.reload();
  }
}

async function onSaveName(e) {
  e.preventDefault();
  const name = String(new FormData(e.target).get("display_name") || "").trim();
  if (!name) return pErr("نام نمایشی نمی‌تواند خالی باشد.");
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("profiles").update({ display_name: name }).eq("id", user.id);
  if (error) return pErr(error.message);
  pOk("نام ذخیره شد.");
}

async function onSaveLang(e) {
  e.preventDefault();
  const code = $("#pref-lang").value;
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("profiles").update({ language: code }).eq("id", user.id);
  if (error) return pErr(error.message);
  setLang(code);
}

function initProfile() {
  if (!CONFIGURED) {
    notice(t("setup_needed"));
    showProfileView("guest");
    return;
  }
  $("#login-form").addEventListener("submit", onSignIn);
  $("#signup-form").addEventListener("submit", onSignUp);
  $("#name-form").addEventListener("submit", onSaveName);
  $("#lang-form").addEventListener("submit", onSaveLang);
  $("#logout").addEventListener("click", () => sb.auth.signOut());

  sb.auth.onAuthStateChange((event, session) => {
    if (!session) return showProfileView("guest");
    if (event === "INITIAL_SESSION" || event === "SIGNED_IN") loadMe(session.user);
  });
}

document.addEventListener("DOMContentLoaded", initProfile);
