// src/control/control.js
// Logic for the Pandu Control Center window.

const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const hideWindowBtn = document.getElementById('hide-window-btn');

// Home Tab Elements
const homePersonalityBadge = document.getElementById('home-personality-badge');
const homePetEmoji = document.getElementById('home-pet-emoji');
const homePetTitle = document.getElementById('home-pet-title');
const homePetEmotion = document.getElementById('home-pet-emotion');
const homeFeedBtn = document.getElementById('home-feed-btn');
const homePetBtn = document.getElementById('home-pet-btn');
const neglectStatusText = document.getElementById('neglect-status-text');

const barHunger = document.getElementById('bar-hunger');
const valHunger = document.getElementById('val-hunger');
const barEnergy = document.getElementById('bar-energy');
const valEnergy = document.getElementById('val-energy');
const barMood = document.getElementById('bar-mood');
const valMood = document.getElementById('val-mood');
const barAffection = document.getElementById('bar-affection');
const valAffection = document.getElementById('val-affection');

// Personality Tab Elements
const personalityLockBadge = document.getElementById('personality-lock-badge');
const whySwitchedText = document.getElementById('why-switched-text');
const resumeAutoBtn = document.getElementById('resume-auto-btn');
const personalitiesContainer = document.getElementById('personalities-container');

// Settings Elements
const settingAutolaunch = document.getElementById('setting-autolaunch');
const settingMute = document.getElementById('setting-mute');
const settingFocusMode = document.getElementById('setting-focus-mode');
const settingFastTime = document.getElementById('setting-fast-time');

// Positioning Settings Elements (Sprint 6)
const posModeSelect = document.getElementById('pos-mode-select');
const posActiveApp = document.getElementById('pos-active-app');
const rememberSpotBtn = document.getElementById('remember-spot-btn');
const savedSpotsList = document.getElementById('saved-spots-list');
const settingHideFullscreen = document.getElementById('setting-hide-fullscreen');
const settingFollowMonitor = document.getElementById('setting-follow-monitor');

// Todo & Productivity Elements (Sprint 7)
const ctrlTodoList = document.getElementById('ctrl-todo-list');
const todoStatsBadge = document.getElementById('todo-stats-badge');
const filterCountText = document.getElementById('filter-count-text');
const ctrlNewTodoBtn = document.getElementById('ctrl-new-todo-btn');
const ctrlVoiceBtn = document.getElementById('ctrl-voice-btn');
const filterPills = document.querySelectorAll('.filter-pill');

const ctrlTaskModal = document.getElementById('ctrl-task-modal');
const modalTaskId = document.getElementById('modal-task-id');
const modalTaskTitleHeading = document.getElementById('modal-task-title-heading');
const modalTaskTitleInput = document.getElementById('modal-task-title-input');
const modalTaskDueInput = document.getElementById('modal-task-due-input');
const modalTaskPrioritySelect = document.getElementById('modal-task-priority-select');
const modalTaskSaveBtn = document.getElementById('modal-task-save-btn');
const modalTaskCancelBtn = document.getElementById('modal-task-cancel-btn');
const modalTaskClose = document.getElementById('modal-task-close');

const ctrlVoiceBanner = document.getElementById('ctrl-voice-banner');
const ctrlVoiceStatus = document.getElementById('ctrl-voice-status');
const ctrlVoiceTimer = document.getElementById('ctrl-voice-timer');
const ctrlBtnStopVoice = document.getElementById('ctrl-btn-stop-voice');

const ctrlDraftCard = document.getElementById('ctrl-draft-card');
const ctrlDraftTitle = document.getElementById('ctrl-draft-title');
const ctrlDraftDue = document.getElementById('ctrl-draft-due');
const ctrlDraftPriority = document.getElementById('ctrl-draft-priority');
const ctrlDraftSaveBtn = document.getElementById('ctrl-draft-save-btn');
const ctrlDraftDiscardBtn = document.getElementById('ctrl-draft-discard-btn');

const settingBreakThreshold = document.getElementById('setting-break-threshold');
const typingSessionStat = document.getElementById('typing-session-stat');
const settingShortenTimers = document.getElementById('setting-shorten-timers');

let currentTodoFilter = 'all';
let isCtrlRecording = false;
let ctrlMediaRecorder = null;
let ctrlAudioChunks = [];
let ctrlRecordingTimer = null;
let ctrlRecordingSeconds = 0;

// Style Tab Elements (Sprint 8)
const styleCardsContainer = document.getElementById('style-cards-container');
const stylePreviewGrid = document.getElementById('style-preview-grid');
const currentStyleBadge = document.getElementById('current-style-badge');
const previewSizeBtns = document.querySelectorAll('.preview-size-btn');

let currentActiveStyle = 'official-sticker';
let currentPreviewStyle = 'official-sticker';
let currentPreviewSize = 'large';

// AI Settings Elements (Sprint 5)
const aiStatusBadge = document.getElementById('ai-status-badge');
const aiModelSelect = document.getElementById('ai-model-select');
const customModelInput = document.getElementById('custom-model-input');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');
const testKeyBtn = document.getElementById('test-key-btn');
const clearKeyBtn = document.getElementById('clear-key-btn');
const keyStatusMsg = document.getElementById('key-status-msg');
const statDaily = document.getElementById('stat-daily');
const statMin = document.getElementById('stat-min');
const statCooldown = document.getElementById('stat-cooldown');
const payloadDisplay = document.getElementById('payload-display');
const refreshPayloadBtn = document.getElementById('refresh-payload-btn');

