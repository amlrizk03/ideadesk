const form = document.querySelector("#project-form");
const projectIdea = document.querySelector("#projectIdea");
const ideaCount = document.querySelector("#ideaCount");
const ideaWarning = document.querySelector("#ideaWarning");
const shapeButton = document.querySelector("#shapeButton");
const emptyState = document.querySelector("#emptyState");
const loadingState = document.querySelector("#loadingState");
const resultGrid = document.querySelector("#resultGrid");
const menuButton = document.querySelector("#menuButton");
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
    <article class="plan-card idea-card">
      <h3>Improved Idea</h3>
      <p>${escapeHTML(data.improvedIdea)}</p>
    </article>

    <article class="plan-card features-card">
      <h3>Main Features</h3>
      <ul>
        ${(data.mainFeatures || [])
          .map((item) => `<li>${escapeHTML(item)}</li>`)
          .join("")}
      </ul>
    </article>

    <article class="plan-card tech-card">
      <h3>Suggested Tech Stack</h3>
      <div class="tech-list">
        ${(data.suggestedTechStack || [])
          .map(
            (item, index) =>
              `<span class="tech-item tag-${index % 5}">${escapeHTML(item)}</span>`,
          )
          .join("")}
      </div>
    </article>

    <article class="plan-card roles-card">
      <h3>Team Roles</h3>
      <div class="role-list">
        ${(data.teamRoles || [])
          .map((item) => `<span class="role-item">${escapeHTML(item)}</span>`)
          .join("")}
      </div>
    </article>

    <article class="plan-card gaps-card">
      <h3>Skill Gaps</h3>
      <div class="gap-list">
        ${(data.skillGaps || [])
          .map((item) => `<span class="gap-item">${escapeHTML(item)}</span>`)
          .join("")}
      </div>
    </article>

    <article class="plan-card steps-card">
      <h3>Milestones</h3>
      <div class="steps-list">
        ${(data.milestones || [])
          .map(
            (item, index) => `
              <div class="step-item">
                <span class="step-dot"></span>
                <span class="step-number">${index + 1}</span>
                <span class="step-text">${escapeHTML(item)}</span>
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
    <article class="plan-card gaps-card">
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

document.querySelectorAll(".choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    const group = choice.dataset.group;
    const value = choice.dataset.value;

    selections[group] = value;

    document
      .querySelectorAll(`.choice[data-group="${group}"]`)
      .forEach((item) => {
        item.classList.remove("active");
      });

    choice.classList.add("active");
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

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

updateCharacterCount();
