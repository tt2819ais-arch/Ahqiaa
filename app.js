// ==== app.js ====

document.addEventListener("DOMContentLoaded", () => {
    // === СЕЛЕКТОРЫ ===
    const popularApps = document.getElementById("popularApps");
    const recentApps = document.getElementById("recentApps");
    const tweakedApps = document.getElementById("tweakedApps");
    const gamesApps = document.getElementById("gamesApps");
    const emulatorsApps = document.getElementById("emulatorsApps");
    const mediaApps = document.getElementById("mediaApps");
    const allAppsGrid = document.getElementById("allAppsGrid");

    const appModal = document.getElementById("appModal");
    const modalContent = document.getElementById("modalContent");
    const modalClose = document.getElementById("modalClose");

    const sourceModal = document.getElementById("sourceModal");
    const sourceModalClose = document.getElementById("sourceModalClose");
    const addSourceBtn = document.getElementById("addSourceBtn");
    const addSourceSubmit = document.getElementById("addSourceSubmit");
    const sourceUrlInput = document.getElementById("sourceUrlInput");
    const sourcesList = document.getElementById("sourcesList");

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const searchResultsGrid = document.getElementById("searchResultsGrid");
    const noResults = document.getElementById("noResults");
    const searchClear = document.getElementById("searchClear");

    const navItems = document.querySelectorAll(".nav-item");
    const homeTab = document.getElementById("mainContent");
    const sourcesTab = document.getElementById("sourcesTab");
    const settingsTab = document.getElementById("settingsTab");

    const toast = document.getElementById("toast");
    const toastMessage = toast.querySelector(".toast-message");

    // === ПЕРЕМЕННЫЕ ===
    let apps = []; // все приложения
    let sources = []; // все источники

    // === ПРИМЕР ДАННЫХ ===
    const exampleApps = [
        {id:1,name:"App One",category:"games",popular:true,recent:true},
        {id:2,name:"App Two",category:"tweaked",popular:true,recent:false},
        {id:3,name:"App Three",category:"media",popular:false,recent:true},
        {id:4,name:"App Four",category:"emulators",popular:false,recent:false},
        {id:5,name:"App Five",category:"games",popular:true,recent:true},
    ];

    const exampleSources = [
        {url:"https://gbox.run/Public/Source.json"},
        {url:"https://repository.apptesters.org"},
        {url:"https://pokemmo.com/altstore"},
        {url:"https://ipa.cypwn.xyz/cypwn.json"},
        {url:"https://ittza7aa.com/repo.json"}
    ];

    // === ФУНКЦИИ ===
    function showToast(msg) {
        toastMessage.textContent = msg;
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 2000);
    }

    function renderAppCard(app) {
        const card = document.createElement("div");
        card.className = "app-card";
        card.innerHTML = `
            <div class="app-icon">${app.name[0]}</div>
            <div class="app-info">
                <h4>${app.name}</h4>
                <span>${app.category}</span>
            </div>
        `;
        card.addEventListener("click", () => openAppModal(app));
        return card;
    }

    function renderApps() {
        // очищаем секции
        [popularApps,recentApps,tweakedApps,gamesApps,emulatorsApps,mediaApps,allAppsGrid].forEach(el => el.innerHTML="");

        apps.forEach(app => {
            allAppsGrid.appendChild(renderAppCard(app));
            if(app.popular) popularApps.appendChild(renderAppCard(app));
            if(app.recent) recentApps.appendChild(renderAppCard(app));

            if(app.category==="tweaked") tweakedApps.appendChild(renderAppCard(app));
            if(app.category==="games") gamesApps.appendChild(renderAppCard(app));
            if(app.category==="emulators") emulatorsApps.appendChild(renderAppCard(app));
            if(app.category==="media") mediaApps.appendChild(renderAppCard(app));
        });

        document.getElementById("totalApps").textContent = apps.length;
        document.getElementById("totalSources").textContent = sources.length;
    }

    function renderSources() {
        sourcesList.innerHTML="";
        sources.forEach((s,i) => {
            const div = document.createElement("div");
            div.className="source-item";
            div.textContent = s.url;
            const removeBtn = document.createElement("button");
            removeBtn.textContent="❌";
            removeBtn.addEventListener("click",()=>{
                sources.splice(i,1);
                renderSources();
                renderApps();
            });
            div.appendChild(removeBtn);
            sourcesList.appendChild(div);
        });
    }

    function openAppModal(app) {
        modalContent.innerHTML = `<h2>${app.name}</h2><p>Категория: ${app.category}</p>`;
        appModal.classList.remove("hidden");
    }

    function closeAppModal() {
        appModal.classList.add("hidden");
    }

    function openSourceModal() { sourceModal.classList.remove("hidden"); }
    function closeSourceModal() { sourceModal.classList.add("hidden"); }

    function switchTab(tab) {
        [homeTab,sourcesTab,settingsTab].forEach(t=>t.classList.add("hidden"));
        navItems.forEach(n=>n.classList.remove("active"));

        if(tab==="home"){ homeTab.classList.remove("hidden"); navItems[0].classList.add("active"); }
        if(tab==="browse"){ homeTab.classList.remove("hidden"); navItems[1].classList.add("active"); }
        if(tab==="sources"){ sourcesTab.classList.remove("hidden"); navItems[2].classList.add("active"); }
        if(tab==="settings"){ settingsTab.classList.remove("hidden"); navItems[3].classList.add("active"); }
    }

    function searchApps(query){
        const results = apps.filter(app=>app.name.toLowerCase().includes(query.toLowerCase()));
        searchResultsGrid.innerHTML="";
        if(results.length===0){
            noResults.classList.remove("hidden");
        } else {
            noResults.classList.add("hidden");
            results.forEach(app=>searchResultsGrid.appendChild(renderAppCard(app)));
        }
        searchResults.classList.remove("hidden");
    }

    // === СОБЫТИЯ ===
    modalClose.addEventListener("click", closeAppModal);
    addSourceBtn.addEventListener("click", openSourceModal);
    sourceModalClose.addEventListener("click", closeSourceModal);

    addSourceSubmit.addEventListener("click", ()=>{
        const url = sourceUrlInput.value.trim();
        if(url===""){ showToast("Введите URL!"); return; }
        sources.push({url});
        renderSources();
        renderApps();
        sourceUrlInput.value="";
        closeSourceModal();
        showToast("Источник добавлен");
    });

    navItems.forEach(item=>{
        item.addEventListener("click", ()=>{
            switchTab(item.dataset.tab);
        });
    });

    searchInput.addEventListener("input", (e)=>{
        const query = e.target.value.trim();
        if(query===""){
            searchResults.classList.add("hidden");
            return;
        }
        searchApps(query);
    });

    searchClear.addEventListener("click", ()=>{
        searchInput.value="";
        searchResults.classList.add("hidden");
    });

    // === ИНИЦИАЛИЗАЦИЯ ===
    apps = exampleApps;
    sources = exampleSources;
    renderSources();
    renderApps();
    switchTab("home");
});
