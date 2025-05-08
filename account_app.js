//Idea save a record of time punches in as well as out

const navbar = document.querySelector('nav')
const content = document.querySelector('.content');
const leaderboard = document.querySelector('.activity-report');
const timersContainer = document.querySelector('.timers-container');
const addTimerButton = document.getElementById('add-timer');
const colors = ['#FBAD58', '#EC81AD', '#B2323F', '#1BA0F2',
    '#9966FF', '#447231','#DAC328', '#E4543C','#AA770C','#9CBCB1',
    '#D2EDFF','#FFC311','#115B98','#8D94DA','#275650'];
let ticking = false;
let navHidden = false;
let previousList = [];
let previousUnaccountedTime = 0;
let activeTimer = null;
let colorIndex = 0;
let day = new Date().setHours(0,0,0,0);

function versionLoader(timeStamp) {
    let record = JSON.parse(localStorage.getItem(timeStamp));
    if(record != null && record.hasOwnProperty('version')) {
        if(record.activityList != 0) {
            record = record.activityList;
        } else {
            record = null;
        }
    }
    return record;
}

function checkDate(nowMs, date) {
    if (nowMs - date >= 86400000) {
        const saveFile = {version: 2, activityList: []};
        let name = 'Activity'
        let wasActive = false;

        if (activeTimer != null) {
            name = activeTimer.firstElementChild.firstElementChild.value;
            wasActive = true;
            activeTimer = null;
        }
        
        while (timersContainer.firstElementChild && timersContainer.firstElementChild != addTimerButton) {
            const timer = timersContainer.firstElementChild;
            const name = timer.firstElementChild.firstElementChild.value;
            const time = timer.elapsedTime;

            saveFile.activityList.push({
                name : name,
                time : time
            });
            
            timersContainer.removeChild(timersContainer.firstElementChild);
        };
        localStorage.setItem(date, JSON.stringify(saveFile));
        day = new Date().setHours(0,0,0,0);
        createTimer(name);

        if (wasActive) {
            activeTimer = addTimerButton.previousElementSibling;
            activeTimer.timeStamp = new Date(day).setHours(0,0,0,499);
            activeTimer.previousTime = 0;
            activeTimer.isRunning = true;
            activeTimer.lastElementChild.firstElementChild.disabled = true;
            activeTimer.lastElementChild.lastElementChild.disabled = false;
        }
    };
}

function rgb2hex(string) {
    const element = string.slice(4,-1);
    const parts = element.split(",");
    let hex = "#";
    parts.forEach(part => {
        const converted = parseInt(part.trim()).toString(16).padStart(2,"0").toUpperCase();
        hex += converted;
    });
    return hex;
}

function update() {
    let msPassed = 0;

    //Get Time Stamp
    const now = new Date();
    const nowMs = Date.parse(now);

    checkDate(nowMs, day);

    if (activeTimer != null) {
        updateTimer(activeTimer, now);
    };

    //Compile Data

    let activities = [];
    let percentPassed = 0;
    let updateCSS = "conic-gradient(";
    
    const timers = timersContainer.querySelectorAll('.timer');

    timers.forEach(timer => {
        const name = timer.firstElementChild.firstElementChild.value;
        const color = timer.style.backgroundColor;
        const time = timer.elapsedTime;

        //Totaling Time
        msPassed += time;

        //Gathering Attributes of Activities
        activities.push({"name":name, "color":color, "time":time})
        
        //Writing Chart Styling
        const percentIncrement = time / 86400000 * 100;
        const increased = percentPassed + percentIncrement;
        updateCSS += `${color} ${percentPassed.toFixed(2)}% ${increased.toFixed(2)}%,\n`;
        percentPassed += percentIncrement;
    });
    
    updateCSS += `#6f7174 ${percentPassed.toFixed(2)}% 100%)`
    
    //Creating Leaderboard
    activities.sort((a,b) => b.time - a.time);

    if(hasChanged(activities)) {
        const activityList = leaderboard.querySelector('.simplebar-content');
    
        let text = "";
        activities.forEach(activity => {
            text += `<p style="background-color:${activity.color};"> ${activity.name} </p>`;
        });
        activityList.innerHTML = text;

        previousList = JSON.parse(JSON.stringify(activities));
    }

    //Updating CSS of Chart
    document.documentElement.style.setProperty (`--colors`, updateCSS);

    //Finding Unaccounted Time
    const unaccountedTime = Math.round((nowMs-day-msPassed)/1000);
    const unaccHour = String(Math.floor(unaccountedTime / 3600)).padStart(2, '0');
    const unaccMin = String(Math.floor((unaccountedTime % 3600) / 60)).padStart(2, '0');
    const unaccSec = String(unaccountedTime % 60).padStart(2,'0');
    
    //Update HTML with new times
    if (previousUnaccountedTime != unaccountedTime) {
        const unaccountedTimeUpdate = document.querySelector('.unaccounted');
        unaccountedTimeUpdate.innerHTML = `${unaccHour}:${unaccMin}:${unaccSec}`;

        previousUnaccountedTime = unaccountedTime;
    }
    
}

