<<<<<<< HEAD
// Add event listener to the navbar links
document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', () => {
    // Remove active class from all links
    document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));
    // Add active class to the clicked link
    link.classList.add('active');
  });
});

// Add animation to the home section
const homeSection = document.querySelector('.home');
homeSection.classList.add('animate');

// Add animation to the header
const header = document.querySelector('header');
header.classList.add('animate');


// Add event listener to the download CV button
document.querySelector('.btn').addEventListener('click', () => {
  alert('Your CV is being downloaded!');
});

// Add event listener to the social media icons
document.querySelectorAll('.social-icons a').forEach(icon => {
  icon.addEventListener('click', () => {
    alert(`You are being redirected to ${icon.href}!`);
  });
});

// Add animation to the home section
const homeSection = document.querySelector('.home');
homeSection.addEventListener('mouseover', () => {
  homeSection.style.transform = 'scale(1.1)';
});

homeSection.addEventListener('mouseout', () => {
  homeSection.style.transform = 'scale(1)';
});

=======
/* ============================================================
   COLLEGE VOTING SYSTEM — COMPLETE JAVASCRIPT
   Features:
   ✓ Junior + Senior candidate voting
   ✓ One-vote-per-session enforcement
   ✓ Live stats bar (total, per-category, leader, timer)
   ✓ Search / filter candidates
   ✓ Animated results with progress bars
   ✓ Vote history log
   ✓ Admin panel (password: admin123)
       – Reset votes, add/remove candidates, lock/unlock voting
   ✓ Toast notifications (no more alert())
   ✓ Confetti on successful vote
   ✓ CSV export
   ✓ LocalStorage persistence
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
// CONSTANTS & STATE
// ─────────────────────────────────────────────

const ADMIN_PASSWORD = 'admin123';

let juniorCandidates = JSON.parse(localStorage.getItem('juniorCandidates')) ||
  ['SRIRAM','KAVIN PRAKASH','PRAJAN','YOKESH','GOKULA KANNAN',
   'GAYATHRI','NITHYA','RAKSHITHA','SUSILA','SARANYA'];

let seniorCandidates = JSON.parse(localStorage.getItem('seniorCandidates')) ||
  ['DHINESH','POONGUNDRAN','AVANTHIKA','SRIVAISHNAVI','MAHALAKSHMI'];

let juniorVotes = JSON.parse(localStorage.getItem('juniorVotes')) || {};
let seniorVotes = JSON.parse(localStorage.getItem('seniorVotes')) || {};

let locked = JSON.parse(localStorage.getItem('locked')) || { junior: false, senior: false };

let history = JSON.parse(localStorage.getItem('voteHistory')) || [];

// Session vote tracking (cleared on page reload)
const sessionVoted = { junior: false, senior: false };

// Initialize missing vote keys
function initVotes() {
  juniorCandidates.forEach(c => { if (juniorVotes[c] === undefined) juniorVotes[c] = 0; });
  seniorCandidates.forEach(c => { if (seniorVotes[c] === undefined) seniorVotes[c] = 0; });
}
initVotes();

// ─────────────────────────────────────────────
// SAVE HELPERS
// ─────────────────────────────────────────────

function saveAll() {
  localStorage.setItem('juniorVotes',      JSON.stringify(juniorVotes));
  localStorage.setItem('seniorVotes',      JSON.stringify(seniorVotes));
  localStorage.setItem('juniorCandidates', JSON.stringify(juniorCandidates));
  localStorage.setItem('seniorCandidates', JSON.stringify(seniorCandidates));
  localStorage.setItem('locked',           JSON.stringify(locked));
  localStorage.setItem('voteHistory',      JSON.stringify(history));
}

// ─────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────

const toastIcons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${toastIcons[type]}</span>
                     <span class="toast-text">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 120 }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height - canvas.height,
    r:    Math.random() * 8 + 4,
    d:    Math.random() * 120 + 60,
    color: `hsl(${Math.random()*360},70%,60%)`,
    tilt: Math.random() * 10 - 10,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.15 + 0.05,
    vx: Math.random() * 2 - 1,
    vy: Math.random() * 4 + 2,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y  += p.vy;
      p.x  += p.vx;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });
    frame++;
    if (frame < 160) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ─────────────────────────────────────────────
// RENDER CANDIDATES
// ─────────────────────────────────────────────

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function renderCandidates(category) {
  const candidates = category === 'junior' ? juniorCandidates : seniorCandidates;
  const container  = document.getElementById(`${category}-list`);
  const isLocked   = locked[category];
  const hasVoted   = sessionVoted[category];

  container.innerHTML = '';
  candidates.forEach((name, i) => {
    const item = document.createElement('label');
    item.className = 'candidate-item';
    item.dataset.name = name;
    item.style.animationDelay = `${i * 0.05}s`;
    item.innerHTML = `
      <input type="radio" name="${category}" value="${name}" ${(isLocked || hasVoted) ? 'disabled' : ''}/>
      <div class="candidate-avatar">${getInitials(name)}</div>
      <span class="candidate-name">${name}</span>
      <span class="candidate-item-num">#${i+1}</span>
      <div class="candidate-check">✓</div>
    `;
    item.addEventListener('click', () => {
      if (isLocked || hasVoted) return;
      document.querySelectorAll(`#${category}-list .candidate-item`).forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    });
    container.appendChild(item);
  });

  // Lock UI indicators
  const btn      = document.getElementById(`btnVote${capitalize(category)}`);
  const indicator = document.getElementById(`${category}VotedIndicator`);

  if (hasVoted) {
    btn.disabled = true;
    indicator.style.display = 'flex';
  } else if (isLocked) {
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-icon">🔒</span> Voting Locked`;
    indicator.style.display = 'none';
  } else {
    btn.disabled = false;
    btn.innerHTML = `<span class="btn-icon">✓</span> Cast Vote`;
    indicator.style.display = 'none';
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ─────────────────────────────────────────────
// FILTER / SEARCH
// ─────────────────────────────────────────────

function filterCandidates(category) {
  const query = document.getElementById(`${category}Search`).value.toLowerCase().trim();
  const items = document.querySelectorAll(`#${category}-list .candidate-item`);
  let visible = 0;
  items.forEach(item => {
    const match = item.dataset.name.toLowerCase().includes(query);
    item.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  // Show no-result message
  let noMsg = document.getElementById(`${category}NoResult`);
  if (!noMsg) {
    noMsg = document.createElement('div');
    noMsg.id = `${category}NoResult`;
    noMsg.className = 'no-candidates';
    noMsg.textContent = 'No candidates found.';
    document.getElementById(`${category}-list`).after(noMsg);
  }
  noMsg.style.display = (visible === 0 && query) ? '' : 'none';
}

// ─────────────────────────────────────────────
// CAST VOTE
// ─────────────────────────────────────────────

function castVote(category) {
  if (locked[category]) { showToast('Voting is currently locked by admin.', 'warning'); return; }
  if (sessionVoted[category]) { showToast('You have already voted in this category!', 'warning'); return; }

  const selected = document.querySelector(`input[name="${category}"]:checked`);
  if (!selected) { showToast('Please select a candidate first.', 'error'); return; }

  const name = selected.value;

  if (category === 'junior') {
    juniorVotes[name]++;
  } else {
    seniorVotes[name]++;
  }

  // Mark voted
  sessionVoted[category] = true;

  // Log history entry
  const entry = {
    category, name,
    time: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
    date: new Date().toLocaleDateString('en-IN'),
  };
  history.unshift(entry);
  if (history.length > 100) history.pop(); // cap history

  saveAll();
  renderCandidates(category);
  updateStats();
  renderResults();
  renderHistory();

  showToast(`🎉 Vote cast for <strong>${name}</strong>!`, 'success', 4000);
  launchConfetti();

  // Ripple effect on button
  addRipple(document.getElementById(`btnVote${capitalize(category)}`));
}

function addRipple(btn) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = '200px';
  ripple.style.left = '50%';
  ripple.style.top  = '50%';
  ripple.style.marginLeft = ripple.style.marginTop = '-100px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// ─────────────────────────────────────────────
// RESULTS
// ─────────────────────────────────────────────

function renderResults() {
  renderResultBars('junior', juniorVotes, 'junior-results', 'juniorWinner');
  renderResultBars('senior', seniorVotes, 'senior-results', 'seniorWinner');
}

function renderResultBars(category, votes, containerId, winnerId) {
  const container = document.getElementById(containerId);
  const winnerEl  = document.getElementById(winnerId);
  const totalVotes = Object.values(votes).reduce((a,b)=>a+b, 0);
  const maxVotes   = Math.max(...Object.values(votes), 1);
  const sorted     = Object.entries(votes).sort((a,b) => b[1] - a[1]);
  const winner     = sorted[0];

  container.innerHTML = '';

  // Winner banner
  if (winner && winner[1] > 0) {
    winnerEl.className = 'winner-banner show';
    winnerEl.innerHTML = `🏆 Leader: <strong>${winner[0]}</strong> — ${winner[1]} vote${winner[1]!==1?'s':''}`;
  } else {
    winnerEl.className = 'winner-banner';
  }

  sorted.forEach(([name, count], idx) => {
    const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
    const barPct = Math.round((count / maxVotes) * 100);
    const isLeader = idx === 0 && count > 0;

    const row = document.createElement('div');
    row.className = 'result-row';
    row.style.animationDelay = `${idx * 0.07}s`;
    row.innerHTML = `
      <div class="result-meta">
        <span class="result-name">${isLeader ? '🥇 ' : (idx===1?'🥈 ':idx===2?'🥉 ':'')}${name}</span>
        <span>
          <span class="result-count">${count}</span>
          <span class="result-pct"> (${pct}%)</span>
        </span>
      </div>
      <div class="bar-track">
        <div class="bar-fill ${isLeader ? 'leader' : ''}" style="width:0%" data-width="${barPct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });

  // Animate bars after paint
  setTimeout(() => {
    container.querySelectorAll('.bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 100);
}

// ─────────────────────────────────────────────
// HISTORY LOG
// ─────────────────────────────────────────────

function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">📭 No votes recorded yet in this session.</div>';
    return;
  }
  history.forEach((entry, i) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.animationDelay = `${i * 0.03}s`;
    item.innerHTML = `
      <div class="history-dot ${entry.category}"></div>
      <span class="history-text">
        <strong>${entry.name}</strong> received a vote
        <span style="color:var(--text-muted);font-size:12px;margin-left:6px;">[${capitalize(entry.category)}]</span>
      </span>
      <span class="history-time">${entry.date} · ${entry.time}</span>
    `;
    list.appendChild(item);
  });
}

function clearHistory() {
  if (!confirm('Clear all vote history logs?')) return;
  history = [];
  saveAll();
  renderHistory();
  showToast('History cleared.', 'info');
}

// ─────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────

function updateStats() {
  const juniorTotal = Object.values(juniorVotes).reduce((a,b)=>a+b,0);
  const seniorTotal = Object.values(seniorVotes).reduce((a,b)=>a+b,0);
  const total       = juniorTotal + seniorTotal;

  // Find global leader
  const allVotes    = { ...juniorVotes, ...seniorVotes };
  const leader      = Object.entries(allVotes).sort((a,b)=>b[1]-a[1])[0];

  animateCount(document.getElementById('statTotalVotes'),  total);
  animateCount(document.getElementById('statJuniorVotes'), juniorTotal);
  animateCount(document.getElementById('statSeniorVotes'), seniorTotal);
  document.getElementById('statLeader').textContent =
    (leader && leader[1] > 0) ? leader[0].split(' ')[0] : '—';
}

function animateCount(el, target) {
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;
  const duration = 600, steps = 20;
  let step = 0;
  const inc = (target - start) / steps;
  const id = setInterval(() => {
    step++;
    el.textContent = Math.round(start + inc * step);
    if (step >= steps) { el.textContent = target; clearInterval(id); }
  }, duration / steps);
}

// ─────────────────────────────────────────────
// SESSION TIMER
// ─────────────────────────────────────────────

const sessionStart = Date.now();
function updateTimer() {
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  document.getElementById('statTimer').textContent =
    `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
setInterval(updateTimer, 1000);

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`content-${tab}`).classList.add('active');

  if (tab === 'results') renderResults();
  if (tab === 'history') renderHistory();
}

// ─────────────────────────────────────────────
// ADMIN PANEL
// ─────────────────────────────────────────────

function toggleAdminPanel() {
  const overlay = document.getElementById('adminOverlay');
  overlay.classList.toggle('open');
  if (!overlay.classList.contains('open')) {
    adminLogout(true);
  }
  // Reset remove dropdown on open
  populateRemoveDropdown();
}

function closeAdminOnOverlay(e) {
  if (e.target === document.getElementById('adminOverlay')) toggleAdminPanel();
}

function adminLogin() {
  const pwd = document.getElementById('adminPassword').value;
  if (pwd === ADMIN_PASSWORD) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminControls').style.display = 'block';
    updateAdminLockButtons();
    populateRemoveDropdown();
    showToast('Admin access granted.', 'success');
  } else {
    showToast('Incorrect password!', 'error');
    document.getElementById('adminPassword').classList.add('shake');
    setTimeout(() => document.getElementById('adminPassword').classList.remove('shake'), 600);
  }
}

function adminLogout(silent = false) {
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminControls').style.display = 'none';
  document.getElementById('adminPassword').value = '';
  if (!silent) showToast('Logged out.', 'info');
}

function resetVotes(category) {
  if (!confirm(`Reset all ${category} votes? This cannot be undone.`)) return;
  if (category === 'junior') { juniorCandidates.forEach(c => juniorVotes[c] = 0); }
  else                       { seniorCandidates.forEach(c => seniorVotes[c] = 0); }
  saveAll(); updateStats(); renderResults();
  showToast(`${capitalize(category)} votes reset.`, 'warning');
}

function resetAllVotes() {
  if (!confirm('Reset ALL votes? This cannot be undone!')) return;
  juniorCandidates.forEach(c => juniorVotes[c] = 0);
  seniorCandidates.forEach(c => seniorVotes[c] = 0);
  saveAll(); updateStats(); renderResults();
  showToast('All votes have been reset.', 'warning');
}

function addCandidate() {
  const category = document.getElementById('newCandidateCategory').value;
  const name     = document.getElementById('newCandidateName').value.trim().toUpperCase();
  if (!name) { showToast('Enter a candidate name.', 'error'); return; }

  const list  = category === 'junior' ? juniorCandidates : seniorCandidates;
  const votes = category === 'junior' ? juniorVotes      : seniorVotes;

  if (list.includes(name)) { showToast('Candidate already exists!', 'warning'); return; }

  list.push(name);
  votes[name] = 0;
  document.getElementById('newCandidateName').value = '';

  saveAll();
  renderCandidates(category);
  populateRemoveDropdown();
  showToast(`${name} added as ${category} candidate.`, 'success');
}

function removeCandidate() {
  const category = document.getElementById('removeCandidateCategory').value;
  const name     = document.getElementById('removeCandidateName').value;
  if (!name) { showToast('Select a candidate to remove.', 'error'); return; }
  if (!confirm(`Remove ${name} from ${category}?`)) return;

  if (category === 'junior') {
    juniorCandidates = juniorCandidates.filter(c => c !== name);
    delete juniorVotes[name];
  } else {
    seniorCandidates = seniorCandidates.filter(c => c !== name);
    delete seniorVotes[name];
  }

  saveAll();
  renderCandidates(category);
  populateRemoveDropdown();
  showToast(`${name} removed.`, 'info');
}

function populateRemoveDropdown() {
  const catEl = document.getElementById('removeCandidateCategory');
  const sel   = document.getElementById('removeCandidateName');
  if (!catEl || !sel) return;

  function updateDropdown() {
    const cat  = catEl.value;
    const list = cat === 'junior' ? juniorCandidates : seniorCandidates;
    sel.innerHTML = '<option value="">Select candidate...</option>' +
      list.map(c => `<option value="${c}">${c}</option>`).join('');
  }
  catEl.onchange = updateDropdown;
  updateDropdown();
}

function toggleLock(category) {
  locked[category] = !locked[category];
  saveAll();
  renderCandidates(category);
  updateAdminLockButtons();
  showToast(
    `${capitalize(category)} voting ${locked[category] ? 'locked 🔒' : 'unlocked 🔓'}.`,
    locked[category] ? 'warning' : 'success'
  );
}

function updateAdminLockButtons() {
  ['junior','senior'].forEach(cat => {
    const btn = document.getElementById(`btnLock${capitalize(cat)}`);
    if (!btn) return;
    btn.innerHTML = locked[cat]
      ? `🔓 Unlock ${capitalize(cat)}`
      : `🔒 Lock ${capitalize(cat)}`;
    btn.style.background = locked[cat]
      ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)';
    btn.style.color = locked[cat]
      ? 'var(--success)' : 'var(--warning)';
  });
}

// ─────────────────────────────────────────────
// CSV EXPORT
// ─────────────────────────────────────────────

function exportCSV(category) {
  const votes    = category === 'junior' ? juniorVotes : seniorVotes;
  const total    = Object.values(votes).reduce((a,b)=>a+b,0);
  const sorted   = Object.entries(votes).sort((a,b)=>b[1]-a[1]);
  const dateStr  = new Date().toISOString().slice(0,10);

  let csv = `Category,${capitalize(category)}\nDate,${dateStr}\n\nRank,Candidate,Votes,Percentage\n`;
  sorted.forEach(([name,count],i) => {
    const pct = total ? ((count/total)*100).toFixed(1) : '0.0';
    csv += `${i+1},${name},${count},${pct}%\n`;
  });
  csv += `\nTotal,,${total},100%`;

  const blob = new Blob([csv], { type:'text/csv' });
  const link = document.createElement('a');
  link.href     = URL.createObjectURL(blob);
  link.download = `${capitalize(category)}_Votes_${dateStr}.csv`;
  link.click();
  showToast(`${capitalize(category)} results exported!`, 'success');
}

// ─────────────────────────────────────────────
// BACKGROUND PARTICLES
// ─────────────────────────────────────────────

function createParticles() {
  const container = document.getElementById('bgParticles');
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 1;
    const x    = Math.random() * 100;
    const dur  = Math.random() * 20 + 15;
    const delay= Math.random() * 10;
    p.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(${Math.random()>0.5?'124,58,237':'6,182,212'},${Math.random()*0.5+0.1});
      left:${x}%; bottom:-10px;
      animation:particleRise ${dur}s ${delay}s linear infinite;
    `;
    container.appendChild(p);
  }
}

// Inject particle keyframes
const styleSheet = document.styleSheets[0];
try {
  styleSheet.insertRule(`
    @keyframes particleRise {
      0%   { transform:translateY(0) scale(1);   opacity:0.6; }
      50%  { opacity:0.3; }
      100% { transform:translateY(-100vh) scale(0); opacity:0; }
    }
  `, styleSheet.cssRules.length);
  styleSheet.insertRule(`
    .shake { animation: shakePwd 0.5s ease; }
    @keyframes shakePwd {
      0%,100%{transform:translateX(0)}
      25%{transform:translateX(-8px)}
      75%{transform:translateX(8px)}
    }
  `, styleSheet.cssRules.length);
} catch(e) { /* ignore cross-origin errors */ }

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

function init() {
  createParticles();
  renderCandidates('junior');
  renderCandidates('senior');
  updateStats();
  updateTimer();
  updateAdminLockButtons();
}

document.addEventListener('DOMContentLoaded', init);
>>>>>>> 5cd818cf4dfbd4abb5b7e74883e450a9cb81020f