// ---------------- Tab Navigation ----------------
function switchTab(tabName) {
  const targetTabId = `tab-${tabName}`;
  navTabs.forEach((t) => {
    if (t.dataset.tab === tabName) t.classList.add('active');
    else t.classList.remove('active');
  });
  tabContents.forEach((c) => {
    if (c.id === targetTabId) c.classList.add('active');
    else c.classList.remove('active');
  });
  if (tabName === 'todo') {
    renderTodos();
  }
  if (tabName === 'style') {
    renderStyleCards();
    renderPreviewGrid(currentPreviewSize);
  }
}

navTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

hideWindowBtn.addEventListener('click', () => {
  window.pandaApi.hideControlWindow();
});

// ---------------- Home Tab Actions ----------------
homeFeedBtn.addEventListener('click', () => {
  window.pandaApi.feed();
});

homePetBtn.addEventListener('click', () => {
  window.pandaApi.pet();
});

// ---------------- Personality Rendering ----------------
function renderPersonalities(personalityStatus) {
  if (!personalityStatus) return;

  const currentId = personalityStatus.currentPersonalityId;
  const isLocked = personalityStatus.isManualLock;
  const remainingMins = personalityStatus.manualLockRemainingMinutes;

  if (isLocked) {
    personalityLockBadge.textContent = `Locked (${remainingMins}m left)`;
    personalityLockBadge.style.color = '#ffa502';
    personalityLockBadge.style.background = 'rgba(255, 165, 2, 0.15)';
    resumeAutoBtn.classList.remove('hidden');
  } else {
    personalityLockBadge.textContent = 'Auto-Switch Active';
    personalityLockBadge.style.color = '#2ed573';
    personalityLockBadge.style.background = 'rgba(46, 213, 115, 0.15)';
    resumeAutoBtn.classList.add('hidden');
  }

  whySwitchedText.textContent = personalityStatus.lastSwitchReason || 'Active companion.';

  const list = personalityStatus.availablePersonalities || [];
  personalitiesContainer.innerHTML = '';

  list.forEach((p) => {
    const card = document.createElement('div');
    const isActive = p.id === currentId;
    card.className = `personality-card ${isActive ? 'active' : ''}`;

    card.innerHTML = `
      <div class="p-meta">
        <span class="p-emoji">${p.emoji}</span>
        <div class="p-info">
          <h4>${p.name}</h4>
          <p>${p.description}</p>
        </div>
      </div>
      <button class="select-p-btn" data-id="${p.id}">
        ${isActive ? 'Active' : 'Select (Lock 2h)'}
      </button>
    `;

    const selectBtn = card.querySelector('.select-p-btn');
    if (!isActive) {
      selectBtn.addEventListener('click', async () => {
        const updated = await window.pandaApi.setPersonality(p.id, 2);
        renderPersonalities(updated);
      });
    }

    personalitiesContainer.appendChild(card);
  });
}

resumeAutoBtn.addEventListener('click', async () => {
  const updated = await window.pandaApi.resumeAutoSwitch();
  renderPersonalities(updated);
});

// ---------------- Visual Styles Rendering (Sprint 8) ----------------
async function renderStyleCards() {
  if (!styleCardsContainer) return;
  const styles = (window.pandaApi.getAvailableStyles && window.pandaApi.getAvailableStyles()) || [];

  if (currentStyleBadge) {
    const activeObj = styles.find((s) => s.id === currentActiveStyle);
    currentStyleBadge.textContent = activeObj ? activeObj.name : currentActiveStyle;
  }

  styleCardsContainer.innerHTML = '';
  styles.forEach((s) => {
    const isActive = s.id === currentActiveStyle;
    const isPreviewing = s.id === currentPreviewStyle;

    const card = document.createElement('div');
    card.className = `style-card ${isActive ? 'active' : ''} ${isPreviewing ? 'previewing' : ''}`;

    let emoji = '🐼';
    let badgeText = 'ASCII Retro';
    if (s.id === 'cute-anime') {
      emoji = '🌸';
      badgeText = 'Pastel Chibi';
    } else if (s.id === 'chunky-robot') {
      emoji = '🤖';
      badgeText = 'Cyber LED';
    } else if (s.id === 'official-sticker') {
      emoji = '🎋';
      badgeText = 'Official Stickers';
    }

    card.innerHTML = `
      <div class="style-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 22px;">${emoji}</span>
          <div>
            <h3 style="margin: 0; font-size: 14px; font-weight: 600;">${s.name}</h3>
            <span class="style-type-badge">${badgeText}</span>
          </div>
        </div>
        ${isActive ? '<span class="pill-active">Active</span>' : `<button class="select-style-btn" data-id="${s.id}">Select</button>`}
      </div>
      <p style="margin: 10px 0 12px 0; font-size: 11.5px; color: #94a3b8; line-height: 1.4;">${s.desc}</p>
      <div class="style-card-actions">
        <button class="preview-style-btn ${isPreviewing ? 'active' : ''}" data-preview-id="${s.id}">
          ${isPreviewing ? '👁️ Viewing Preview' : '👁️ Preview Looks'}
        </button>
      </div>
    `;

    const selectBtn = card.querySelector('.select-style-btn');
    if (selectBtn) {
      selectBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.pandaApi.setStyle(s.id);
        currentActiveStyle = s.id;
        currentPreviewStyle = s.id;
        renderStyleCards();
        renderPreviewGrid(currentPreviewSize);
      });
    }

    const previewBtn = card.querySelector('.preview-style-btn');
    if (previewBtn) {
      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentPreviewStyle = s.id;
        renderStyleCards();
        renderPreviewGrid(currentPreviewSize);
      });
    }

    card.addEventListener('click', () => {
      currentPreviewStyle = s.id;
      renderStyleCards();
      renderPreviewGrid(currentPreviewSize);
    });

    styleCardsContainer.appendChild(card);
  });
}

