// ------------------------
// app.js - полностью рабочий
// ------------------------

// Список источников
const sources = [
    "https://gbox.run/Public/Source.json",
    "https://repository.apptesters.org",
    "https://pokemmo.com/altstore",
    "https://ipa.cypwn.xyz/cypwn.json",
    "https://ittza7aa.com/repo.json"
];

// Разделы на сайте
const sections = {
    popular: document.getElementById("popularApps"),
    recent: document.getElementById("recentApps"),
    games: document.getElementById("gamesApps"),
    tweaked: document.getElementById("tweakedApps"),
    media: document.getElementById("mediaApps"),
    emulators: document.getElementById("emulatorsApps"),
    social: document.getElementById("socialApps"),
    utilities: document.getElementById("utilitiesApps")
};

// Счётчики
const totalAppsEl = document.getElementById("totalApps");
const totalSourcesEl = document.getElementById("totalSources");

// Подгрузка и рендер
async function loadSources() {
    const allApps = [];
    for (const url of sources) {
        try {
            const res = await fetch(url);
            const data = await res.json();

            totalSourcesEl.textContent = parseInt(totalSourcesEl.textContent || 0) + 1;

            if (data.apps && Array.isArray(data.apps)) {
                // Добавляем категорию, если нет
                data.apps.forEach(app => {
                    if (!app.category) app.category = "utilities";
                });
                allApps.push(...data.apps);
            }
        } catch (e) {
            console.warn("Ошибка загрузки источника:", url, e);
        }
    }

    totalAppsEl.textContent = allApps.length;
    renderApps(allApps);
}

// Рендер приложений в разделы
function renderApps(apps) {
    apps.forEach(app => {
        const cat = app.category.toLowerCase();
        const section = sections[cat] || sections["utilities"];

        const appEl = document.createElement("div");
        appEl.classList.add("app-card");
        appEl.innerHTML = `
            <img class="app-icon" src="${app.iconURL}" alt="${app.name}" />
            <div class="app-info">
                <h3 class="app-name">${app.name}</h3>
                <p class="app-subtitle">${app.subtitle || ""}</p>
                <span class="app-category">${cat}</span>
                <span class="app-size">${(app.size/1024/1024).toFixed(1)} MB</span>
                <span class="app-version">v${app.version || "?"}</span>
            </div>
            <a href="${app.downloadURL}" class="app-download" target="_blank">Скачать</a>
        `;
        section.appendChild(appEl);
    });
}

// Поиск
const searchInput = document.getElementById("searchInput");
const searchResultsGrid = document.getElementById("searchResultsGrid");
const searchResultsContainer = document.getElementById("searchResults");
const noResults = document.getElementById("noResults");

searchInput.addEventListener("input", e => {
    const query = e.target.value.toLowerCase();
    searchResultsGrid.innerHTML = "";

    if (!query) {
        searchResultsContainer.classList.add("hidden");
        return;
    }

    const filteredApps = [];
    Object.values(sections).forEach(section => {
        section.querySelectorAll(".app-card").forEach(appEl => {
            const name = appEl.querySelector(".app-name").textContent.toLowerCase();
            if (name.includes(query)) filteredApps.push(appEl.cloneNode(true));
        });
    });

    searchResultsContainer.classList.remove("hidden");
    if (filteredApps.length === 0) {
        noResults.classList.remove("hidden");
    } else {
        noResults.classList.add("hidden");
        filteredApps.forEach(appEl => searchResultsGrid.appendChild(appEl));
    }
});

// Очистка поиска
document.getElementById("searchClear").addEventListener("click", () => {
    searchInput.value = "";
    searchResultsContainer.classList.add("hidden");
});

// Запуск загрузки
loadSources();
