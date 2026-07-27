/**
 * 单词魔法学院 — 共享模块
 * 所有页面通过 <script src="shared.js"> 加载
 * 学习进度通过 localStorage 跨页面共享
 */
const STORAGE_KEY = 'word_academy_v3';

// ============================================================
// STATE
// ============================================================
function loadState() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) {}
  return { words: {}, stats: { totalXP: 0, streak: 0, lastStudyDate: '' }, achievements: [] };
}

function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

// Helpers for working with a word list
function getWordStatus(state, wid) { return state.words[wid]?.status || 'new'; }

function countByStatus(state, words, status) {
  return words.filter(w => (state.words[w.id]?.status || 'new') === status).length;
}

function getProgressPct(state, words) {
  if (!words.length) return 0;
  return Math.round((countByStatus(state, words, 'mastered') / words.length) * 100);
}

function getCollectionMastered(state, words) {
  return words.filter(w => (state.words[w.id]?.status || 'new') === 'mastered').length;
}

// ============================================================
// ACTIONS
// ============================================================
function addXP(state, wid, amt) {
  if (!state.words[wid]) state.words[wid] = { status: 'new', xp: 0 };
  const w = state.words[wid];
  w.xp += amt;
  state.stats.totalXP += amt;
  if (w.status === 'new') w.status = 'learning';
  updateStreak(state);
  checkAchievements(state);
  saveState(state);
}

function markMastered(state, wid) {
  if (!state.words[wid]) state.words[wid] = { status: 'new', xp: 0 };
  state.words[wid].status = 'mastered';
  state.words[wid].xp += 20;
  state.stats.totalXP += 20;
  updateStreak(state);
  checkAchievements(state);
  saveState(state);
}

function updateStreak(state) {
  const today = new Date().toISOString().split('T')[0];
  if (state.stats.lastStudyDate === today) return;
  const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  state.stats.streak = (state.stats.lastStudyDate === y) ? state.stats.streak + 1 : 1;
  state.stats.lastStudyDate = today;
}

function checkAchievements(state) {
  const a = state.achievements;
  // Count mastered across ALL words
  const mastered = Object.values(state.words).filter(w => w.status === 'mastered').length;
  if (mastered >= 1 && !a.includes('first')) a.push('first');
  if (mastered >= 3 && !a.includes('three')) a.push('three');
  if (mastered >= 6 && !a.includes('six')) a.push('six');
  if (mastered >= 12 && !a.includes('all12')) a.push('all12');
  if (state.stats.streak >= 3 && !a.includes('streak3')) a.push('streak3');
  if (state.stats.streak >= 7 && !a.includes('streak7')) a.push('streak7');
  if (state.stats.totalXP >= 200 && !a.includes('xp200')) a.push('xp200');
}

// ============================================================
// SPEECH
// ============================================================
function pronounce(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

// ============================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================
const ACHIEVEMENTS = [
  { id: 'first', emoji: '🌟', label: '初出茅庐 — 掌握第1个单词' },
  { id: 'three', emoji: '🥉', label: '三星连珠 — 掌握3个单词' },
  { id: 'six', emoji: '🥈', label: '六六大顺 — 掌握6个单词' },
  { id: 'all12', emoji: '🏆', label: '全年通 — 掌握全部12个月' },
  { id: 'streak3', emoji: '🔥', label: '三日坚持 — 连续学习3天' },
  { id: 'streak7', emoji: '💪', label: '周冠军 — 连续学习7天' },
  { id: 'xp200', emoji: '⭐', label: '经验达人 — 获得200XP' },
];

// ============================================================
// COLLECTIONS META (for dashboard / vocabulary)
// ============================================================
const COLLECTIONS_META = [
  { id: 'months', name: '月份单词', emoji: '📅', desc: 'January ~ December，12个月份', dateAdded: '2026-07-25', color: '#6B9AC4', page: 'months.html', wordCount: 12 },
  { id: 'travel', name: '出行与交通', emoji: '🚗', desc: '10个出行与交通单词：机场、飞机、救护车等', dateAdded: '2026-07-27', color: '#5B9EED', page: 'travel.html', wordCount: 10 },
  { id: 'journey1', name: '出行之旅 ①', emoji: '🧳', desc: 'Journey Part 1 — 8个基础出行单词：护照、站台、铁路等', dateAdded: '2026-07-28', color: '#5B9EED', page: 'journey1.html', wordCount: 8 },
  { id: 'journey2', name: '出行之旅 ②', emoji: '🎫', desc: 'Journey Part 2 — 10个旅游服务单词：票、导游、运河等', dateAdded: '2026-07-29', color: '#E8725A', page: 'journey2.html', wordCount: 10 },
  { id: 'journey3', name: '出行之旅 ③', emoji: '🛞', desc: 'Journey Part 3 — 10个驾驶道路单词：驾照、高速、环岛等', dateAdded: '2026-07-30', color: '#7BAE7F', page: 'journey3.html', wordCount: 10 }
];

// ============================================================
// TOAST
// ============================================================
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#3D2C2C;color:#FFF;padding:12px 28px;border-radius:50px;font-weight:600;z-index:9999;pointer-events:none;white-space:nowrap;font-size:16px';
  t.textContent = msg;
  document.body.appendChild(t);
  t.animate([{ opacity: 0, transform: 'translateX(-50%) translateY(20px)' }, { opacity: 1, transform: 'translateX(-50%) translateY(0)' }], { duration: 400, easing: 'ease' });
  setTimeout(() => {
    t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: 'ease' }).onfinish = () => t.remove();
  }, 1800);
}