function renderPreviewGrid(size = 'large') {
  if (!stylePreviewGrid) return;
  stylePreviewGrid.innerHTML = '';

  const EMOTIONS = [
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'sleepy', label: 'Sleepy', emoji: '💤' },
    { id: 'angry', label: 'Angry', emoji: '💢' },
    { id: 'hungry', label: 'Hungry', emoji: '🍙' },
    { id: 'neglected', label: 'Neglected', emoji: '🥺' },
    { id: 'blinking', label: 'Blinking', emoji: '👀' },
    { id: 'typing', label: 'Typing', emoji: '⌨️' },
    { id: 'eating', label: 'Eating', emoji: '🎋' },
    { id: 'petted', label: 'Petted', emoji: '🐾' }
  ];

  EMOTIONS.forEach((emo) => {
    const look = window.pandaApi.getLook(currentPreviewStyle, emo.id, size);
    const frame = (look && look.frames && look.frames.length > 0) ? look.frames[0] : '';
    const isDescriptor = typeof frame === 'object' && frame !== null && frame.type === 'image';
    const isSvg = typeof frame === 'string' && frame.trim().startsWith('<svg');

    const item = document.createElement('div');
    item.className = 'preview-grid-item';

    const header = document.createElement('div');
    header.className = 'preview-item-header';
    header.innerHTML = `<span class="preview-item-name">${emo.emoji} ${emo.label}</span><span class="preview-frames-badge">${(look && look.frames) ? look.frames.length : 1}f</span>`;
    item.appendChild(header);

    const artContainer = document.createElement('div');
    artContainer.className = `preview-art-box ${isDescriptor ? 'is-sticker' : isSvg ? 'is-svg' : 'is-ascii'} size-${size}`;
    if (isDescriptor) {
      const img = document.createElement('img');
      img.src = frame.src;
      img.alt = emo.label;
      img.style.width = (frame.w || 140) + 'px';
      img.style.height = (frame.h || 140) + 'px';
      img.style.objectFit = 'contain';
      const scale = frame.scale || 1.0;
      const offX = frame.offsetX || 0;
      const offY = frame.offsetY || 0;
      img.style.transform = `translate(${offX}px, ${offY}px) scale(${scale})`;
      img.style.transformOrigin = 'bottom center';
      artContainer.appendChild(img);
    } else if (isSvg) {
      artContainer.innerHTML = frame;
    } else {
      const pre = document.createElement('pre');
      pre.textContent = frame;
      artContainer.appendChild(pre);
    }
    item.appendChild(artContainer);

    stylePreviewGrid.appendChild(item);
  });
}

if (previewSizeBtns) {
  previewSizeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      previewSizeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentPreviewSize = btn.dataset.size || 'large';
      renderPreviewGrid(currentPreviewSize);
    });
  });
}

// ---------------- State Updates ----------------
function updateUIFromState(appState) {
  if (!appState) return;

  // Home Header
  const personality = appState.personality;
  if (personality) {
    homePersonalityBadge.textContent = `${personality.emoji || '🐼'} ${personality.name || 'Pandu'}`;
    homePetEmoji.textContent = personality.emoji || '🐼';
    homePetTitle.textContent = personality.name || 'Pandu';
  }

  homePetEmotion.innerHTML = `Feeling: <strong>${appState.currentEmotion || 'Happy'}</strong>`;

  // Needs Bars
  const needs = appState.needs;
  if (needs) {
    const h = Math.round(needs.hunger);
    const e = Math.round(needs.energy);
    const m = Math.round(needs.mood);
    const a = Math.round(needs.affection);

    barHunger.style.width = `${h}%`;
    valHunger.textContent = `${h}%`;

    barEnergy.style.width = `${e}%`;
    valEnergy.textContent = `${e}%`;

    barMood.style.width = `${m}%`;
    valMood.textContent = `${m}%`;

    barAffection.style.width = `${a}%`;
    valAffection.textContent = `${a}%`;

    // Neglect Status
    if (needs.isRefusingFood) {
      neglectStatusText.textContent = `Stage 4 Neglect: Pandu is refusing bamboo! Give ~15 pets to restore trust.`;
      neglectStatusText.style.color = '#ff4757';
    } else if (needs.shrinkStage > 0) {
      neglectStatusText.textContent = `Stage ${needs.shrinkStage} Neglect: Pandu has shrunk from lack of interaction.`;
      neglectStatusText.style.color = '#ffa502';
    } else {
      neglectStatusText.textContent = 'Pandu is healthy, well-loved, and at full size (Stage 0).';
      neglectStatusText.style.color = '#2ed573';
    }
  }

  // Settings
  settingMute.checked = Boolean(appState.isMuted);
  settingFocusMode.checked = Boolean(appState.isFocusMode);
  settingFastTime.checked = Number(appState.timeMultiplier) > 1;
  settingAutolaunch.checked = Boolean(appState.startWithWindows);

  // Positioning Settings (Sprint 6)
  if (appState.activeAppName && posActiveApp) {
    posActiveApp.textContent = appState.activeAppName;
  }
  if (appState.positioningMode && posModeSelect) {
    posModeSelect.value = appState.positioningMode;
  }
  if (appState.hideOnFullscreen !== undefined && settingHideFullscreen) {
    settingHideFullscreen.checked = Boolean(appState.hideOnFullscreen);
  }
  if (appState.followActiveMonitor !== undefined && settingFollowMonitor) {
    settingFollowMonitor.checked = Boolean(appState.followActiveMonitor);
  }
  if (appState.perAppSpots) {
    renderSavedSpots(appState.perAppSpots);
  }

  // Visual Styles (Sprint 8)
  if (appState.style) {
    if (currentActiveStyle !== appState.style) {
      currentActiveStyle = appState.style;
      currentPreviewStyle = appState.style;
      renderStyleCards();
      renderPreviewGrid(currentPreviewSize);
    }
  }
}

