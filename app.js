// ========================================
// CloudStore - Premium App Store JS
// ========================================

// App State
const state = {
    apps: [],
    sources: [],
    filteredApps: [],
    currentCategory: 'all',
    currentTab: 'home',
    isLoading: true
};

// Default Sources
const DEFAULT_SOURCES = [
    { url: 'https://raw.githubusercontent.com/vizunchik/AltStoreRus/master/apps.json', name: 'AltStore RUS', type: 'altstore' },
    { url: 'https://ipa.cypwn.xyz/cypwn.json', name: 'Cypwn', type: 'custom' }
];

// DOM Elements
const elements = {
    app: document.getElementById('app'),
    bgCanvas: document.getElementById('bg-canvas'),
    searchInput: document.getElementById('searchInput'),
    searchClear: document.getElementById('searchClear'),
    loadingState: document.getElementById('loadingState'),
    appSections: document.getElementById('appSections'),
    searchResults: document.getElementById('searchResults'),
    searchResultsGrid: document.getElementById('searchResultsGrid'),
    noResults: document.getElementById('noResults'),
    allAppsGrid: document.getElementById('allAppsGrid'),
    categoryPills: document.getElementById('categoryPills'),
    totalApps: document.getElementById('totalApps'),
    totalSources: document.getElementById('totalSources'),
    
    // Modals
    appModal: document.getElementById('appModal'),
    modalContent: document.getElementById('modalContent'),
    modalClose: document.getElementById('modalClose'),
    sourceModal: document.getElementById('sourceModal'),
    sourceModalClose: document.getElementById('sourceModalClose'),
    sourceUrlInput: document.getElementById('sourceUrlInput'),
    addSourceSubmit: document.getElementById('addSourceSubmit'),
    addSourceBtn: document.getElementById('addSourceBtn'),
    addSourceFab: document.getElementById('addSourceFab'),
    
    // Tabs
    sourcesTab: document.getElementById('sourcesTab'),
    settingsTab: document.getElementById('settingsTab'),
    sourcesList: document.getElementById('sourcesList'),
    
    // Toast
    toast: document.getElementById('toast')
};

// ========================================
// 3D Background with WebGL
// ========================================
function init3DBackground() {
    const canvas = elements.bgCanvas;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    let orbs = [];
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    // Create floating orbs
    function createOrbs() {
        orbs = [];
        const orbCount = 5;
        const colors = [
            { r: 102, g: 126, b: 234, a: 0.3 },
            { r: 118, g: 75, b: 162, a: 0.25 },
            { r: 168, g: 85, b: 247, a: 0.2 },
            { r: 59, g: 130, b: 246, a: 0.25 },
            { r: 236, g: 72, b: 153, a: 0.2 }
        ];
        
        for (let i = 0; i < orbCount; i++) {
            orbs.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 100 + Math.random() * 200,
                color: colors[i % colors.length],
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    // Create small particles
    function createParticles() {
        particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.2,
                speedY: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0b0b0f');
        gradient.addColorStop(1, '#0e0e13');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Animate and draw orbs
        orbs.forEach((orb, index) => {
            orb.x += orb.speedX;
            orb.y += orb.speedY;
            orb.phase += 0.01;
            
            // Bounce off edges
            if (orb.x < -orb.radius) orb.x = width + orb.radius;
            if (orb.x > width + orb.radius) orb.x = -orb.radius;
            if (orb.y < -orb.radius) orb.y = height + orb.radius;
            if (orb.y > height + orb.radius) orb.y = -orb.radius;
            
            // Pulsing effect
            const pulseRadius = orb.radius + Math.sin(orb.phase) * 20;
            
            // Draw orb with radial gradient
            const orbGradient = ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, pulseRadius
            );
            orbGradient.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${orb.color.a})`);
            orbGradient.addColorStop(0.5, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${orb.color.a * 0.5})`);
            orbGradient.addColorStop(1, 'transparent');
            
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, pulseRadius, 0, Math.PI * 2);
            ctx.fillStyle = orbGradient;
            ctx.fill();
        });
        
        // Animate and draw particles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        particles.forEach(particle => {
            particle.y -= particle.speedY;
            
            if (particle.y < -10) {
                particle.y = height + 10;
                particle.x = Math.random() * width;
            }
            
            ctx.globalAlpha = particle.alpha;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        requestAnimationFrame(animate);
    }
    
    resize();
    createOrbs();
    createParticles();
    animate();
    
    window.addEventListener('resize', () => {
        resize();
        createOrbs();
        createParticles();
    });
}

