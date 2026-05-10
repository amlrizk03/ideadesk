const form = document.querySelector("#project-form");
const projectIdea = document.querySelector("#projectIdea");
const ideaCount = document.querySelector("#ideaCount");
const ideaWarning = document.querySelector("#ideaWarning");
const shapeButton = document.querySelector("#shapeButton");
const emptyState = document.querySelector("#emptyState");
const loadingState = document.querySelector("#loadingState");
const resultGrid = document.querySelector("#resultGrid");
const saveButton = document.querySelector("#saveButton");

const hamburger = document.querySelector("#hamburger");
const navLinks = document.querySelector("#navLinks");

const selections = {
  type: "Web App",
  timeline: "1 Month",
};

let latestPlan = null;

function escapeHTML(text) {
  return String(text || "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return map[char];
  });
}

function updateCharacterCount() {
  if (!ideaCount || !projectIdea) return;
  ideaCount.textContent = projectIdea.value.length;
}

function showWarning(message) {
  if (!ideaWarning || !projectIdea) return;

  ideaWarning.textContent = message;
  projectIdea.setAttribute("aria-invalid", message ? "true" : "false");
}

function getInputValue(selector) {
  const input = document.querySelector(selector);
  return input ? input.value.trim() : "";
}

function renderGeneratedPlan(data) {
  latestPlan = data;

  resultGrid.innerHTML = `
    <article class="result-card card-idea">
      <h3>Improved Idea</h3>
      <p>${escapeHTML(data.improvedIdea)}</p>
    </article>

    <article class="result-card card-features">
      <h3>Main Features</h3>
      <ul>
        ${(data.mainFeatures || [])
          .map((item) => `<li>${escapeHTML(item)}</li>`)
          .join("")}
      </ul>
    </article>

    <article class="result-card card-stack">
      <h3>Suggested Tech Stack</h3>
      <div class="stack-tags">
        ${(data.suggestedTechStack || [])
          .map(
            (item, index) =>
              `<span class="stack-tag tag-${index % 5}">${escapeHTML(item)}</span>`,
          )
          .join("")}
      </div>
    </article>

    <article class="result-card card-roles">
      <h3>Team Roles</h3>
      <div class="role-badges">
        ${(data.teamRoles || [])
          .map((item) => `<span class="role-badge">${escapeHTML(item)}</span>`)
          .join("")}
      </div>
    </article>

    <article class="result-card card-gaps">
      <h3>Skill Gaps</h3>
      <div class="gap-notes">
        ${(data.skillGaps || [])
          .map((item) => `<span class="gap-note">${escapeHTML(item)}</span>`)
          .join("")}
      </div>
    </article>

    <article class="result-card card-milestones">
      <h3>Milestones</h3>
      <div class="milestone-timeline">
        ${(data.milestones || [])
          .map(
            (item, index) => `
              <div class="milestone-item">
                <span class="milestone-dot"></span>
                <span class="milestone-num">${index + 1}</span>
                <span class="milestone-text">${escapeHTML(item)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </article>
  `;

  resultGrid.classList.remove("hidden");
}

function renderErrorMessage(
  message = "Please make sure the backend is running, then try again.",
) {
  resultGrid.innerHTML = `
    <article class="result-card card-gaps">
      <h3>Something went wrong</h3>
      <p>${escapeHTML(message)}</p>
    </article>
  `;

  resultGrid.classList.remove("hidden");
}

function getFallbackPlan() {
  return {
    improvedIdea:
      projectIdea.value.trim() ||
      "Generate a project plan first, then try this button again.",
    mainFeatures: [],
    suggestedTechStack: [],
    teamRoles: [],
    skillGaps: [],
    milestones: [],
    portfolioKit: {
      projectPitch: "",
      readmeOutline: [],
      nextBestStep: "",
    },
  };
}

function buildProjectBrief(plan) {
  return `
IdeaDesk Project Brief

Improved Idea:
${plan.improvedIdea}

Main Features:
${(plan.mainFeatures || []).map((item) => `- ${item}`).join("\n")}

Suggested Tech Stack:
${(plan.suggestedTechStack || []).map((item) => `- ${item}`).join("\n")}

Team Roles:
${(plan.teamRoles || []).map((item) => `- ${item}`).join("\n")}

Skill Gaps:
${(plan.skillGaps || []).map((item) => `- ${item}`).join("\n")}

Milestones:
${(plan.milestones || []).map((item) => `- ${item}`).join("\n")}
`.trim();
}

function buildPresentationOutline(plan) {
  return `
IdeaDesk Presentation Outline

1. Problem
Explain the problem your project solves.

2. Target Users
Describe who will use the project.

3. Solution
${plan.improvedIdea}

4. Main Features
${(plan.mainFeatures || []).map((item) => `- ${item}`).join("\n")}

5. Technologies
${(plan.suggestedTechStack || []).map((item) => `- ${item}`).join("\n")}

6. Demo Flow
Show the main user journey from start to finish.

7. Challenges
${(plan.skillGaps || []).map((item) => `- ${item}`).join("\n")}

8. Future Work
${plan.portfolioKit?.nextBestStep || "Add future improvements after testing."}
`.trim();
}

function buildReadme(plan) {
  return `
# Project Title

${plan.portfolioKit?.projectPitch || plan.improvedIdea}

## Problem Statement

${plan.improvedIdea}

## Features

${(plan.mainFeatures || []).map((item) => `- ${item}`).join("\n")}

## Tech Stack

${(plan.suggestedTechStack || []).map((item) => `- ${item}`).join("\n")}

## Team Roles

${(plan.teamRoles || []).map((item) => `- ${item}`).join("\n")}

## Milestones

${(plan.milestones || []).map((item) => `- ${item}`).join("\n")}

## Future Improvements

${plan.portfolioKit?.nextBestStep || "Continue improving the project after user feedback."}
`.trim();
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const group = chip.dataset.group;
    const value = chip.dataset.value;

    selections[group] = value;

    document
      .querySelectorAll(`.chip[data-group="${group}"]`)
      .forEach((item) => {
        item.classList.remove("active");
      });

    chip.classList.add("active");
  });
});

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!projectIdea.value.trim()) {
      showWarning(
        "Add a rough project idea first. Even one sentence is enough.",
      );
      projectIdea.focus();
      return;
    }

    const originalButtonContent = shapeButton.innerHTML;

    showWarning("");
    emptyState.classList.add("hidden");
    resultGrid.classList.add("hidden");
    loadingState.classList.remove("hidden");

    shapeButton.disabled = true;
    shapeButton.textContent = "Shaping...";

    try {
      const response = await fetch("http://127.0.0.1:8001/api/plans/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectIdea: projectIdea.value.trim(),
          skills: getInputValue("#skills"),
          technologies: getInputValue("#technologies"),
          goal: getInputValue("#goal"),
          projectType: selections.type,
          timeline: selections.timeline,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Could not generate the project plan.",
        );
      }

      const data = await response.json();
      renderGeneratedPlan(data);
    } catch (error) {
      renderErrorMessage(error.message);
    } finally {
      loadingState.classList.add("hidden");
      shapeButton.disabled = false;
      shapeButton.innerHTML = originalButtonContent;
    }
  });
}

if (projectIdea) {
  projectIdea.addEventListener("input", () => {
    updateCharacterCount();

    if (projectIdea.value.trim()) {
      showWarning("");
    }
  });
}

if (saveButton) {
  saveButton.addEventListener("click", () => {
    const originalText = saveButton.innerHTML;

    saveButton.innerHTML = "Saved";
    saveButton.disabled = true;

    setTimeout(() => {
      saveButton.innerHTML = originalText;
      saveButton.disabled = false;
    }, 1400);
  });
}

function setupExportButton(buttonId, actionType, feedbackText) {
  const button = document.querySelector(buttonId);

  if (!button) return;

  button.addEventListener("click", async () => {
    const originalText = button.innerHTML;
    const plan = latestPlan || getFallbackPlan();

    try {
      if (actionType === "brief") {
        await copyText(buildProjectBrief(plan));
      }

      if (actionType === "presentation") {
        await copyText(buildPresentationOutline(plan));
      }

      if (actionType === "readme") {
        await copyText(buildReadme(plan));
      }

      if (actionType === "pdf") {
        downloadTextFile("ideadesk-project-plan.txt", buildProjectBrief(plan));
      }

      button.textContent = feedbackText;
      button.disabled = true;
    } catch (error) {
      button.textContent = "Try again";
      button.disabled = true;
    }

    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 1400);
  });
}

setupExportButton("#exportCopy", "brief", "Brief copied");
setupExportButton("#exportReadme", "presentation", "Outline copied");
setupExportButton("#exportPdf", "pdf", "Downloaded");
setupExportButton("#exportReadmeDoc", "readme", "README copied");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

updateCharacterCount();
