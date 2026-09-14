/**
 * VIBE PORTAL ENGINE
 * Pure Vanilla JavaScript Prototype
 */

// Initial Seed Data
const MOCK_USERS = [
  {
    id: 'VIBE-9102',
    area: 'Roorkee',
    activity: 'Exploring cafes & chill instrumental music',
    interests: ['Music', 'Coding', 'Coffee'],
    status: 'Active now'
  },
  {
    id: 'VIBE-4410',
    area: 'Roorkee',
    activity: 'Looking for casual badminton or outdoor fitness',
    interests: ['Sports', 'Fitness', 'Outdoors'],
    status: 'Nearby'
  },
  {
    id: 'VIBE-3391',
    area: 'Haridwar',
    activity: 'Photography walk around riverside spots',
    interests: ['Photography', 'Art', 'Walking'],
    status: 'Active 10m ago'
  },
  {
    id: 'VIBE-7721',
    area: 'Gurukul Kangri',
    activity: 'Deep tech discussions and startup brainstorming',
    interests: ['Coding', 'Startups', 'Reading'],
    status: 'Active now'
  },
  {
    id: 'VIBE-5512',
    area: 'Jwalapur',
    activity: 'Weekend gaming sessions & anime discussions',
    interests: ['Gaming', 'Anime', 'Sci-Fi'],
    status: 'Nearby'
  }
];

// App State Management
let appState = {
  currentArea: localStorage.getItem('vibe_area') || 'Roorkee',
  userAnonId: localStorage.getItem('vibe_id') || 'VIBE-' + Math.floor(1000 + Math.random() * 9000),
  interests: JSON.parse(localStorage.getItem('vibe_interests')) || ['Exploring', 'Music', 'Tech'],
  interestedSent: JSON.parse(localStorage.getItem('vibe_sent')) || [],
  incomingNotification: null,
  mutualMatch: null
};

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  // Save initial ID if new
  localStorage.setItem('vibe_id', appState.userAnonId);
  localStorage.setItem('vibe_interests', JSON.stringify(appState.interests));

  initNavigation();
  initAreaSelection();
  initProfilePage();
  initSafetyPage();
  renderFeed();
});

/* --- NAVIGATION ENGINE --- */
function navigateToScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    targetScreen.scrollTop = 0;
  }

  // Update Header & Nav visibility
  const header = document.getElementById('appHeader');
  const bottomNav = document.getElementById('bottomNav');
  
  if (screenId === 'screen-welcome') {
    header.style.display = 'flex';
    bottomNav.style.display = 'none';
  } else {
    header.style.display = 'flex';
    bottomNav.style.display = 'flex';
  }

  // Active Bottom Nav Highlight
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (screenId === 'screen-nearby') document.getElementById('navExplore').classList.add('active');
  if (screenId === 'screen-notification') document.getElementById('navNotifications').classList.add('active');
  if (screenId === 'screen-profile') document.getElementById('navProfile').classList.add('active');
}

function initNavigation() {
  // Screen 1: Start Button
  document.getElementById('startBtn').addEventListener('click', () => {
    navigateToScreen('screen-location-method');
  });

  // Global Back Buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-back');
      if (target) navigateToScreen(target);
    });
  });

  // Header Navigation Actions
  document.getElementById('headerHomeBtn').addEventListener('click', () => navigateToScreen('screen-welcome'));
  document.getElementById('headerSafetyBtn').addEventListener('click', () => navigateToScreen('screen-safety'));
  document.getElementById('headerProfileBtn').addEventListener('click', () => {
    updateProfileUI();
    navigateToScreen('screen-profile');
  });

  // Bottom Navigation Items
  document.getElementById('navExplore').addEventListener('click', () => navigateToScreen('screen-nearby'));
  document.getElementById('navNotifications').addEventListener('click', () => {
    document.getElementById('notifBadge').classList.add('hidden');
    if (appState.incomingNotification) {
      navigateToScreen('screen-notification');
    } else {
      showToast('No pending signals in your zone right now.');
      navigateToScreen('screen-nearby');
    }
  });
  document.getElementById('navProfile').addEventListener('click', () => {
    updateProfileUI();
    navigateToScreen('screen-profile');
  });

  // Screen 2: Location Method Buttons
  document.getElementById('useLocationBtn').addEventListener('click', () => {
    showToast('Requesting approximate GPS zone...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          showToast('Zone detected: Roorkee (Approximate)');
          setArea('Roorkee');
          navigateToScreen('screen-nearby');
        },
        () => {
          showToast('GPS unavailable. Please select your broad area manually.');
          navigateToScreen('screen-select-area');
        }
      );
    } else {
      navigateToScreen('screen-select-area');
    }
  });

  document.getElementById('selectManualBtn').addEventListener('click', () => {
    navigateToScreen('screen-select-area');
  });

  // Screen 4: Change Zone Button
  document.getElementById('changeZoneBtn').addEventListener('click', () => {
    navigateToScreen('screen-select-area');
  });
}