// ========================================
// Source Format Detection & Normalization
// ========================================
function detectSourceFormat(data) {
    if (data.apps && Array.isArray(data.apps)) {
        // Check for AltStore format
        if (data.apps[0]?.bundleIdentifier || data.apps[0]?.bundleID) {
            return 'altstore';
        }
        // Check for GBox format
        if (data.apps[0]?.bundleid || data.apps[0]?.ipa) {
            return 'gbox';
        }
    }
    
    // Check for AppBox format
    if (data.AppStore && Array.isArray(data.AppStore)) {
        return 'appbox';
    }
    
    // Check for Cypwn/Custom format
    if (Array.isArray(data)) {
        return 'custom-array';
    }
    
    return 'unknown';
}

function normalizeApp(app, format, sourceName) {
    let normalized = {
        name: '',
        bundleID: '',
        version: '',
        versionDate: '',
        icon: '',
        ipa: '',
        description: '',
        screenshots: [],
        category: 'utilities',
        developer: '',
        size: '',
        source: sourceName
    };
    
    switch (format) {
        case 'altstore':
            normalized = {
                ...normalized,
                name: app.name || app.Name || '',
                bundleID: app.bundleIdentifier || app.bundleID || '',
                version: app.version || app.Version || '',
                versionDate: app.versionDate || '',
                icon: app.iconURL || app.icon || '',
                ipa: app.downloadURL || app.ipa || '',
                description: app.localizedDescription || app.description || '',
                screenshots: app.screenshotURLs || app.screenshots || [],
                category: categorizeApp(app.name || '', app.localizedDescription || ''),
                developer: app.developerName || app.developer || 'Unknown',
                size: app.size || ''
            };
            break;
            
        case 'gbox':
            normalized = {
                ...normalized,
                name: app.name || '',
                bundleID: app.bundleid || app.bundleID || '',
                version: app.version || '',
                versionDate: app.date || '',
                icon: app.icon || app.iconURL || '',
                ipa: app.ipa || app.downloadURL || '',
                description: app.description || '',
                screenshots: app.screenshots || [],
                category: categorizeApp(app.name || '', app.description || ''),
                developer: app.developer || app.author || 'Unknown',
                size: app.size || ''
            };
            break;
            
        case 'appbox':
            normalized = {
                ...normalized,
                name: app.AppName || app.name || '',
                bundleID: app.BundleID || app.bundleID || '',
                version: app.Version || app.version || '',
                icon: app.Icon || app.icon || '',
                ipa: app.IPA || app.ipa || '',
                description: app.Description || app.description || '',
                screenshots: app.Screenshots || [],
                category: categorizeApp(app.AppName || '', app.Description || ''),
                developer: app.Developer || 'Unknown',
                size: app.Size || ''
            };
            break;
            
        case 'custom-array':
            normalized = {
                ...normalized,
                name: app.name || app.appName || '',
                bundleID: app.bundleID || app.bundleId || app.bundle || '',
                version: app.version || '',
                icon: app.icon || app.iconURL || app.image || '',
                ipa: app.ipa || app.download || app.downloadURL || '',
                description: app.description || app.desc || '',
                screenshots: app.screenshots || [],
                category: categorizeApp(app.name || '', app.description || ''),
                developer: app.developer || app.author || 'Unknown',
                size: app.size || ''
            };
            break;
            
        default:
            normalized = {
                ...normalized,
                name: app.name || Object.values(app).find(v => typeof v === 'string') || 'Unknown App',
                bundleID: app.bundleID || app.bundle || '',
                version: app.version || '1.0',
                icon: app.icon || '',
                ipa: app.ipa || app.download || '',
                description: app.description || '',
                category: 'utilities',
                developer: 'Unknown'
            };
    }
    
    return normalized;
}

