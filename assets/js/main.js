(function () {
  const data = window.portfolioData;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const page = document.body.dataset.page || "";
  const rootPath = document.body.dataset.root || "";
  const path = (value) => `${rootPath}${value}`;

  function setYear() {
    $$(".year-now").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  function initLoader() {
    window.addEventListener("load", () => {
      setTimeout(() => document.body.classList.add("loaded"), 220);
    });
  }

  function initTheme() {
    const stored = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", stored);
    $$(".theme-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
    });
  }

  function initProgress() {
    const bar = $(".scroll-progress span");
    const nav = $(".floating-nav");
    window.addEventListener("scroll", () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.width = `${Math.max(0, Math.min(100, (window.scrollY / max) * 100))}%`;
      document.body.classList.toggle("scrolled", window.scrollY > 60);
      if (nav) nav.classList.toggle("is-compact", window.scrollY > 260);
    });
  }

  function initCursor() {
    if (matchMedia("(pointer: coarse)").matches) return;
    const cursor = document.createElement("div");
    cursor.className = "cursor-glow";
    document.body.appendChild(cursor);
    window.addEventListener("pointermove", (event) => {
      cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    });
  }

  function initTyped() {
    const target = $(".typed-text");
    if (target && window.Typed) {
      new Typed(target, {
        strings: data.person.roles,
        typeSpeed: 38,
        backSpeed: 20,
        backDelay: 1350,
        loop: true
      });
    }
  }

  function initAOS() {
    if (window.AOS) AOS.init({ duration: 760, once: true, offset: 80, easing: "ease-out-cubic" });
  }

  function animateCounters() {
    const counters = $$(".counter");
    if (!counters.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.target || 0);
        const suffix = el.dataset.suffix || "";
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 44));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = `${current}${suffix}`;
        }, 26);
        observer.unobserve(el);
      });
    }, { threshold: 0.35 });
    counters.forEach((counter) => observer.observe(counter));
  }

  function statMarkup(stat) {
    return `
      <div class="col-sm-6 col-xl-4">
        <article class="stat-card glass tilt-card" data-aos="fade-up">
          <strong class="counter" data-target="${stat.value}" data-suffix="${stat.suffix}">0</strong>
          <span>${stat.label}</span>
        </article>
      </div>
    `;
  }

  function renderStats() {
    const root = $("#statsGrid");
    if (root) root.innerHTML = data.stats.map(statMarkup).join("");
    const research = $("#researchStats");
    if (research) research.innerHTML = data.researchStats.map(statMarkup).join("");
  }

  function renderExecutiveSummary() {
    const summary = $("[data-content='executive-summary']");
    if (summary) summary.textContent = data.person.executiveSummary;
    const philosophy = $("[data-content='philosophy']");
    if (philosophy) philosophy.textContent = data.person.philosophy;
  }

  function renderExpertise() {
    const root = $("#expertiseGrid");
    if (!root) return;
    root.innerHTML = data.expertise.map((item, index) => `
      <div class="col-md-6 col-xl-3">
        <article class="expertise-card glass tilt-card" data-aos="fade-up" data-aos-delay="${(index % 4) * 55}">
          <i class="fa-solid ${item.icon}"></i>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      </div>
    `).join("");
  }

  function renderTimeline() {
    const root = $("#experienceTimeline");
    if (!root) return;
    root.innerHTML = data.experience.map((job, index) => `
      <article class="timeline-item" data-aos="${index % 2 ? "fade-left" : "fade-right"}">
        <div class="timeline-dot"></div>
        <div class="timeline-panel glass tilt-card">
          <span class="eyebrow">${job.duration} | ${job.country}</span>
          <h3>${job.role}</h3>
          <h4>${job.organization}</h4>
          <ul>${job.achievements.map((a) => `<li>${a}</li>`).join("")}</ul>
          <div class="tag-row">${job.technologies.map((t) => `<span>${t}</span>`).join("")}</div>
        </div>
      </article>
    `).join("");
  }

  function projectUrl(project) {
    return path(`projects/${project.id}.html`);
  }

  function projectCard(project, index) {
    return `
      <div class="col-lg-6 col-xl-4 project-card-wrap" data-category="${project.category}" data-country="${project.country}">
        <article class="project-card glass tilt-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 60}">
          <div class="project-visual" role="img" aria-label="${project.title} visual placeholder">
            <i class="fa-solid fa-layer-group"></i>
            <span>${project.category}</span>
          </div>
          <div class="card-body">
            <span class="eyebrow">${project.country} | ${project.period}</span>
            <h3>${project.title}</h3>
            <p>${project.summary}</p>
            <dl>
              <dt>Objective</dt><dd>${project.objectives}</dd>
              <dt>Methodology</dt><dd>${project.methodology}</dd>
              <dt>Result</dt><dd>${project.results}</dd>
            </dl>
            <div class="tag-row">${project.software.slice(0, 5).map((s) => `<span>${s}</span>`).join("")}</div>
            <a class="text-link mt-3" href="${projectUrl(project)}">Open project case study <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </article>
      </div>
    `;
  }

  function renderProjects() {
    const root = $("#projectsGrid");
    if (!root) return;
    root.innerHTML = data.projects.map(projectCard).join("");
    const categories = ["All", ...new Set(data.projects.map((p) => p.category))];
    const filters = $("#projectFilters");
    if (filters) {
      filters.innerHTML = categories.map((c, i) => `<button class="filter-btn ${i === 0 ? "active" : ""}" data-filter="${c}">${c}</button>`).join("");
      filters.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        $$(".filter-btn", filters).forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const filter = button.dataset.filter;
        $$(".project-card-wrap", root).forEach((card) => {
          card.hidden = filter !== "All" && card.dataset.category !== filter;
        });
      });
    }
  }

  function renderProjectDetail() {
    const root = $("#projectDetail");
    if (!root) return;
    const id = document.body.dataset.project;
    const project = data.projects.find((item) => item.id === id) || data.projects[0];
    document.title = `${project.title} | Dr. Sobhi Abdeljawad`;
    const title = $("#projectTitle");
    const subtitle = $("#projectSubtitle");
    if (title) title.textContent = project.title;
    if (subtitle) subtitle.textContent = project.summary;
    root.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="row g-4">
            ${[
              ["Background", project.background, "fa-circle-info"],
              ["Objectives", project.objectives, "fa-bullseye"],
              ["Methodology", project.methodology, "fa-route"],
              ["Results", project.results, "fa-chart-line"]
            ].map(([titleText, body, icon], index) => `
              <div class="col-lg-6">
                <article class="detail-card glass tilt-card" data-aos="fade-up" data-aos-delay="${index * 55}">
                  <i class="fa-solid ${icon}"></i>
                  <h2>${titleText}</h2>
                  <p>${body}</p>
                </article>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
      <section class="section section-alt">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-5">
              <div class="list-panel glass">
                <span class="eyebrow">Software Used</span>
                <h2>Technical stack</h2>
                <div class="tag-row">${project.software.map((s) => `<span>${s}</span>`).join("")}</div>
              </div>
            </div>
            <div class="col-lg-7">
              <div class="project-map-frame glass">
                <div class="mini-map-grid"></div>
                <div>
                  <span class="eyebrow">Maps and Figures</span>
                  <h2>${project.country}</h2>
                  <p>Map, figure, and gallery placeholders are prepared for verified project visuals, satellite outputs, and downloadable technical exhibits.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="masonry-grid mt-4">
            ${["Map placeholder", "Figure placeholder", "Gallery placeholder", "Download placeholder"].map((label) => `
              <article class="gallery-card glass"><i class="fa-solid fa-map"></i><h3>${label}</h3><p>${project.title}</p></article>
            `).join("")}
          </div>
          <div class="download-strip glass mt-4">
            ${project.downloads.map((item) => `<span><i class="fa-solid fa-download"></i>${item}</span>`).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function apa(pub) {
    return `${pub.authors} (${pub.year}). ${pub.title}. ${pub.venue}. ${pub.doi}`;
  }

  function bibtex(pub) {
    const key = `Abdeljawad${pub.year}${pub.title.split(" ")[0].replace(/[^A-Za-z0-9]/g, "")}`;
    return `@article{${key},\n  author = {${pub.authors}},\n  title = {${pub.title}},\n  year = {${pub.year}},\n  journal = {${pub.venue}},\n  doi = {${pub.doi}}\n}`;
  }

  function publicationCard(pub, index) {
    return `
      <div class="col-lg-6 publication-card-wrap" data-type="${pub.type}" data-theme="${pub.theme}" data-search="${`${pub.title} ${pub.authors} ${pub.venue} ${pub.theme}`.toLowerCase()}">
        <article class="publication-card glass tilt-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 50}">
          <span class="pub-year">${pub.year}</span>
          <h3>${apa(pub)}</h3>
          <p>${pub.theme} | ${pub.type}</p>
          <div class="pub-actions">
            <button class="mini-action" data-copy="${encodeURIComponent(apa(pub))}"><i class="fa-solid fa-quote-right"></i>Citation</button>
            <button class="mini-action" data-copy="${encodeURIComponent(bibtex(pub))}"><i class="fa-solid fa-code"></i>BibTeX</button>
            <a class="mini-action" href="#"><i class="fa-solid fa-file-pdf"></i>PDF</a>
            <small>${pub.doi}</small>
          </div>
        </article>
      </div>
    `;
  }

  function renderPublications() {
    const root = $("#publicationsGrid");
    if (!root) return;
    root.innerHTML = data.publications.map(publicationCard).join("");
    const types = ["All", ...new Set(data.publications.map((p) => p.theme))];
    const filters = $("#publicationFilters");
    const search = $("#publicationSearch");
    const apply = () => {
      const active = filters?.querySelector(".active")?.dataset.filter || "All";
      const query = (search?.value || "").trim().toLowerCase();
      $$(".publication-card-wrap", root).forEach((card) => {
        const matchesFilter = active === "All" || card.dataset.theme === active;
        const matchesSearch = !query || card.dataset.search.includes(query);
        card.hidden = !(matchesFilter && matchesSearch);
      });
    };
    if (filters) {
      filters.innerHTML = types.map((t, i) => `<button class="filter-btn ${i === 0 ? "active" : ""}" data-filter="${t}">${t}</button>`).join("");
      filters.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        $$(".filter-btn", filters).forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        apply();
      });
    }
    if (search) search.addEventListener("input", apply);
  }

  function renderBooks() {
    const root = $("#booksGrid");
    if (!root) return;
    root.innerHTML = data.books.map((book, index) => `
      <div class="col-lg-4">
        <article class="book-card glass tilt-card" data-aos="fade-up" data-aos-delay="${index * 70}">
          <div class="book-cover"><i class="fa-solid fa-book-open"></i><span>${book.year}</span></div>
          <div>
            <h3>${book.title}</h3>
            <p>${book.description}</p>
          </div>
        </article>
      </div>
    `).join("");
  }

  function renderSkills() {
    const root = $("#skillsGrid");
    if (!root) return;
    root.innerHTML = data.skillCategories.map((item, index) => `
      <div class="col-md-6 col-xl-4">
        <article class="skill-card glass tilt-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 60}">
          <i class="fa-solid ${item.icon}"></i>
          <span>${item.years} years</span>
          <h3>${item.category}</h3>
          <p>${item.description}</p>
          <div class="tag-row">${item.skills.map((skill) => `<span>${skill}</span>`).join("")}</div>
        </article>
      </div>
    `).join("");
  }

  function renderTeaching() {
    const root = $("#teachingGrid");
    if (!root) return;
    root.innerHTML = data.teaching.map((item, index) => `
      <div class="col-md-6 col-xl-4">
        <article class="simple-card glass tilt-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 55}">
          <h3>${item.institution}</h3>
          <p>${item.courses.join(", ")}</p>
        </article>
      </div>
    `).join("");
  }

  function renderConsulting() {
    const root = $("#consultingGrid");
    if (!root) return;
    root.innerHTML = data.consulting.map((item, index) => `
      <div class="col-lg-6">
        <article class="consulting-card glass tilt-card" data-aos="fade-up" data-aos-delay="${index * 70}">
          <div class="logo-placeholder">${item.region.slice(0, 2).toUpperCase()}</div>
          <div>
            <span class="eyebrow">${item.region}</span>
            <h3>${item.focus}</h3>
            <div class="tag-row">${item.sectors.map((sector) => `<span>${sector}</span>`).join("")}</div>
          </div>
        </article>
      </div>
    `).join("");
  }

  function renderDownloads() {
    const root = $("#downloadsGrid");
    if (!root) return;
    root.innerHTML = data.downloads.map((item, index) => `
      <div class="col-md-6 col-xl-4">
        <article class="download-card glass tilt-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 55}">
          <i class="fa-solid ${item.icon}"></i>
          <span>${item.type}</span>
          <h3>${item.title}</h3>
          <a class="btn-brand" href="${path(item.href)}" download><i class="fa-solid fa-download"></i>Download</a>
        </article>
      </div>
    `).join("");
  }

  function renderLists() {
    const maps = {
      certificationsList: data.certifications,
      conferencesList: data.conferences,
      workshopsList: data.workshops,
      supervisionList: data.supervision,
      fieldTripsList: data.fieldTrips,
      membershipsList: data.memberships,
      educationList: data.education,
      committeesList: data.academicCommittees,
      researchInterestsList: data.researchInterests
    };
    Object.entries(maps).forEach(([id, items]) => {
      const root = $(`#${id}`);
      if (!root) return;
      root.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
    });
  }

  function initSwiper() {
    if (window.Swiper && $(".gallery-swiper")) {
      new Swiper(".gallery-swiper", {
        slidesPerView: 1,
        spaceBetween: 18,
        loop: true,
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        breakpoints: { 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } }
      });
    }
  }

  function renderGallery() {
    const root = $("#masonryGallery");
    if (!root) return;
    const items = [
      ["Maps", "Hazard maps, hydrology, terrain, and environmental layers", "fa-map"],
      ["Conference Photos", "Research presentations and international academic forums", "fa-users"],
      ["Field Work", "Dry valleys, terrain interpretation, and geomorphological sites", "fa-person-hiking"],
      ["Certificates", "Professional credentials and training programs", "fa-certificate"],
      ["Books", "Applied GIS, remote sensing, and environmental geography references", "fa-book-open"],
      ["Research", "GeoAI, hydrology, geomorphology, and environmental monitoring outputs", "fa-microscope"],
      ["Infrastructure", "Electrical grid GIS and field survey workflows", "fa-bolt"],
      ["Urban Planning", "Municipal GIS, zoning, and urban expansion analysis", "fa-city"]
    ];
    root.innerHTML = items.map(([title, text, icon], index) => `
      <article class="gallery-card glass ${index % 3 === 0 ? "gallery-card-tall" : ""}" data-aos="zoom-in">
        <i class="fa-solid ${icon}"></i>
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `).join("");
  }

  function initMap() {
    const root = $("#gisMap");
    if (!root || !window.L) return;
    const map = L.map(root, { scrollWheelZoom: false }).setView([25.3, 32.5], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 12,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    const markerIcon = L.divIcon({
      className: "geo-marker",
      html: "<span></span>",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    data.countries.forEach((country) => {
      L.marker([country.lat, country.lng], { icon: markerIcon }).addTo(map)
        .bindPopup(`<strong>${country.name}</strong><br>${country.type}<br>${country.note}`);
    });
    data.projects.forEach((project) => {
      L.circleMarker([project.lat, project.lng], {
        radius: 7,
        color: "#78e2da",
        fillColor: "#15b8b0",
        fillOpacity: 0.75,
        weight: 2
      }).addTo(map).bindPopup(`<strong>${project.title}</strong><br>${project.summary}<br><a href="${projectUrl(project)}">Open case study</a>`);
    });
  }

  function initCopies() {
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const text = decodeURIComponent(button.dataset.copy);
      try {
        await navigator.clipboard.writeText(text);
        button.classList.add("copied");
        button.innerHTML = '<i class="fa-solid fa-check"></i>Copied';
        setTimeout(() => button.classList.remove("copied"), 1200);
      } catch {
        window.prompt("Copy this text:", text);
      }
    });
  }

  function initBackTop() {
    const button = $(".back-to-top");
    if (!button) return;
    window.addEventListener("scroll", () => button.classList.toggle("show", window.scrollY > 500));
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initPwa() {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register(path("service-worker.js")).catch(() => {});
    }
  }

  function injectStructuredData() {
    const pageTitle = document.title;
    const current = location.pathname.split("/").pop() || "index.html";
    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": data.site.title,
          "description": data.site.description,
          "url": location.origin ? `${location.origin}${location.pathname}` : current
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": path("index.html") },
            { "@type": "ListItem", "position": 2, "name": pageTitle.replace(" | Dr. Sobhi Abdeljawad", ""), "item": current }
          ]
        }
      ]
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(graph);
    document.head.appendChild(script);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initTheme();
    initProgress();
    initCursor();
    setYear();
    renderExecutiveSummary();
    renderStats();
    renderExpertise();
    renderTimeline();
    renderProjects();
    renderProjectDetail();
    renderPublications();
    renderBooks();
    renderSkills();
    renderTeaching();
    renderConsulting();
    renderDownloads();
    renderGallery();
    renderLists();
    initTyped();
    initAOS();
    initSwiper();
    animateCounters();
    initMap();
    initCopies();
    initBackTop();
    initPwa();
    injectStructuredData();
  });
})();
