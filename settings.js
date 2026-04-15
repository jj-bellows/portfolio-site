const settingsButton = document.querySelector('.settings');
const settingsPopUp = document.querySelector('.settings-popup');
const settingsForm = document.querySelector('form');
const editColors = document.querySelector('.edit-colors');
const saveButton = document.querySelector('.save-button');

function toggleSettings() {
    settingsPopUp.classList.toggle("hidden");
}

function savePreferences(e) {
    e.preventDefault();
    const userPreferences = settingsForm.querySelectorAll('input[type="radio"]:checked');
    userPreferences.forEach(preference => {
        userSettings[preference.name] = preference.value;
    });
    localStorage.setItem("settings", JSON.stringify(userSettings));
    settingsPopUp.classList.toggle("hidden");
}

function refreshTimers() {
    timersContainer.childNodes.forEach(child => {
        if(child.nodeName == "DIV") {
            if(child != activeTimer) {
                const formattedTime = formatTime(child.elapsedTime/1000);
                displayTime(formattedTime, child.inputs);
            }
        };
    });
    update();
}

if(userSettings != null) {
    const hms = settingsForm.querySelector('#HMS');
    const decimal = settingsForm.querySelector('#Decimal');
    if(userSettings["time"] == "0") {
        hms.checked = false;
        decimal.checked = true;
        timeDisplay = 0;
    } else {
        hms.checked = true;
        decimal.checked = false;
        timeDisplay = 1;
    }
    refreshTimers();
}

settingsForm.addEventListener("input", (e) => {
    timeDisplay = e.target.value;
    refreshTimers();
});
editColors.addEventListener("click", e => {
    e.preventDefault();
    initializeColorSchemeEditor();
    settingsPopUp.classList.toggle("hidden");
});
saveButton.addEventListener("click", e => {savePreferences(e)});