function categorizeApp(name, description) {
    const text = (name + ' ' + description).toLowerCase();
    
    if (/game|play|arcade|puzzle|rpg|action|adventure|racing/i.test(text)) return 'games';
    if (/emulator|delta|retroarch|ppsspp|dolphin|gba|nes|snes/i.test(text)) return 'emulators';
    if (/spotify|music|youtube|video|player|stream|vlc|infuse/i.test(text)) return 'media';
    if (/++|tweak|mod|premium|pro|hack|unlock/i.test(text)) return 'tweaked';
    if (/instagram|twitter|tiktok|facebook|social|whatsapp|telegram|snapchat/i.test(text)) return 'social';
    
    return 'utilities';
}

// ========================================
// Data Loading & Caching
// ========================================
async function loadSources() {
    state.isLoading = true;
    updateLoadingState();
    
    // Load saved sources from localStorage
    const savedSources = localStorage.getItem('cloudstore_sources');
    state.sources = savedSources ? JSON.parse(savedSources) : [...DEFAULT_SOURCES];
    
    // Check cache
    const cachedApps = localStorage.getItem('cloudstore_apps');
    const cacheTime = localStorage.getItem('cloudstore_cache_time');
    const cacheValid = cacheTime && (Date.now() - parseInt(cacheTime)) < 30 * 60 * 1000; // 30 minutes
    
    if (cachedApps && cacheValid) {
        state.apps = JSON.parse(cachedApps);
        state.isLoading = false;
        updateUI();
        return;
    }
    
    // Fetch all sources
    const allApps = [];
    
    for (const source of state.sources) {
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(source.url)}`;
            const response = await fetch(proxyUrl, { timeout: 10000 });
            
            if (!response.ok) continue;
            
            const data = await response.json();
            const format = detectSourceFormat(data);
            
            let apps = [];
            if (format === 'appbox') {
                apps = data.AppStore || [];
            } else if (format === 'custom-array') {
                apps = data;
            } else {
                apps = data.apps || [];
            }
            
            const normalizedApps = apps.map(app => normalizeApp(app, format, source.name));
            allApps.push(...normalizedApps.filter(app => app.name && app.ipa));
            
            // Update source with app count
            source.appCount = normalizedApps.length;
            
        } catch (error) {
            console.warn(`Failed to load source: ${source.name}`, error);
            source.appCount = 0;
        }
    }
    
    // Remove duplicates based on bundleID
    const uniqueApps = allApps.reduce((acc, app) => {
        if (!acc.find(a => a.bundleID === app.bundleID && app.bundleID)) {
            acc.push(app);
        } else if (!app.bundleID) {
            acc.push(app);
        }
        return acc;
    }, []);
    
    state.apps = uniqueApps;
    
    // Cache results
    localStorage.setItem('cloudstore_apps', JSON.stringify(state.apps));
    localStorage.setItem('cloudstore_cache_time', Date.now().toString());
    localStorage.setItem('cloudstore_sources', JSON.stringify(state.sources));
    
    state.isLoading = false;
    updateUI();
}

// ========================================
// UI Updates
// ========================================
function updateLoadingState() {
    elements.loadingState.classList.toggle('hidden', !state.isLoading);
    elements.appSections.style.display = state.isLoading ? 'none' : 'block';
}

function updateUI() {
    updateLoadingState();
    updateStats();
    renderCategories();
    renderSources();
}

function updateStats() {
    elements.totalApps.textContent = state.apps.length;
    elements.totalSources.textContent = state.sources.length;
}

function renderCategories() {
    // Popular apps
    const popularApps = state.apps.slice(0, 10);
    renderAppSection('popularApps', popularApps);
    
    // Recently updated (mock - sort by random)
    const recentApps = [...state.apps].sort(() => Math.random() - 0.5).slice(0, 10);
    renderAppSection('recentApps', recentApps);
    
    // Tweaked apps
    const tweakedApps = state.apps.filter(app => app.category === 'tweaked').slice(0, 10);
    renderAppSection('tweakedApps', tweakedApps);
    document.getElementById('tweakedSection').style.display = tweakedApps.length ? 'block' : 'none';
    
    // Games
    const gamesApps = state.apps.filter(app => app.category === 'games').slice(0, 10);
    renderAppSection('gamesApps', gamesApps);
    document.getElementById('gamesSection').style.display = gamesApps.length ? 'block' : 'none';
    
    // Emulators
    const emulatorsApps = state.apps.filter(app => app.category === 'emulators').slice(0, 10);
    renderAppSection('emulatorsApps', emulatorsApps);
    document.getElementById('emulatorsSection').style.display = emulatorsApps.length ? 'block' : 'none';
    
    // Media
    const mediaApps = state.apps.filter(app => app.category === 'media').slice(0, 10);
    renderAppSection('mediaApps', mediaApps);
    document.getElementById('mediaSection').style.display = mediaApps.length ? 'block' : 'none';
}

function renderAppSection(containerId, apps) {
    const container = document.getElementById(containerId);
    container.innerHTML = apps.map(app => createAppCard(app)).join('');
    
    // Add click handlers
    container.querySelectorAll('.app-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('app-card-btn')) {
                openAppModal(apps[index]);
            }
        });
        
        card.querySelector('.app-card-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadApp(apps[index]);
        });
    });
}

function createAppCard(app, isFeatured = false) {
    const iconHtml = app.icon 
        ? `<img src="${app.icon}" alt="${app.name}" onerror="this.parentElement.classList.add('placeholder'); this.remove();">`
        : '';
    
    return `
        <div class="app-card ${isFeatured ? 'featured' : ''}">
            <div class="app-icon ${!app.icon ? 'placeholder' : ''}">
                ${iconHtml}
                ${!app.icon ? app.name.charAt(0).toUpperCase() : ''}
            </div>
            <div class="app-name">${app.name}</div>
            <div class="app-developer">${app.developer}</div>
            <button class="app-card-btn">Скачать</button>
        </div>
    `;
}

function renderSources() {
    elements.sourcesList.innerHTML = state.sources.map((source, index) => `
        <div class="source-card" data-index="${index}">
            <div class="source-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
            </div>
            <div class="source-info">
                <div class="source-name">${source.name}</div>
                <div class="source-url">${source.url}</div>
                <div class="source-count">${source.appCount || 0} приложений</div>
            </div>
            <button class="source-delete" data-index="${index}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    // Add delete handlers
    elements.sourcesList.querySelectorAll('.source-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            deleteSource(index);
        });
    });
}