// ---------------- Settings Listeners ----------------
settingMute.addEventListener('change', async (e) => {
  await window.pandaApi.toggleMute(e.target.checked);
});

settingFocusMode.addEventListener('change', async (e) => {
  await window.pandaApi.toggleFocusMode(e.target.checked);
});

settingFastTime.addEventListener('change', async (e) => {
  const mult = e.target.checked ? 60 : 1;
  await window.pandaApi.setTimeMultiplier(mult);
});

settingAutolaunch.addEventListener('change', async (e) => {
  await window.pandaApi.setAutoLaunch(e.target.checked);
});

// ---------------- Smart Positioning Handlers (Sprint 6) ----------------
function renderSavedSpots(spots) {
  if (!savedSpotsList) return;
  savedSpotsList.innerHTML = '';

  const entries = Object.entries(spots || {});
  if (entries.length === 0) {
    savedSpotsList.innerHTML = '<span style="font-size: 11px; color: #64748b;">No per-app spots saved yet.</span>';
    return;
  }

  entries.forEach(([appName, pos]) => {
    const item = document.createElement('div');
    item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 4px 8px; font-size: 11px;';

    const info = document.createElement('span');
    info.style.color = '#cbd5e1';
    info.textContent = `💻 ${appName}: (${pos.x}, ${pos.y})`;

    const forgetBtn = document.createElement('button');
    forgetBtn.className = 'tiny-btn';
    forgetBtn.style.cssText = 'background: rgba(255,71,87,0.15); border: 1px solid rgba(255,71,87,0.3); color: #ff6b81; padding: 2px 6px; border-radius: 4px; font-size: 10px; cursor: pointer;';
    forgetBtn.textContent = 'Forget';
    forgetBtn.addEventListener('click', async () => {
      await window.pandaApi.forgetAppSpot(appName);
      await updatePositioningUI();
    });

    item.appendChild(info);
    item.appendChild(forgetBtn);
    savedSpotsList.appendChild(item);
  });
}

async function updatePositioningUI() {
  try {
    const status = await window.pandaApi.getPositionStatus();
    if (!status) return;

    if (posModeSelect && status.mode) {
      posModeSelect.value = status.mode;
    }
    if (posActiveApp) {
      posActiveApp.textContent = status.activeAppName || 'None';
    }
    if (settingHideFullscreen) {
      settingHideFullscreen.checked = Boolean(status.hideOnFullscreen);
    }
    if (settingFollowMonitor) {
      settingFollowMonitor.checked = Boolean(status.followActiveMonitor);
    }
    renderSavedSpots(status.perAppSpots);
  } catch (err) {
    console.error('Failed to get position status:', err);
  }
}

if (posModeSelect) {
  posModeSelect.addEventListener('change', async (e) => {
    await window.pandaApi.setPositionMode(e.target.value);
    await updatePositioningUI();
  });
}

if (rememberSpotBtn) {
  rememberSpotBtn.addEventListener('click', async () => {
    await window.pandaApi.rememberCurrentAppSpot();
    await updatePositioningUI();
  });
}

if (settingHideFullscreen) {
  settingHideFullscreen.addEventListener('change', async (e) => {
    await window.pandaApi.setHideFullscreen(e.target.checked);
    await updatePositioningUI();
  });
}

if (settingFollowMonitor) {
  settingFollowMonitor.addEventListener('change', async (e) => {
    await window.pandaApi.setFollowMonitor(e.target.checked);
    await updatePositioningUI();
  });
}

