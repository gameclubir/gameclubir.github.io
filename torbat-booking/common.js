// Shared helpers for the booking pages. The anon key is public by design; row access is enforced by RLS and by the SQL functions.
const APP = {
  url: 'https://ajcabrytwrdesxdkkzfw.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2Ficnl0d3JkZXN4ZGtremZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NDk2NzksImV4cCI6MjExMTAyNTY3OX0.h89sfcSvsdos0T3WYZnPMEYkBGGUsVo-I62n_qf-wK0'
};
const sb = supabase.createClient(APP.url, APP.key, { auth: { persistSession: true } });

const STATUS_FA = {
  submitted: 'ثبت‌شده',
  pending_review: 'در انتظار تأیید',
  confirmed: 'تأییدشده',
  assigned: 'اختصاص‌یافته به تعمیرکار',
  awaiting_visit: 'در انتظار مراجعه',
  in_repair: 'در حال تعمیر',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده'
};
const DEVICE_FA = {
  fridge: 'یخچال',
  side_by_side: 'ساید بای ساید',
  washer: 'لباسشویی',
  dishwasher: 'ظرفشویی',
  ac: 'کولر',
  other: 'سایر'
};

// Escape anything coming from the database before it goes into innerHTML.
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function $(id) { return document.getElementById(id); }
function showMsg(el, text, kind) {
  el.className = 'msg ' + (kind || 'ok');
  el.textContent = text;
  el.classList.remove('hidden');
}
function hideMsg(el) { el.classList.add('hidden'); el.textContent = ''; }

// Dates are handled in Tehran time, the business's timezone.
function tehranToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date());
}
function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function faDate(iso, withWeekday) {
  const opts = { day: 'numeric', month: 'long', timeZone: 'Asia/Tehran' };
  if (withWeekday) opts.weekday = 'long';
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('fa-IR-u-ca-persian', opts);
}
function hm(t) { return String(t || '').slice(0, 5); }