// ========================================
// Search
// ========================================
function handleSearch(query) {
    query = query.trim().toLowerCase();
    
    if (!query) {
        elements.searchResults.classList.add('hidden');
        elements.appSections.style.display = 'block';
        elements.searchClear.classList.remove('visible');
        return;
    }
    
    elements.searchClear.classList.add('visible');
    elements.appSections.style.display = 'none';
    elements.searchResults.classList.remove('hidden');
    
    const results = state.apps.filter(app => 
        app.name.toLowerCase().includes(query) ||
        app.developer.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        elements.noResults.classList.remove('hidden');
        elements.searchResultsGrid.innerHTML = '';
    } else {
        elements.noResults.classList.add('hidden');
        elements.searchResultsGrid.innerHTML = results.map(app => createAppCard(app)).join('');
        
        // Add click handlers
        elements.searchResultsGrid.querySelectorAll('.app-card').forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('app-card-btn')) {
                    openAppModal(results[index]);
                }
            });
            
            card.querySelector('.app-card-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadApp(results[index]);
            });
        });
    }
}

// ========================================
// Category Filter
// ========================================
function filterByCategory(category) {
    state.currentCategory = category;
    
    // Update pills
    elements.categoryPills.querySelectorAll('.pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.category === category);
    });
    
    if (category === 'all') {
        elements.allAppsGrid.classList.add('hidden');
        elements.appSections.style.display = 'block';
        return;
    }
    
    elements.appSections.style.display = 'none';
    elements.allAppsGrid.classList.remove('hidden');
    
    const filteredApps = state.apps.filter(app => app.category === category);
    elements.allAppsGrid.innerHTML = filteredApps.map(app => createAppCard(app)).join('');
    
    // Add click handlers
    elements.allAppsGrid.querySelectorAll('.app-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('app-card-btn')) {
                openAppModal(filteredApps[index]);
            }
        });
        
        card.querySelector('.app-card-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadApp(filteredApps[index]);
        });
    });
}

