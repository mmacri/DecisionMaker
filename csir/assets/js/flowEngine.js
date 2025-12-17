(function() {
  const MODULE_SECTIONS = [
    { id: "landing", title: "Landing" },
    { id: "intro", title: "Introduction" },
    { id: "training-flow", title: "Training Flow" },
    { id: "role-guidance", title: "Role Guidance" },
    { id: "requirements-overview", title: "Requirements Overview" },
    { id: "r1", title: "R1 – Ports & Services" },
    { id: "r2", title: "R2 – Patch Management" },
    { id: "r3", title: "R3 – Malware Prevention" },
    { id: "r4", title: "R4 – Security Event Monitoring" },
    { id: "r5", title: "R5 – Account Management" },
    { id: "r6", title: "R6 – Interactive Remote Access" },
    { id: "scenarios", title: "Scenarios" },
    { id: "knowledge-check", title: "Knowledge Check" },
    { id: "checklist", title: "Operational Checklist" },
    { id: "resources", title: "Resources" },
    { id: "completion", title: "Completion" }
  ];

  const PROGRESS_KEY = "dm_module6_progress_v1";

  document.addEventListener("DOMContentLoaded", () => {
    const appMain = document.querySelector(".app-main");
    const flowHeader = document.getElementById("flowHeader");
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const flowCurrentTitle = document.getElementById("flowCurrentTitle");
    const flowDoneCount = document.getElementById("flowDoneCount");
    const flowTotalCount = document.getElementById("flowTotalCount");
    const backBtn = document.getElementById("flowBackBtn");
    const nextBtn = document.getElementById("flowNextBtn");

    if (!appMain || !flowHeader || links.length === 0) return;

    flowTotalCount.textContent = MODULE_SECTIONS.length;

    const sectionExists = (id) => MODULE_SECTIONS.some((section) => section.id === id);

    const loadProgress = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY));
        if (saved && typeof saved === "object") {
          const validCompleted = Array.isArray(saved.completedIds)
            ? saved.completedIds.filter((id) => sectionExists(id))
            : [];
          return {
            lastId: sectionExists(saved.lastId) ? saved.lastId : MODULE_SECTIONS[0].id,
            completedIds: Array.from(new Set(validCompleted)),
            updatedAt: saved.updatedAt || new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn("Progress could not be parsed", error);
      }
      return { lastId: MODULE_SECTIONS[0].id, completedIds: [], updatedAt: new Date().toISOString() };
    };

    let progressState = loadProgress();

    const hashId = (window.location.hash || "").replace("#", "");
    let activeSectionId = sectionExists(hashId) ? hashId : progressState.lastId;

    const saveProgress = () => {
      progressState.updatedAt = new Date().toISOString();
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressState));
    };

    const setActiveNav = (sectionId) => {
      links.forEach((link) => {
        const matches = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("active", matches);
        if (matches) {
          const accordion = link.closest(".accordion");
          accordion?.classList.add("open");
        }
      });
    };

    const updateCompletionStyles = () => {
      MODULE_SECTIONS.forEach((section) => {
        const sectionEl = document.getElementById(section.id);
        const navLink = document.querySelector(`.nav-link[href="#${section.id}"]`);
        const completed = progressState.completedIds.includes(section.id);
        sectionEl?.classList.toggle("completed", completed);
        navLink?.classList.toggle("completed", completed);
      });
      flowDoneCount.textContent = progressState.completedIds.length;
    };

    const updateHeader = (sectionId) => {
      const currentIndex = MODULE_SECTIONS.findIndex((section) => section.id === sectionId);
      const activeSection = MODULE_SECTIONS[currentIndex] || MODULE_SECTIONS[0];
      flowCurrentTitle.textContent = activeSection.title;
      backBtn.disabled = currentIndex <= 0;
      nextBtn.disabled = currentIndex >= MODULE_SECTIONS.length - 1;
    };

    const scrollToSection = (sectionId) => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      const headerHeight = flowHeader?.offsetHeight || 0;
      const mainTop = appMain.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const offset = appMain.scrollTop + targetTop - mainTop - headerHeight - 12;
      appMain.scrollTo({ top: offset, behavior: "smooth" });
    };

    const goToSection = (sectionId, { updateHash = true } = {}) => {
      if (!sectionExists(sectionId)) return;
      activeSectionId = sectionId;
      progressState.lastId = sectionId;
      saveProgress();
      setActiveNav(sectionId);
      updateHeader(sectionId);
      if (updateHash) history.replaceState(null, "", `#${sectionId}`);
      scrollToSection(sectionId);
    };

    const markComplete = (sectionId) => {
      if (!progressState.completedIds.includes(sectionId)) {
        progressState.completedIds.push(sectionId);
        saveProgress();
        updateCompletionStyles();
      }
    };

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const id = link.getAttribute("href").replace("#", "");
        goToSection(id);
      });
    });

    backBtn.addEventListener("click", () => {
      const currentIndex = MODULE_SECTIONS.findIndex((section) => section.id === activeSectionId);
      if (currentIndex > 0) {
        goToSection(MODULE_SECTIONS[currentIndex - 1].id);
      }
    });

    nextBtn.addEventListener("click", () => {
      const currentIndex = MODULE_SECTIONS.findIndex((section) => section.id === activeSectionId);
      if (currentIndex < MODULE_SECTIONS.length - 1) {
        markComplete(activeSectionId);
        goToSection(MODULE_SECTIONS[currentIndex + 1].id);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id && activeSectionId !== id) {
              activeSectionId = id;
              progressState.lastId = id;
              saveProgress();
              setActiveNav(id);
              updateHeader(id);
              history.replaceState(null, "", `#${id}`);
            }
          }
        });
      },
      { root: appMain, threshold: 0.55 }
    );

    MODULE_SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    updateCompletionStyles();
    goToSection(activeSectionId, { updateHash: true });
  });
})();
