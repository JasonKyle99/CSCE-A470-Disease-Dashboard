
const buttons = document.querySelectorAll(".tabs button");
const sections = document.querySelectorAll(".tab-content");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        buttons.forEach(item => item.classList.remove("active"));
        sections.forEach(section => section.hidden = true);

        button.classList.add("active");
        document.getElementById(button.dataset.tab).hidden = false;
    });
});

const dataButton = document.querySelector('.tabs button[data-tab="data"]');

document.addEventListener("countrySelected", () => {
    if (dataButton.classList.contains("active")) {
        return;
    }

    dataButton.classList.remove("country-selected-glow");
    void dataButton.offsetWidth;
    dataButton.classList.add("country-selected-glow");
});

const diseaseSelect = document.getElementById("disease-select");

diseaseSelect.addEventListener("change", () => {
    const disease = diseaseSelect.value;

    document.getElementById("dashboard-title").textContent =
        disease + " Dashboard";

    document.getElementById("disease-info").textContent =
        "Learn about " + disease +
        ", including transmission, prevention, and control.";

    document.dispatchEvent(new CustomEvent("diseaseChanged", {
        detail: { disease }
    }));
});

const slider = document.getElementById("date-slider");
const yearOutput = document.getElementById("selected-year");

slider.addEventListener("input", () => {
    yearOutput.textContent = slider.value;
});