// ========================================
// Modals
// ========================================
function openAppModal(app) {
    elements.appModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    const screenshotsHtml = app.screenshots.length > 0 
        ? `
            <div class="app-detail-section">
                <h4>Скриншоты</h4>
                <div class="screenshots-scroll">
                    ${app.screenshots.map(url => `
                        <div class="screenshot">
                            <img src="${url}" alt="Screenshot" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            </div>
        ` 
        : '';
    
    elements.modalContent.innerHTML = `
        <div class="app-detail-header">
            <div class="app-detail-icon">
                ${app.icon ? `<img src="${app.icon}" alt="${app.name}">` : `<div class="placeholder">${app.name.charAt(0)}</div>`}
            </div>
            <div class="app-detail-info">
                <h2 class="app-detail-name">${app.name}</h2>
                <div class="app-detail-developer">${app.developer}</div>
                <div class="app-detail-category">${getCategoryName(app.category)}</div>
            </div>
        </div>
        
        <div class="app-detail-actions">
            <button class="download-btn" id="modalDownloadBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Скачать IPA
            </button>
        </div>
        
        <div class="app-detail-meta">
            <div class="meta-item">
                <div class="meta-value">${app.version || 'N/A'}</div>
                <div class="meta-label">Версия</div>
            </div>
            <div class="meta-item">
                <div class="meta-value">${app.size || 'N/A'}</div>
                <div class="meta-label">Размер</div>
            </div>
            <div class="meta-item">
                <div class="meta-value">${app.source}</div>
                <div class="meta-label">Источник</div>
            </div>
        </div>
        
        ${screenshotsHtml}
        
        <div class="app-detail-section">
            <h4>Описание</h4>
            <p class="app-detail-description">${app.description || 'Описание недоступно'}</p>
        </div>
    `;
    
    document.getElementById('modalDownloadBtn').addEventListener('click', () => downloadApp(app));
}

function closeAppModal() {
    elements.appModal.classList.add('hidden');
    document.body.style.overflow = '';
}

function openSourceModal() {
    elements.sourceModal.classList.remove('hidden');
    elements.sourceUrlInput.value = '';
    elements.sourceUrlInput.focus();
}

function closeSourceModal() {
    elements.sourceModal.classList.add('hidden');
}

function getCategoryName(category) {
    const names = {
        games: '🎮 Игры',
        emulators: '🕹️ Эмуляторы',
        media: '📺 Медиа',
        tweaked: '⚡ Tweaked',
        social: '💬 Соцсети',
        utilities: '🔧 Утилиты'
    };
    return names[category] || category;
}

// ========================================
// Actions
// ========================================
function downloadApp(app) {
    if (app.ipa) {
        // Try to open with itms-services for direct install
        const plistUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(app.ipa)}`;
        
        // Fallback to direct download
        window.location.href = app.ipa;
        showToast(`Загрузка ${app.name}...`);
    } else {
        showToast('Ссылка для скачивания недоступна');
    }
}