// ---------------- Productivity & Todo Management (Sprint 7) ----------------
async function renderTodos() {
  if (!ctrlTodoList) return;
  try {
    const todos = await window.pandaApi.getTodos(currentTodoFilter);
    const stats = await window.pandaApi.getTodoStats();

    if (todoStatsBadge && stats) {
      todoStatsBadge.textContent = `${stats.pending} Pending / ${stats.done} Done`;
    }

    if (filterCountText) {
      filterCountText.textContent = `Showing ${todos.length} ${currentTodoFilter} task${todos.length === 1 ? '' : 's'}`;
    }

    ctrlTodoList.innerHTML = '';

    if (!todos || todos.length === 0) {
      ctrlTodoList.innerHTML = `
        <div class="todo-empty-state">
          <span>No ${currentTodoFilter === 'all' ? '' : currentTodoFilter} tasks found.</span>
          <div style="margin-top: 8px;">
            <button class="action-btn pet-btn" id="empty-add-btn" style="display: inline-block; width: auto; padding: 4px 10px; font-size: 11px;">+ Add a Task</button>
          </div>
        </div>`;
      const emptyAddBtn = document.getElementById('empty-add-btn');
      if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => openNewTaskModal());
      return;
    }

    todos.forEach((task) => {
      const item = document.createElement('div');
      item.className = `todo-item ${task.done ? 'done' : ''}`;

      // Left: Checkbox + Title + Meta
      const left = document.createElement('div');
      left.className = 'todo-left';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'todo-checkbox';
      cb.checked = Boolean(task.done);
      cb.title = task.done ? 'Mark as pending' : 'Mark as completed';
      cb.addEventListener('change', async () => {
        await window.pandaApi.toggleTodo(task.id);
        renderTodos();
      });

      const info = document.createElement('div');
      info.className = 'todo-info';

      const title = document.createElement('div');
      title.className = 'todo-title';
      title.textContent = task.title;

      const meta = document.createElement('div');
      meta.className = 'todo-meta';

      // Due date formatting
      if (task.dueDate) {
        const dueBadge = document.createElement('span');
        dueBadge.className = 'due-badge';

        const dueDateObj = new Date(task.dueDate);
        const now = Date.now();
        const diffHours = (dueDateObj.getTime() - now) / 3600000;

        const dateStr = dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const timeStr = dueDateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        if (!task.done && dueDateObj.getTime() < now) {
          dueBadge.classList.add('due-overdue');
          dueBadge.textContent = `⚠️ Overdue (${dateStr} ${timeStr})`;
        } else if (!task.done && diffHours <= 24 && diffHours >= 0) {
          dueBadge.classList.add('due-today');
          dueBadge.textContent = `⏱️ Today at ${timeStr}`;
        } else {
          dueBadge.classList.add('due-upcoming');
          dueBadge.textContent = `📅 ${dateStr} ${timeStr}`;
        }
        meta.appendChild(dueBadge);
      } else {
        const noDue = document.createElement('span');
        noDue.className = 'due-badge due-none';
        noDue.textContent = 'No deadline';
        meta.appendChild(noDue);
      }

      // Priority pill
      const prio = document.createElement('span');
      const p = (task.priority || 'medium').toLowerCase();
      prio.className = `priority-pill priority-${p}`;
      prio.textContent = p;
      meta.appendChild(prio);

      info.appendChild(title);
      info.appendChild(meta);

      left.appendChild(cb);
      left.appendChild(info);

      // Right: Actions (Edit, Delete)
      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'todo-btn-icon';
      editBtn.textContent = '✏️';
      editBtn.title = 'Edit Task';
      editBtn.addEventListener('click', () => {
        openNewTaskModal(task);
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'todo-btn-icon delete';
      delBtn.textContent = '🗑️';
      delBtn.title = 'Delete Task';
      delBtn.addEventListener('click', async () => {
        await window.pandaApi.deleteTodo(task.id);
        renderTodos();
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(left);
      item.appendChild(actions);

      ctrlTodoList.appendChild(item);
    });
  } catch (err) {
    console.error('Failed to render todos:', err);
  }
}

// Filter pills
filterPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    filterPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    currentTodoFilter = pill.dataset.filter || 'all';
    renderTodos();
  });
});

// Modal open / close
function openNewTaskModal(task = null) {
  if (!ctrlTaskModal) return;
  if (task) {
    modalTaskId.value = task.id;
    modalTaskTitleHeading.textContent = 'Edit Task';
    modalTaskTitleInput.value = task.title || '';
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const pad = n => String(n).padStart(2, '0');
      modalTaskDueInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } else {
      modalTaskDueInput.value = '';
    }
    modalTaskPrioritySelect.value = (task.priority || 'medium').toLowerCase();
  } else {
    modalTaskId.value = '';
    modalTaskTitleHeading.textContent = 'New Task';
    modalTaskTitleInput.value = '';
    modalTaskDueInput.value = '';
    modalTaskPrioritySelect.value = 'medium';
  }
  ctrlTaskModal.classList.remove('hidden');
  setTimeout(() => modalTaskTitleInput.focus(), 60);
}

function closeTaskModal() {
  if (ctrlTaskModal) ctrlTaskModal.classList.add('hidden');
}

if (ctrlNewTodoBtn) {
  ctrlNewTodoBtn.addEventListener('click', () => openNewTaskModal());
}

if (modalTaskCancelBtn) {
  modalTaskCancelBtn.addEventListener('click', closeTaskModal);
}

if (modalTaskClose) {
  modalTaskClose.addEventListener('click', closeTaskModal);
}

