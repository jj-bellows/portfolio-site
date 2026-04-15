function hsl2hex(h,s,l) {
    //To know more see https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
    l /= 100;
    const a = s *Math.min(l, 1- l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function initializeColorSchemeEditor() {
    settingsButton.disabled = true;
    const settingsTag = document.querySelector('.settings-container');
    const colorSchemeEditor = document.createElement("div");
    let isSimpleBar;
    colorSchemeEditor.classList.add("color-scheme-editor");
    colorSchemeEditor.innerHTML = `<div class="color-scheme-container">
        <div class="color-scheme" data-simplebar></div>
    </div>
    <div>
        <div class="color-picker">
            <div class="swatch"></div>
            <input id="hue" type="range" name="hue" min="0" max="360" class="slider hue">
            <input id="saturation" type="range" name="saturation" min="0" max="100" class="slider saturation">
            <input id="lightness" type="range" name="lightness" min="0" max="100" class="slider lightness">
            <button class= "select-color">Select Color</button>
        </div>
        <div class="color-options">
            <button class="clear-color-scheme">Clear Colors</button>
            <button class="save-color-scheme">Save Colors</button>
            <button class="cancel-edits">Cancel Changes</button>
        </div>
    </div>`;
    settingsTag.appendChild(colorSchemeEditor);

    const colorScheme = colorSchemeEditor.querySelector(".color-scheme");
    const colorPicker = colorSchemeEditor.querySelector(".color-picker");
    const hueSlider = colorSchemeEditor.querySelector("#hue");
    const satSlider = colorSchemeEditor.querySelector("#saturation");
    const lightSlider = colorSchemeEditor.querySelector("#lightness");
    const selectColor = colorSchemeEditor.querySelector(".select-color");
    const clearColors = colorSchemeEditor.querySelector(".clear-color-scheme");
    const saveColors = colorSchemeEditor.querySelector(".save-color-scheme");
    const cancelButton = colorSchemeEditor.querySelector(".cancel-edits");

    function checkSimpleBar() {
        if(colorScheme.firstElementChild && colorScheme.firstElementChild.classList.contains("simplebar-wrapper")) {
            isSimpleBar = true;
        } else {
            isSimpleBar = false;
        }
    }

    function createSwatch(color) {
        //Create Swatch
        checkSimpleBar();
        const swatch = document.createElement("div");
        swatch.classList.add("swatch");
        swatch.style.backgroundColor = color;
        swatch.innerHTML = `<button class="delete-swatch">×</button>`;
        if(!isSimpleBar) {
            colorScheme.appendChild(swatch);
        } else {
            const simpleBarContent = colorScheme.querySelector(".simplebar-content");
            simpleBarContent.appendChild(swatch);
        }

        //Add Functionality to Swatch
        const deleteButton = swatch.querySelector('.delete-swatch');
        deleteButton.addEventListener('click', () => {
            checkSimpleBar();
            swatchLocator = colorScheme.querySelector(".swatch");
            const indexSelf = colors.indexOf(color);
            colors.splice(indexSelf, 1);
            if(!isSimpleBar) {
                colorScheme.removeChild(swatch);
            } else {
                const simpleBarContent = colorScheme.querySelector(".simplebar-content");
                simpleBarContent.removeChild(swatch);
            }
        })
    }

    function addColor() {
        if(colors.length == 0) {
            colorIndex = 0;
        }
        const hex = hsl2hex(hueSlider.value, satSlider.value, lightSlider.value);
        colors.push(hex);
        createSwatch(hex);
    }

    function clearColorScheme() {
        if(colors.length != 0) {
            colors.splice(0);
            checkSimpleBar();
            if(!isSimpleBar) {
                while(colorScheme.firstElementChild) {
                    colorScheme.removeChild(colorScheme.lastElementChild);
                }
            } else {
                const simpleBarContent = colorScheme.querySelector(".simplebar-content");
                while(simpleBarContent.firstElementChild) {
                    simpleBarContent.removeChild(simpleBarContent.lastElementChild);
                }
            }
        }
    }

    function saveColorScheme() {
        if(colors.length != 0) {
            userSettings["colorScheme"] = colors;
            localStorage.setItem("settings", JSON.stringify(userSettings));
            settingsTag.removeChild(colorSchemeEditor);
            settingsButton.disabled = false;
        } else {
            window.alert("Add a color to save your color scheme");
        }
    }
    
    function cancelEdits() {
        if(colors.length != 0) {
                colors.splice(0);
            }
        if(userSettings["colorScheme"] != null) {
            colors.push(...userSettings["colorScheme"]);
        } else {
            const defaultColors = ['#FBAD58', '#EC81AD', '#B2323F', '#1BA0F2',
            '#9966FF', '#447231','#DAC328', '#E4543C','#AA770C','#9CBCB1',
            '#D2EDFF','#FFC311','#115B98','#8D94DA','#275650']
            colors.push(...defaultColors);
        }
        settingsTag.removeChild(colorSchemeEditor);
        settingsButton.disabled = false;
    }
    // Add Functionality
    colorPicker.addEventListener("change", () => {
        document.documentElement.style.setProperty("--base", `hsl(${hueSlider.value}, ${satSlider.value}%, ${lightSlider.value}%)`);
        document.documentElement.style.setProperty("--saturation", `linear-gradient(to right, hsl(${hueSlider.value},0%,${lightSlider.value}%), hsl(${hueSlider.value},100%,${lightSlider.value}%))`)
        document.documentElement.style.setProperty("--lightness", `linear-gradient(to right, hsl(${hueSlider.value},${satSlider.value}%,0%), hsl(${hueSlider.value},${satSlider.value}%,50%), hsl(${hueSlider.value},${satSlider.value}%,100%))`)
    });

    selectColor.addEventListener("click", addColor);
    clearColors.addEventListener("click", clearColorScheme);
    saveColors.addEventListener("click", saveColorScheme);
    cancelButton.addEventListener("click", cancelEdits);

    colors.forEach(color => {
        createSwatch(color);
    });
}