async function addSource() {
    const url = elements.sourceUrlInput.value.trim();
    
    if (!url) {
        showToast('Введите URL источника');
        return;
    }
    
    try {
        new URL(url);
    } catch {
        showToast('Неверный формат URL');
        return;
    }
    
    // Check if already exists
    if (state.sources.some(s => s.url === url)) {
        showToast('Источник уже добавлен');
        return;
    }
    
    const newSource = {
        url,
        name: new URL(url).hostname,
        type: 'custom'
    };
    
    state.sources.push(newSource);
    localStorage.setItem('cloudstore_sources', JSON.stringify(state.sources));
    
    closeSourceModal();
    showToast('Источник добавлен');
    
    // Reload data
    loadSources();
}

function deleteSource(index) {
    state.sources.splice(index, 1);
    localStorage.setItem('cloudstore_sources', JSON.stringify(state.sources));
    renderSources();
    showToast('Источник удалён');
}

function clearCache() {
    localStorage.removeItem('cloudstore_apps');
    localStorage.removeItem('cloudstore_cache_time');
    showToast('Кэш очищен');
    loadSources();
}

function showToast(message) {
    const toast = elements.toast;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ========================================
// Tab Navigation
// ========================================
function switchTab(tab) {
    state.currentTab = tab;
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    
    // Hide all tabs
    elements.sourcesTab.classList.add('hidden');
    elements.settingsTab.classList.add('hidden');
    elements.appSections.style.display = 'none';
    document.querySelector('.hero-banner').style.display = 'none';
    elements.categoryPills.style.display = 'none';
    elements.searchResults.classList.add('hidden');
    elements.allAppsGrid.classList.add('hidden');
    
    // Show header
    document.querySelector('.header').style.display = tab === 'home' || tab === 'browse' ? 'block' : 'none';
    
    switch (tab) {
        case 'home':
            elements.appSections.style.display = 'block';
            document.querySelector('.hero-banner').style.display = 'block';
            elements.categoryPills.style.display = 'flex';
            break;
        case 'browse':
            elements.allAppsGrid.classList.remove('hidden');
            elements.allAppsGrid.innerHTML = state.apps.map(app => createAppCard(app)).join('');
            
            // Add click handlers
            elements.allAppsGrid.querySelectorAll('.app-card').forEach((card, index) => {
                card.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('app-card-btn')) {
                        openAppModal(state.apps[index]);
                    }
                });
                
                card.querySelector('.app-card-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    downloadApp(state.apps[index]);
                });
            });
            break;
        case 'sources':
            elements.sourcesTab.classList.remove('hidden');
            break;
        case 'settings':
            elements.settingsTab.classList.remove('hidden');
            break;
    }
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Search
    elements.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    elements.searchClear.addEventListener('click', () => {
        elements.searchInput.value = '';
        handleSearch('');
    });
    
    // Category pills
    elements.categoryPills.addEventListener('click', (e) => {
        if (e.target.classList.contains('pill')) {
            filterByCategory(e.target.dataset.category);
        }
    });
    
    // Modal close
    elements.modalClose.addEventListener('click', closeAppModal);
    elements.appModal.addEventListener('click', (e) => {
        if (e.target === elements.appModal) closeAppModal();
    });
    
    // Source modal
    elements.addSourceBtn.addEventListener('click', openSourceModal);
    elements.addSourceFab?.addEventListener('click', openSourceModal);
    elements.sourceModalClose.addEventListener('click', closeSourceModal);
    elements.addSourceSubmit.addEventListener('click', addSource);
    elements.sourceModal.addEventListener('click', (e) => {
        if (e.target === elements.sourceModal) closeSourceModal();
    });
    
    // Tab navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    
    // Settings
    document.getElementById('clearCache')?.addEventListener('click', clearCache);
    document.getElementById('refreshSources')?.addEventListener('click', () => {
        clearCache();
    });
}

// ========================================
// Service Worker Registration
// ========================================
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('service-worker.js');
            console.log('Service Worker registered');
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }
}

// ========================================
// Initialize App
// ========================================
function init() {
    init3DBackground();
    initEventListeners();
    registerServiceWorker();
    loadSources();
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