// Click backdrop to close modal
if (ctrlTaskModal) {
  ctrlTaskModal.addEventListener('click', (e) => {
    if (e.target === ctrlTaskModal) {
      closeTaskModal();
    }
  });
}

// Escape key closes task modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ctrlTaskModal && !ctrlTaskModal.classList.contains('hidden')) {
    closeTaskModal();
  }
});

if (modalTaskSaveBtn) {
  modalTaskSaveBtn.addEventListener('click', async () => {
    const title = modalTaskTitleInput ? modalTaskTitleInput.value.trim() : '';
    if (!title) {
      if (modalTaskTitleInput) {
        modalTaskTitleInput.style.borderColor = '#ff4757';
        modalTaskTitleInput.focus();
        setTimeout(() => { if (modalTaskTitleInput) modalTaskTitleInput.style.borderColor = ''; }, 1500);
      }
      return;
    }

    const id = modalTaskId ? modalTaskId.value : '';
    let dueDate = null;
    if (modalTaskDueInput && modalTaskDueInput.value) {
      const d = new Date(modalTaskDueInput.value);
      if (!isNaN(d.getTime())) {
        dueDate = d.toISOString();
      }
    }
    const priority = (modalTaskPrioritySelect && modalTaskPrioritySelect.value) || 'medium';

    try {
      if (id) {
        await window.pandaApi.updateTodo(id, { title, dueDate, priority });
      } else {
        await window.pandaApi.addTodo({ title, dueDate, priority });
      }

      closeTaskModal();
      await renderTodos();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  });
}

if (modalTaskTitleInput) {
  modalTaskTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (modalTaskSaveBtn) modalTaskSaveBtn.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeTaskModal();
    }
  });
}

if (modalTaskDueInput) {
  modalTaskDueInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (modalTaskSaveBtn) modalTaskSaveBtn.click();
    }
  });
}

// ---------------- Control Window Voice Task Creation ----------------
async function startCtrlVoiceRecording() {
  try {
    const aiStatus = await window.pandaApi.getAiStatus();
    if (!aiStatus || !aiStatus.hasKey || !aiStatus.isOnline) {
      alert("Voice tasks require Gemini API to be configured and online. Opening manual task add instead!");
      openNewTaskModal();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ctrlAudioChunks = [];
    ctrlMediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

    ctrlMediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        ctrlAudioChunks.push(e.data);
      }
    };

    ctrlMediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      if (ctrlRecordingTimer) clearInterval(ctrlRecordingTimer);

      if (ctrlAudioChunks.length === 0) {
        closeCtrlVoiceBanner();
        return;
      }

      ctrlVoiceStatus.textContent = 'Extracting task with Gemini... ⏳';
      ctrlBtnStopVoice.disabled = true;

      const audioBlob = new Blob(ctrlAudioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        try {
          const res = await window.pandaApi.extractVoiceTask({
            base64Audio: base64Data,
            mimeType: 'audio/webm'
          });

          closeCtrlVoiceBanner();

          if (res && res.success && res.tasks && res.tasks.length > 0) {
            openCtrlDraftCard(res.tasks[0]);
          } else {
            alert("Could not extract task from audio. Please add manually.");
            openNewTaskModal();
          }
        } catch (err) {
          closeCtrlVoiceBanner();
          alert("Error extracting task: " + err.message);
          openNewTaskModal();
        }
      };
      reader.readAsDataURL(audioBlob);
    };

    ctrlMediaRecorder.start();
    isCtrlRecording = true;
    ctrlVoiceBanner.classList.remove('hidden');
    ctrlVoiceStatus.textContent = 'Listening... Speak your task!';
    ctrlBtnStopVoice.disabled = false;
    ctrlBtnStopVoice.textContent = '⏹️ Done Speaking';

    ctrlRecordingSeconds = 0;
    ctrlVoiceTimer.textContent = '0:00 (Click done when finished)';
    ctrlRecordingTimer = setInterval(() => {
      ctrlRecordingSeconds++;
      const m = Math.floor(ctrlRecordingSeconds / 60);
      const s = ctrlRecordingSeconds % 60;
      ctrlVoiceTimer.textContent = `${m}:${s < 10 ? '0' : ''}${s} (Click done when finished)`;
      if (ctrlRecordingSeconds >= 15) {
        stopCtrlVoiceRecording();
      }
    }, 1000);
  } catch (err) {
    console.error('Microphone access failed in control window:', err);
    alert("Microphone access failed. Please ensure microphone permissions are allowed in Windows settings.");
    openNewTaskModal();
  }
}

function stopCtrlVoiceRecording() {
  if (ctrlMediaRecorder && ctrlMediaRecorder.state !== 'inactive') {
    ctrlMediaRecorder.stop();
  }
  isCtrlRecording = false;
}

function closeCtrlVoiceBanner() {
  if (ctrlVoiceBanner) ctrlVoiceBanner.classList.add('hidden');
  isCtrlRecording = false;
  if (ctrlRecordingTimer) clearInterval(ctrlRecordingTimer);
}

if (ctrlVoiceBtn) {
  ctrlVoiceBtn.addEventListener('click', () => {
    if (isCtrlRecording) {
      stopCtrlVoiceRecording();
    } else {
      startCtrlVoiceRecording();
    }
  });
}