/* --- AREA SELECTION (SCREEN 3) --- */
function initAreaSelection() {
  const chips = document.querySelectorAll('.area-chip');
  const confirmBtn = document.getElementById('confirmAreaBtn');
  let selected = appState.currentArea;

  chips.forEach(chip => {
    if (chip.getAttribute('data-area') === selected) {
      chip.classList.add('selected');
      confirmBtn.disabled = false;
    }

    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selected = chip.getAttribute('data-area');
      confirmBtn.disabled = false;
    });
  });

  confirmBtn.addEventListener('click', () => {
    setArea(selected);
    navigateToScreen('screen-nearby');
  });
}

function setArea(areaName) {
  appState.currentArea = areaName;
  localStorage.setItem('vibe_area', areaName);
  document.getElementById('displayActiveArea').innerText = areaName;
  renderFeed();
}

/* --- FEED & NEARBY PEOPLE (SCREEN 4) --- */
function renderFeed() {
  const feedContainer = document.getElementById('nearbyFeed');
  feedContainer.innerHTML = '';

  const zoneUsers = MOCK_USERS.filter(u => u.area === appState.currentArea);

  if (zoneUsers.length === 0) {
    feedContainer.innerHTML = `
      <div class="glass-card" style="text-align: center; padding: 40px 20px;">
        <span style="font-size: 36px;">🌌</span>
        <h4 style="margin-top: 10px;">Quiet Zone</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">
          No other active vibes found in ${appState.currentArea} right now. Try switching broad areas!
        </p>
      </div>
    `;
    return;
  }

  zoneUsers.forEach(user => {
    const isSent = appState.interestedSent.includes(user.id);
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
      <div class="user-card-header">
        <div class="anon-badge">
          <div class="anon-avatar">🕵️</div>
          <span>Someone nearby</span>
        </div>
        <span class="user-status">${user.status}</span>
      </div>
      <p class="user-activity">"${user.activity}"</p>
      <div class="tags-container">
        ${user.interests.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <button class="btn ${isSent ? 'btn-outline' : 'btn-primary'} btn-block btn-sm" ${isSent ? 'disabled' : ''} onclick="sendInterest('${user.id}')">
        ${isSent ? 'Signal Sent ✓' : 'Interested'}
      </button>
    `;
    feedContainer.appendChild(card);
  });
}

/* --- INTEREST SENT & SIMULATION (SCREEN 5 & 6) --- */
window.sendInterest = function(targetId) {
  if (!appState.interestedSent.includes(targetId)) {
    appState.interestedSent.push(targetId);
    localStorage.setItem('vibe_sent', JSON.stringify(appState.interestedSent));
  }

  const targetUser = MOCK_USERS.find(u => u.id === targetId);

  // Setup Demo Simulation Flow (Screen 5)
  document.getElementById('simulateMatchBtn').onclick = () => {
    simulateIncomingNotification(targetUser);
  };

  document.getElementById('continueExploringBtn').onclick = () => {
    renderFeed();
    navigateToScreen('screen-nearby');
  };

  navigateToScreen('screen-interest-sent');
};

function simulateIncomingNotification(senderUser) {
  appState.incomingNotification = senderUser;
  document.getElementById('notifBadge').classList.remove('hidden');

  const container = document.getElementById('notificationDetails');
  container.innerHTML = `
    <div style="font-size: 32px; margin-bottom: 8px;">📡</div>
    <h4 style="font-size: 16px; margin-bottom: 6px;">Anonymous Signal Received</h4>
    <p style="font-size: 13px; color: var(--text-muted);">Someone in <strong>${senderUser.area}</strong> is interested in your vibe!</p>
    <div class="tags-container" style="justify-content: center; margin-top: 12px;">
      ${senderUser.interests.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
  `;

  // Bind notification screen action buttons (Screen 6)
  document.getElementById('acceptInterestBtn').onclick = () => {
    triggerMutualMatch(senderUser);
  };

  document.getElementById('declineInterestBtn').onclick = () => {
    appState.incomingNotification = null;
    showToast('Signal declined anonymously.');
    navigateToScreen('screen-nearby');
  };

  showToast('Demo Alert: New incoming vibe signal!');
  navigateToScreen('screen-notification');
}

/* --- MUTUAL MATCH (SCREEN 7) --- */
function triggerMutualMatch(matchedUser) {
  appState.mutualMatch = matchedUser;
  appState.incomingNotification = null;

  const card = document.getElementById('matchSummaryCard');
  card.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <span style="font-size: 36px;">🤝</span>
      <h3 style="font-size: 18px; margin-top: 6px;">Connected in ${matchedUser.area}</h3>
    </div>
    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; text-align: center;">
      You both share an interest in exploring broad activities nearby without revealing personal identity.
    </p>
    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 12px;">
      <span style="font-size: 11px; font-weight: 700; color: var(--accent-blue);">SHARED INTEREST TAGS</span>
      <div class="tags-container" style="margin-top: 6px;">
        ${matchedUser.interests.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>
  `;

  document.getElementById('backToFeedFromMatchBtn').onclick = () => {
    renderFeed();
    navigateToScreen('screen-nearby');
  };

  navigateToScreen('screen-mutual-match');
}

/* --- PROFILE MANAGEMENT (SCREEN 8) --- */
function initProfilePage() {
  document.getElementById('addInterestBtn').addEventListener('click', () => {
    const input = document.getElementById('newInterestInput');
    const val = input.value.trim();
    if (val) {
      appState.interests.push(val);
      localStorage.setItem('vibe_interests', JSON.stringify(appState.interests));
      input.value = '';
      updateProfileUI();
      showToast('New vibe tag added!');
    }
  });

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('Reset local session data and clear stored matches?')) {
      localStorage.clear();
      appState.interestedSent = [];
      appState.userAnonId = 'VIBE-' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('vibe_id', appState.userAnonId);
      showToast('Session reset successfully.');
      updateProfileUI();
      renderFeed();
      navigateToScreen('screen-welcome');
    }
  });
}

function updateProfileUI() {
  document.getElementById('userAnonId').innerText = appState.userAnonId;
  document.getElementById('userCurrentArea').innerText = appState.currentArea;

  const list = document.getElementById('userInterestsList');
  list.innerHTML = '';
  appState.interests.forEach((tag, idx) => {
    const chip = document.createElement('span');
    chip.className = 'tag';
    chip.style.cursor = 'pointer';
    chip.innerText = `${tag} ×`;
    chip.onclick = () => {
      appState.interests.splice(idx, 1);
      localStorage.setItem('vibe_interests', JSON.stringify(appState.interests));
      updateProfileUI();
    };
    list.appendChild(chip);
  });
}

/* --- SAFETY & PRIVACY (SCREEN 9) --- */
function initSafetyPage() {
  document.getElementById('simulateBlockBtn').addEventListener('click', () => {
    showToast('Demo User blocked & reported to broad area moderators.');
  });
}

/* --- UTILITY: TOAST NOTIFICATIONS --- */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