function hasChanged(currentList) {
    if (previousList.length !== currentList.length) {
        return true;
    }

    for(let i = 0; i < currentList.length; i++) {
        if(currentList[i].color !== previousList[i].color || currentList[i].name !== previousList[i].name) {
            return true;
        }
    }

    return false;
}

function updateTimer(timer, now) {
    timer.elapsedTime = now - timer.timeStamp + timer.previousTime;
    const totalSeconds = Math.round(timer.elapsedTime/1000);
    const hours = String(Math.floor(totalSeconds/3600)).padStart(2,'0');
    const minutes = String(Math.floor((totalSeconds % 3600)/ 60)).padStart(2,'0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    [timer.inputs[0].value, timer.inputs[1].value, timer.inputs[2].value] = [hours, minutes, seconds];
}

function createBackup(date) {
    const backupFile = {version: 2.0, activityList: []};

    timers = timersContainer.querySelectorAll('.timer');
    timers.forEach(timer => {
        const name = timer.firstElementChild.firstElementChild.value;
        const time = timer.elapsedTime;
        const color = timer.style.backgroundColor;
        const active = timer.isRunning;
        const timeStamp = timer.timeStamp;
        const previousTime = timer.previousTime;

        backupFile.activityList.push({
            name,
            time,
            color,
            active,
            timeStamp,
            previousTime
        });
    });
    localStorage.setItem(date, JSON.stringify(backupFile));
}

function createTimer(name = "Activity", time =  0, color = null) {
    //Create Timer Div
    const timerDiv = document.createElement('div');
    timerDiv.classList.add('timer');
    if (color === null) {
        timerDiv.style.backgroundColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
    } else {
        timerDiv.style.backgroundColor = color;
        colorIndex = (colors.indexOf(rgb2hex(color)) + 1) % colors.length;
    }

    timerDiv.innerHTML = `
        <div class="timer-header">
            <input type="text" class="timer-name" id="${colorIndex}" value="${name}" />
            <button class="delete-timer">×</button>
        </div>
        <div>
            <p><input type="number" class="timer-input" id ="hr${colorIndex}" placeholder="00">:
            <input type="number" class="timer-input" id ="min${colorIndex}" placeholder="00">:
            <input type="number" class="timer-input" id ="sec${colorIndex}" placeholder="00"></p>
        </div>
        <div class="controls">
            <button class="start-button">Start</button>
            <button class="pause-button">Pause</button>
        </div>
    `;

    timersContainer.insertBefore(timerDiv, addTimerButton);

    //Create Functionality for Timer
    const timerNameInput = timerDiv.querySelector('.timer-name');
    const inputs = timerDiv.querySelectorAll('.timer-input');
    const startButton = timerDiv.querySelector('.start-button');
    const pauseButton = timerDiv.querySelector('.pause-button');
    const deleteButton = timerDiv.querySelector('.delete-timer');

    timerDiv.inputs = timerDiv.querySelectorAll('.timer-input');
    timerDiv.elapsedTime = time;
    if (time > 0) {
        const hr = String(Math.floor(time/3600000)).padStart(2,"0");
        const min = String(Math.floor(time/60000) % 60).padStart(2,"0");
        const sec = String(Math.floor(time/1000) % 60).padStart(2,"0");
        [inputs[0].value, inputs[1].value, inputs[2].value] = [hr, min, sec];
    }
    timerDiv.isRunning = false;

    function validateNum() {
        const elapsedTimers = document.querySelectorAll('.timer');
        let accountedTime = 0;

        elapsedTimers.forEach(timer => accountedTime += timer.elapsedTime);

        let inputHr = parseInt(inputs[0].value) || 0;
        let inputMin = parseInt(inputs[1].value) || 0;
        let inputSec = parseInt(inputs[2].value) || 0;

        const now = new Date();
        const nowMs = Date.parse(now);

        const totalTime = nowMs-day;

        if (Math.floor(inputMin/60) >= 1 || Math.floor(inputSec/60) >= 1) {
            const overHr = (inputHr + Math.floor(inputMin/60) + Math.floor(inputSec/3600));
            const overMin = (inputMin + Math.floor(inputSec/60)) % 60;
            const overSec = inputSec % 60;
            [inputHr, inputMin, inputSec] = [overHr, overMin, overSec];
        };

        let totalInput = (inputHr*3600 + inputMin * 60 + inputSec) * 1000;

        if (totalInput + accountedTime - timerDiv.elapsedTime > totalTime) {
            totalInput = totalTime - accountedTime + timerDiv.elapsedTime;
            const totalSeconds = Math.floor(totalInput / 1000);
            inputSec = totalSeconds % 60;
            inputMin = Math.floor((totalSeconds - inputSec) / 60) % 60;
            inputHr = Math.floor((totalSeconds - inputSec - (inputMin * 60))/3600); 
        }

        inputHr = String(Math.max(0, Math.min(23, inputHr))).padStart(2,"0");
        inputMin = String(Math.max(0, Math.min(59, inputMin))).padStart(2,"0");
        inputSec = String(Math.max(0, Math.min(59, inputSec))).padStart(2,"0");
        [inputs[0].value, inputs[1].value, inputs[2].value] = [inputHr, inputMin, inputSec];
        timerDiv.elapsedTime = totalInput;
    };

    function isEnter(e, input) {
        if(e.key === "Enter") {
            e.preventDefault();
            input.blur();
        }
    };

    startButton.addEventListener('click', () => {
        if (activeTimer && activeTimer !== timerDiv) {
            const activeStartButton = activeTimer.querySelector('.start-button');
            const activePauseButton = activeTimer.querySelector('.pause-button');
            activeStartButton.disabled = false;
            activePauseButton.disabled = true;
            activeTimer.isRunning = false;
        }

        if (!timerDiv.isRunning) {
            timerDiv.timeStamp = new Date()
            timerDiv.previousTime = timerDiv.elapsedTime;
            timerDiv.isRunning = true;
            activeTimer = timerDiv;
            startButton.disabled = true;
            pauseButton.disabled = false;
        }
    });

    pauseButton.addEventListener('click', () => {
        if (timerDiv.isRunning) {
            timerDiv.isRunning = false;
            activeTimer = null;
            startButton.disabled = false;
            pauseButton.disabled = true;
        }
    });

    deleteButton.addEventListener('click', () => {
        timersContainer.removeChild(timerDiv);
    });

    timerNameInput.addEventListener('blur', () => {
        const newName = timerNameInput.value.trim();
        if (!newName) {
            timerNameInput.value = "Activity";
        }
    });
    
    timerNameInput.addEventListener('keydown', (e) => isEnter(e, timerNameInput));
    inputs.forEach(input => input.addEventListener('blur', () => validateNum()));
    inputs.forEach(input => input.addEventListener('keydown', (e) => isEnter(e,input)));

    startButton.disabled = false;
    pauseButton.disabled = true;
    
}

const backup = versionLoader(day);

//Page Reloader
if (backup != null) {
    backup.forEach(timer => {
        createTimer(timer.name, timer.time, timer.color);
        if (timer.active) {
            activeTimer = addTimerButton.previousElementSibling;
            activeTimer.timeStamp = new Date(timer.timeStamp);
            activeTimer.previousTime = timer.previousTime;
            activeTimer.isRunning = timer.active;
            activeTimer.lastElementChild.firstElementChild.disabled = true;
            activeTimer.lastElementChild.lastElementChild.disabled = false;
        };
    });
} else {
    createTimer();
}

// Initialize simplebar for activity report
new SimpleBar(leaderboard, {
    autoHide: true,
});

//Update Page every Second
setInterval(update, 1000);

//Backup Page every 30 Seconds
setInterval(() => {createBackup(day)}, 30000);


//Add functionality to "Add Timer" Button
addTimerButton.addEventListener('click', () => {createTimer()});

// Hide Navbar when working in the app

window.addEventListener('mousemove', (e) => {
    if(!ticking) {
        window.requestAnimationFrame(() =>{
            // Probably need to check if a dropdown is active to avoid problems
            if(e.y < 30 && navHidden) {
                navbar.classList.remove('hidden');
                navHidden = false;
            } else if(e.y >= 100 && !navHidden){
                navbar.classList.add('hidden');
                navHidden = true;
            }
        ticking = false;
        });
        ticking = true;
    }
});