if (ctrlBtnStopVoice) {
  ctrlBtnStopVoice.addEventListener('click', () => {
    stopCtrlVoiceRecording();
  });
}

// ---------------- Control Window Draft Card ----------------
function openCtrlDraftCard(task) {
  if (!ctrlDraftCard) return;
  ctrlDraftTitle.value = task.title || '';
  if (task.due) {
    try {
      const d = new Date(task.due);
      const pad = n => String(n).padStart(2, '0');
      ctrlDraftDue.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      ctrlDraftDue.value = '';
    }
  } else {
    ctrlDraftDue.value = '';
  }
  ctrlDraftPriority.value = (task.priority || 'medium').toLowerCase();
  ctrlDraftCard.classList.remove('hidden');
}

function closeCtrlDraftCard() {
  if (ctrlDraftCard) ctrlDraftCard.classList.add('hidden');
}

if (ctrlDraftSaveBtn) {
  ctrlDraftSaveBtn.addEventListener('click', async () => {
    const title = ctrlDraftTitle ? ctrlDraftTitle.value.trim() : '';
    if (!title) {
      if (ctrlDraftTitle) {
        ctrlDraftTitle.style.borderColor = '#ff4757';
        ctrlDraftTitle.focus();
        setTimeout(() => { if (ctrlDraftTitle) ctrlDraftTitle.style.borderColor = ''; }, 1500);
      }
      return;
    }

    let dueDate = null;
    if (ctrlDraftDue && ctrlDraftDue.value) {
      const d = new Date(ctrlDraftDue.value);
      if (!isNaN(d.getTime())) {
        dueDate = d.toISOString();
      }
    }
    const priority = (ctrlDraftPriority && ctrlDraftPriority.value) || 'medium';

    try {
      await window.pandaApi.addTodo({ title, dueDate, priority });
      closeCtrlDraftCard();
      await renderTodos();
    } catch (err) {
      console.error('Failed to save draft task:', err);
    }
  });
}

if (ctrlDraftDiscardBtn) {
  ctrlDraftDiscardBtn.addEventListener('click', () => {
    closeCtrlDraftCard();
  });
}

// ---------------- Productivity Settings (Sprint 7) ----------------
async function updateProductivitySettingsUI() {
  try {
    const status = await window.pandaApi.getProductivityStatus();
    if (!status) return;

    if (settingBreakThreshold && status.breakThresholdMinutes) {
      settingBreakThreshold.value = String(status.breakThresholdMinutes);
    }
    if (settingShortenTimers) {
      settingShortenTimers.checked = Boolean(status.shortenTimers);
    }
    if (typingSessionStat) {
      typingSessionStat.textContent = `${status.continuousTypingMinutes}m (Threshold: ${status.effectiveThresholdMinutes}m)`;
    }
  } catch (err) {
    console.error('Failed to update productivity settings UI:', err);
  }
}

if (settingBreakThreshold) {
  settingBreakThreshold.addEventListener('change', async (e) => {
    await window.pandaApi.setBreakThreshold(e.target.value);
    await updateProductivitySettingsUI();
  });
}

if (settingShortenTimers) {
  settingShortenTimers.addEventListener('change', async (e) => {
    await window.pandaApi.setShortenTimers(e.target.checked);
    await updateProductivitySettingsUI();
  });
}

// ---------------- AI Cloud Chat & Privacy Management (Sprint 5) ----------------
async function updateAiStatusUI() {
  try {
    const status = await window.pandaApi.getAiStatus();
    if (!status) return;

    if (aiStatusBadge) {
      if (status.hasKey && status.isOnline) {
        aiStatusBadge.textContent = 'AI: Online (Active)';
        aiStatusBadge.className = 'badge badge-online';
      } else if (status.hasKey && !status.isOnline) {
        aiStatusBadge.textContent = 'AI: Disconnected';
        aiStatusBadge.className = 'badge badge-offline';
      } else {
        aiStatusBadge.textContent = 'AI: Offline (No Key)';
        aiStatusBadge.className = 'badge badge-offline';
      }
    }

    if (status.model && aiModelSelect) {
      const known = ['gemini-3.1-flash-lite', 'gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      if (known.includes(status.model)) {
        aiModelSelect.value = status.model;
        if (customModelInput) customModelInput.classList.add('hidden');
      } else {
        aiModelSelect.value = 'custom';
        if (customModelInput) {
          customModelInput.classList.remove('hidden');
          customModelInput.value = status.model;
        }
      }
    }

    if (keyStatusMsg && !apiKeyInput.value) {
      if (status.hasKey) {
        keyStatusMsg.textContent = '🔒 Key is saved and encrypted at rest with safeStorage.';
        keyStatusMsg.style.color = '#2ed573';
      } else {
        keyStatusMsg.textContent = 'No key set. Using offline canned lines.';
        keyStatusMsg.style.color = '#747d8c';
      }
    }

    if (status.usage) {
      if (statDaily) {
        statDaily.textContent = `${status.usage.requestsToday} / ${status.usage.dailyLimit}`;
      }
      if (statMin) {
        statMin.textContent = `${status.usage.requestsThisMinute} / ${status.usage.maxPerMinute}`;
      }
      if (statCooldown) {
        if (status.usage.isBackingOff) {
          statCooldown.textContent = `Backing off (${status.usage.backoffSecondsRemaining}s)`;
          statCooldown.style.color = '#ff4757';
        } else if (status.usage.nextProactiveAvailableInSec > 0) {
          statCooldown.textContent = `${status.usage.nextProactiveAvailableInSec}s cooldown`;
          statCooldown.style.color = '#ffa502';
        } else {
          statCooldown.textContent = 'Ready';
          statCooldown.style.color = '#2ed573';
        }
      }
    }
  } catch (err) {
    console.error('Failed to update AI status:', err);
  }
}

async function refreshPayloadUI() {
  try {
    const payload = await window.pandaApi.getLastAiPayload();
    if (payloadDisplay) {
      payloadDisplay.textContent = JSON.stringify(payload, null, 2);
    }
  } catch (err) {
    console.error('Failed to get AI payload:', err);
  }
}

if (aiModelSelect) {
  aiModelSelect.addEventListener('change', async (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      if (customModelInput) {
        customModelInput.classList.remove('hidden');
        customModelInput.focus();
      }
    } else {
      if (customModelInput) customModelInput.classList.add('hidden');
      await window.pandaApi.setAiModel(val);
      await updateAiStatusUI();
    }
  });
}

if (customModelInput) {
  const saveCustomModel = async () => {
    const customVal = customModelInput.value.trim();
    if (customVal) {
      await window.pandaApi.setAiModel(customVal);
      await updateAiStatusUI();
    }
  };

  customModelInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCustomModel();
    }
  });
  customModelInput.addEventListener('blur', saveCustomModel);
}

if (apiKeyInput) {
  apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (saveKeyBtn) saveKeyBtn.click();
    }
  });
}

if (saveKeyBtn) {
  saveKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) return;
    await window.pandaApi.setApiKey(key);
    keyStatusMsg.textContent = '✅ API key encrypted & saved!';
    keyStatusMsg.style.color = '#2ed573';
    apiKeyInput.value = '';
    await updateAiStatusUI();
    await refreshPayloadUI();
  });
}

if (testKeyBtn) {
  testKeyBtn.addEventListener('click', async () => {
    keyStatusMsg.textContent = 'Testing connection to Gemini... ⏳';
    keyStatusMsg.style.color = '#ffa502';
    testKeyBtn.disabled = true;
    try {
      const res = await window.pandaApi.testAiConnection();
      if (res && res.success) {
        keyStatusMsg.textContent = `✅ ${res.message}`;
        keyStatusMsg.style.color = '#2ed573';
      } else {
        keyStatusMsg.textContent = `❌ ${res.message || 'Connection failed'}`;
        keyStatusMsg.style.color = '#ff4757';
      }
    } catch (err) {
      keyStatusMsg.textContent = `❌ Error: ${err.message}`;
      keyStatusMsg.style.color = '#ff4757';
    } finally {
      testKeyBtn.disabled = false;
      await updateAiStatusUI();
    }
  });
}

if (clearKeyBtn) {
  clearKeyBtn.addEventListener('click', async () => {
    await window.pandaApi.setApiKey('');
    apiKeyInput.value = '';
    keyStatusMsg.textContent = 'Key cleared. Running in offline canned mode.';
    keyStatusMsg.style.color = '#ff6b81';
    await updateAiStatusUI();
  });
}

if (refreshPayloadBtn) {
  refreshPayloadBtn.addEventListener('click', () => {
    refreshPayloadUI();
  });
}

// ---------------- Initialization ----------------
async function init() {
  try {
    const fullState = await window.pandaApi.getFullState();
    updateUIFromState(fullState);

    const personalityStatus = await window.pandaApi.getPersonalityStatus();
    renderPersonalities(personalityStatus);

    await updateAiStatusUI();
    await updatePositioningUI();
    await updateProductivitySettingsUI();
    await renderTodos();
    await renderStyleCards();
    renderPreviewGrid(currentPreviewSize);
    await refreshPayloadUI();
  } catch (err) {
    console.error('Failed to init control window:', err);
  }

  window.pandaApi.onStateChange((newState) => {
    updateUIFromState(newState);
  });

  window.pandaApi.onPersonalityChange((newPersonalityStatus) => {
    renderPersonalities(newPersonalityStatus);
  });

  if (window.pandaApi.onTodosChanged) {
    window.pandaApi.onTodosChanged(() => {
      renderTodos();
    });
  }

  if (window.pandaApi.onTriggerAddTodo) {
    window.pandaApi.onTriggerAddTodo(() => {
      switchTab('todo');
      openNewTaskModal();
    });
  }

  if (window.pandaApi.onTriggerVoiceTask) {
    window.pandaApi.onTriggerVoiceTask(() => {
      switchTab('todo');
      startCtrlVoiceRecording();
    });
  }

  // Tab navigation from main process (e.g. tray menu → "View Todo List")
  if (window.pandaApi.onTabNavigate) {
    window.pandaApi.onTabNavigate((tab) => {
      if (tab) switchTab(tab);
    });
  }

  // Periodic status poll (every 3s while open)
  setInterval(() => {
    updateAiStatusUI();
    updatePositioningUI();
    updateProductivitySettingsUI();
  }, 3000);
}

init();
