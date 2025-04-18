// Variables For Time
const date = new Date()
date.setHours(0,0,0,0);
const today = new Date(date);
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const days = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

// Variables for Reports
const dailyReport = document.querySelector('.daily');
dailyReport.date = null;
dailyReport.isEmpty = null;
dailyReport.timeElapsed = null;
let backup = [];
const editDaily = dailyReport.querySelector('button');
const weeklyReport = document.querySelector('.weekly');
weeklyReport.week = null;
let editing = false;

// Variables For Calendar
const title = document.querySelector('.title');
const forward = document.getElementById('forward');
const backward = document.getElementById('backward');
const calendarBody = document.querySelector('.body');
let monthRecord;

// Functions for Reports

    // Accessing Records
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

function accessRecords(timeStamp, numDays) {
    const records = [];
    const recordDate = new Date(date);
    const recordDateOf = recordDate.getDate()
    let record = versionLoader(timeStamp);
    records.push(record);
    for (let i = 1; i < numDays; i++) {
        recordDate.setDate(recordDateOf + i);
        timeStamp = recordDate.getTime()
        record = versionLoader(timeStamp);
        records.push(record);    
    };
    return records;
}

function totalTimes(records) {
    let totaled = []

    // For each record in records check if the entry is inside Totaled to add times, otherwise push the entry to totaled
    records.forEach(record => {
        if (record != null) {
            record.forEach(entry => {
                const name = entry.name;
                const time = entry.time
                if (totaled.some(el => el.name === name)) {
                    const item = totaled.find(el => el.name === name);
                    item.time += time;
                } else {
                    totaled.push({name, time});
                }
            });
        }
    });

    return totaled
}

    // Editing Records
function toggleEditable() {

    const body = dailyReport.firstElementChild.nextElementSibling;

    if(!dailyReport.isEmpty){

        // Toggle editablity of entries
        let entry = body.firstElementChild;

        while (entry.nextElementSibling) {
            const activityName = entry.firstElementChild;
            activityName.readOnly = editing;
                
            const activityTimeContainer = activityName.nextElementSibling;
            activityTimeContainer.firstElementChild.readOnly = editing;
            activityTimeContainer.lastElementChild.readOnly = editing;

            if(!editing) {
                activityName.classList.add('editing');
                activityTimeContainer.classList.add('editing');
                activityTimeContainer.firstElementChild.classList.add('editing');
                activityTimeContainer.lastElementChild.classList.add('editing');

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete');
                deleteButton.innerHTML = 'x';
                entry.appendChild(deleteButton);
                deleteButton.addEventListener('click', (e) => deleteEntry(e));

                backup.push({name: activityName.value, time: activityTimeContainer.value});
            } else {
                activityName.classList.remove('editing');
                activityTimeContainer.classList.remove('editing');
                activityTimeContainer.firstElementChild.classList.remove('editing');
                activityTimeContainer.lastElementChild.classList.remove('editing');
            }

            // Move to next entry
            entry = entry.nextElementSibling;
        }

        entry.firstElementChild.readOnly = editing;
        entry.firstElementChild.nextElementSibling.firstElementChild.readOnly = editing;
        entry.firstElementChild.nextElementSibling.lastElementChild.readOnly = editing;

        if(!editing) {
            entry.firstElementChild.classList.add('editing');
            entry.firstElementChild.nextElementSibling.classList.add('editing');
            entry.firstElementChild.nextElementSibling.firstElementChild.classList.add('editing');
            entry.firstElementChild.nextElementSibling.lastElementChild.classList.add('editing');

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete');
            deleteButton.innerHTML = 'x';
            entry.appendChild(deleteButton);
            deleteButton.addEventListener('click', (e) => deleteEntry(e));

            backup.push({name: entry.firstElementChild.value, time: entry.firstElementChild.nextElementSibling.value});
        } else {
            entry.firstElementChild.classList.remove('editing');
            entry.firstElementChild.nextElementSibling.classList.remove('editing');
            entry.firstElementChild.nextElementSibling.firstElementChild.classList.remove('editing');
            entry.firstElementChild.nextElementSibling.lastElementChild.classList.remove('editing');
        }
    }

    // Create an empty entry if editing and a cancel button
    if (!editing) {
        if (dailyReport.isEmpty) {
            body.firstElementChild.remove()
        }
        createEmptyEntry(body);

        const cancelButton = document.createElement('button');
        cancelButton.classList.add('edit','cancel');
        cancelButton.innerHTML = 'Cancel Edits';
        cancelButton.addEventListener('click', () => {cancelEdits(body)});
        body.nextElementSibling.appendChild(cancelButton);

        editDaily.innerHTML = 'Save Edits';
        dailyReport.isEmpty = false;

    } else {
        // Check for incomplete entries and add complete entries to saveFile
        const saveFile = {version: 2.0, activityList: []};
        const entries = body.querySelectorAll('.entry');
        entries.forEach(entry => {
            const activityName = entry.firstElementChild.value;
            const activityTimeContainer = entry.firstElementChild.nextElementSibling;
            const activityHr = activityTimeContainer.firstElementChild.value;
            const activityMn = activityTimeContainer.lastElementChild.value;

            if(activityName === '' || activityHr === '' || activityMn === '' || (activityHr === '00' && activityMn === '00')) {
                entry.remove();
                return;
            }

            const totalTime = activityHr * 3600000 + activityMn * 60000;
            activityTimeContainer.value = totalTime;

            saveFile.activityList.push({name: activityName, time: totalTime});
            entry.lastElementChild.remove();
        });

        // Save files
        const display = [date.getFullYear(), date.getMonth(), date.getDate()];

        date.setFullYear(dailyReport.date[0]);
        date.setMonth(dailyReport.date[1]);
        date.setDate(dailyReport.date[2]);

        const timeStamp = date.getTime();
        localStorage.setItem(timeStamp, JSON.stringify(saveFile));

        // Reset Entries and Buttons
        if(!body.firstElementChild) {
            dailyReport.isEmpty = true;
            dailyReport.timeElapsed = 0;
            body.innerHTML = '<div class="entry null">No Record Found</div>';
            body.nextElementSibling.firstElementChild.innerHTML = 'Add Record';
        } else {
            editDaily.innerHTML = 'Edit Record';
        }

        backup = [];
        const cancelButton = document.querySelector('.cancel');
        cancelButton.remove();

        // Reset Calendar Display
        if(date.getFullYear() === display[0] && date.getMonth() === display[1] && calendarBody.display != 'year') {
            const i = date.getDate();
            monthDisplay();
            createWeeklyReport(i, true);
            date.setDate(i);
        } else{
            date.setFullYear(display[0]);
            date.setMonth(display[1]);
            date.setDate(display[2]);
        }
    }

    editing = !editing;
}

function detectEdits(input) {
    // Parse ID
    const id = input.id;
    const idSplit = id.split('-');
    const index = idSplit[1];
    const index_2 = idSplit[0] === 'name' ? 0 : 1;

    // Validate Numbers

    if(index_2 === 1) {
        // Total the time entered
        const hourEditHTML = idSplit[0] === 'hr' ? input : input.previousElementSibling.previousElementSibling;
        let hourEditValue = Number(hourEditHTML.value) || 0;
        const minEditHTML = idSplit[0] === 'hr' ? input.nextElementSibling.nextElementSibling : input;
        let minEditValue = Number(minEditHTML.value) || 0;
        
        let timeEdited = hourEditValue * 3600000 + minEditValue * 60000;
        if(timeEdited < 0) {
            timeEdited = 0;
        }

        const previousTime = input.parentElement.previousTime || (index < backup.length ? backup[index].time : 0);
        const otherTimes = dailyReport.timeElapsed - previousTime;
        
        // Evaluate Edited Time
        if(otherTimes + timeEdited >= 86400000) {
            timeEdited = 86400000 - otherTimes;
        }

        hourEditValue = String(Math.floor(timeEdited/3600000)).padStart(2,"0");                        
        minEditValue =  String(Math.floor(timeEdited/60000) % 60).padStart(2,"0");

        // Update Values
        hourEditHTML.value = hourEditValue;
        minEditHTML.value = minEditValue;
        dailyReport.timeElapsed = otherTimes + timeEdited;
        input.parentElement.previousTime = timeEdited;

    }
}

function cancelEdits(body) {
    while(body.firstElementChild) {
        body.firstElementChild.remove();
    }

    if (backup != 0) {
        dailyReport.isEmpty = false;
        createEntries(backup, body);
        body.nextElementSibling.firstElementChild.innerHTML = 'Edit Record';

    } else {
        dailyReport.isEmpty = true;
        dailyReport.timeElapsed = 0;
        body.innerHTML = '<div class="entry null">No Record Found</div>';
        body.nextElementSibling.firstElementChild.innerHTML = 'Add Record';
    }

    body.nextElementSibling.lastElementChild.remove();
    editing = !editing;
    backup = [];
}

function deleteEntry(e) {
    const body = dailyReport.firstElementChild.nextElementSibling;
    const entry = e.target.parentElement;
    body.removeChild(entry);
}

    // Creating Entries and Reports
function createEmptyEntry(body) {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('entry');
    body.appendChild(entryDiv);

    const newActivity = document.createElement('input');
    newActivity.classList.add('activity');
    newActivity.classList.add('editing');
    newActivity.id = `name-${backup.length}`;
    newActivity.placeholder = "Activity";

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('time-container');

    const separator = document.createElement('div');
    separator.classList.add('editing');
    separator.innerHTML = ':';
    separator.style.display = 'inline-block';

    const hourDiv = document.createElement('input');
    hourDiv.classList.add('time');
    hourDiv.classList.add('editing');
    hourDiv.id = `hr-${backup.length}`;
    hourDiv.type = 'number'
    hourDiv.placeholder = '00';

    const minDiv = document.createElement('input');
    minDiv.classList.add('time');
    minDiv.classList.add('editing');
    minDiv.id = `mn-${backup.length}`;
    minDiv.type = 'number';
    minDiv.placeholder = '00';

    body.lastElementChild.appendChild(newActivity);
    body.lastElementChild.appendChild(timeDiv);
    timeDiv.appendChild(hourDiv);
    timeDiv.appendChild(separator);
    timeDiv.appendChild(minDiv);
}

function createEntries(completeRecord, body, type = 'daily') {
    
    // Sort Record and Clear Body
    const recordSorted = completeRecord.sort((a,b) => b.time - a.time);
    body.innerHTML = '';
    let item = 0;
    let timeElapsed = 0;
        
    // For each Entry in the Record create a Div element
    recordSorted.forEach(entry => {

        // Create Div elements
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('entry');

        const nameDiv = document.createElement('input');
        nameDiv.classList.add('activity');
        nameDiv.id = `name-${item}`;
        nameDiv.readOnly = true;

        const timeDiv = document.createElement('div');
        timeDiv.classList.add('time-container');

        const separator = document.createElement('div');
        separator.innerHTML = ':';
        separator.style.display = 'inline-block';

        const hourDiv = document.createElement('input');
        hourDiv.classList.add('time');
        hourDiv.id = `hr-${item}`;
        hourDiv.type = 'number'
        hourDiv.readOnly = true;


        const minDiv = document.createElement('input');
        minDiv.classList.add('time');
        minDiv.id = `mn-${item}`;
        minDiv.type = 'number';
        minDiv.readOnly = true;

        // Parse Data
        const name = entry.name;
        const time = entry.time;
        const hr = String(Math.floor(time/3600000)).padStart(2,"0");
        const min = String(Math.floor(time/60000) % 60).padStart(2,"0");

        if(type === 'daily') {
            timeElapsed += time;
        }
        
        //Append Data to document
        nameDiv.value = name;
        timeDiv.value = time;
        hourDiv.value = hr;
        minDiv.value = min;

        entryDiv.appendChild(nameDiv);
        entryDiv.appendChild(timeDiv);
        timeDiv.appendChild(hourDiv);
        timeDiv.appendChild(separator);
        timeDiv.appendChild(minDiv);
        body.appendChild(entryDiv);

        item += 1;
    });
    
    if(type === 'daily') {
        dailyReport.timeElapsed = timeElapsed;
    }
}
        
function createDailyReport(i) {
    // Retrieve Data
    date.setDate(i);
    const header = dailyReport.firstElementChild;
    const body = header.nextElementSibling;
    const footer = body.nextElementSibling;

    // Check editing to cancel edits to previous report
    if (editing){
        cancelEdits(body);
    }
    editing = false;
    
    //Create Report
    header.innerHTML = `<div style='justify-self:center;'>${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</div>`;
    
    // Check for a complete Record
    if (monthRecord[i-1] != null) {
        dailyReport.isEmpty = false;
        createEntries(monthRecord[i-1], body);
        footer.firstElementChild.innerHTML = 'Edit Record';

    } else {
        dailyReport.isEmpty = true;
        dailyReport.timeElapsed = 0;
        body.innerHTML = '<div class="entry null">No Record Found</div>';
        footer.firstElementChild.innerHTML = 'Add Record';
    }
    
    // Highlight Selected Day and Unhighlight Previous Selection
    if (dailyReport.date != null) {
        const prevSelected = document.getElementById(dailyReport.date[2]);
        prevSelected.classList.remove('selected');
        prevSelected.classList.remove('disable');
        prevSelected.disabled = false;
    }

    const selected = document.getElementById(i);
    selected.classList.add('selected');
    selected.classList.add('disable');
    selected.disabled = true;
    
    // Save selection for Future Reference
    dailyReport.date = [date.getFullYear(), date.getMonth(), i];
}

function createWeeklyReport(i, refresh = false) {
    // Find First Day of the Week
    const selected = date.getTime();
    date.setDate(i);
    const dayWeek = date.getDay();
    date.setDate(i-dayWeek);
    const weekTimeStamp = date.getTime();
    
    if (weeklyReport.week != weekTimeStamp || refresh) {
        // Assess Records of the week
        const weekRecord = monthRecord.slice(date.getDate()-1,(date.getDate()+6));
        const totaled = totalTimes(weekRecord);

        // Update Report
        const header = weeklyReport.firstElementChild;
        const body = header.nextElementSibling;

        const startWeek = [date.getFullYear(), months[date.getMonth()].slice(0,3), String(date.getDate()).padStart(2,'0')];
        date.setDate(date.getDate()+6);
        const endWeek = [date.getFullYear(), months[date.getMonth()].slice(0,3), String(date.getDate()).padStart(2,'0')];
        let text = `<div style='justify-self:center;'>${startWeek[1]}. ${startWeek[2]} — `;

        if (startWeek[0] === endWeek[0] && startWeek[1] === endWeek[1]) {
            text += `${endWeek[2]}`;
        } else {
            text += `${endWeek[1]}. ${endWeek[2]}`;
        }
        text += '</div>';
        text = text.replace('May.', 'May');

        header.innerHTML = text;

        if (totaled.length != 0) {
            createEntries(totaled, body, 'weekly');
        } else {
            body.innerHTML = '<div class="entry null">No Records Found</div>';
        }

        // Add Time Stamp to Weekly Report
        weeklyReport.week = weekTimeStamp;
    }

    // Reset Date
    date.setTime(selected);
}

function createMonthlyReport(i) {
    // Find Last Day and First Day of the Month
    const selected = date.getTime();
    date.setMonth(date.getMonth() + 1, 0);
    const numDays = date.getDate();
    date.setDate(1);

    if (monthlyReport.year != date.getFullYear() && monthlyReport.month != date.getMonth()) {
        const records = accessRecords(date.getTime(), numDays);
        const totaled = totalTimes(records);

        const header = monthlyReport.firstElementChild;
        const body = header.nextElementSibling;

        header.innerHTML = `<div style='justify-self:center;'>${months[date.getMonth()]}</div>`;

        if (totaled.length != 0) {
            createEntries(totaled, body, 'monthly');
        } else {
            body.innerHTML = '<div class="entry null">No Records Found</div>';
        }

        // Record which month has been reported 
        monthlyReport.month = date.getMonth();
        monthlyReport.year = date.getFullYear();
    };
    
    date.setTime(selected);
}

// Functions for Calendar
function createWeek(date, end, day = 0) {
    const weekDiv = document.createElement('div');
    weekDiv.classList.add('row');

    let str = '';
    if (day != 0) {
        for (let i = 0; i < day; i++) {
            str = str + `<button class="day disable"></button>`
        }
    }
    for (day; day < 7; day++) {
        str = str + `<button class="day" id= ${date}>${String(date).padStart(2,"0")}</button>`
        date++;
        if (date > end) {
            break
        }
    }
    if (day != 7) {
        for (day; day < 6; day++) {
            str = str + `<button class="day disable"></button>`
        }
    }

    weekDiv.innerHTML = str;
    calendarBody.appendChild(weekDiv);
    return date
}

function monthDisplay() {
    //Update Title and set calendarBody.display
    title.innerHTML = `${months[date.getMonth()]} ${date.getFullYear()}`
    calendarBody.display = 'month'

    //Find the day of the week of the first day of the month and how many days in the month
    date.setMonth(date.getMonth()+1,0);
    endMonth = date.getDate();
    date.setDate(1);
    startMonth = date.getDay();

    //Clear the existing Month
    while (calendarBody.firstElementChild) { 
        calendarBody.removeChild(calendarBody.firstElementChild);
    }

    //Create Weeks of the Month
    let calendarDate = 1;
    calendarDate = createWeek(calendarDate, endMonth, startMonth);
    while (calendarDate <= endMonth) {
        calendarDate = createWeek(calendarDate, endMonth);
    }

    //Check for Today
    if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()) {
        document.getElementById(today.getDate()).classList.add('today');
    }

    //Check for Selected Day
    if (dailyReport.date != null && date.getFullYear() === dailyReport.date[0] && date.getMonth() === dailyReport.date[1]) {
        const selected = document.getElementById(dailyReport.date[2]);
        selected.classList.add('selected');
        selected.classList.add('disable');
    }

    // Update monthRecord and Mark Dates with Records
    monthRecord = accessRecords(date.getTime(), endMonth);
    monthRecord.forEach(entry => {
        if(entry != null) {
            const button = document.getElementById(monthRecord.indexOf(entry)+1);
            button.classList.add('marker');
        }
    });

    //Add functionality to Days of the Month
    for (let i = 1; i < endMonth + 1; i++) {
        const dateButton = document.getElementById(i);
        dateButton.addEventListener('click', () => {
            createDailyReport(i);
            createWeeklyReport(i);
        });
    }
}

function yearDisplay() {
    //Update Title and caledarBody.display
    title.innerHTML = `${date.getFullYear()}`
    calendarBody.display = 'year'
    calendarBody.innerHTML = ''
    const row = document.createElement('div');
    row.classList.add('row');
    calendarBody.appendChild(row);

    let el = 0;
    months.forEach(month => {
        const button = document.createElement('button');
        button.classList.add('month');
        button.id = month;
        button.innerHTML = month.slice(0,3);
        calendarBody.lastElementChild.appendChild(button);
        el += 1;
        if (el % 3 === 0 && month != 'December') {
            const row = document.createElement('div');
            row.classList.add('row');
            calendarBody.appendChild(row);
        }
    });

    months.forEach(month => {
        const moon = document.getElementById(month);
        moon.addEventListener('click',() => {
            date.setMonth(months.indexOf(month));
            monthDisplay();
        });
    })


}

function shift(direction) {
    if (calendarBody.display === 'month') {
        date.setMonth(date.getMonth()+direction);
        monthDisplay();
    } else if (calendarBody.display === 'year') {
        date.setFullYear(date.getFullYear()+direction);
        yearDisplay();
    }
}

//Initialize
monthDisplay();
createDailyReport(today.getDate());
createWeeklyReport(today.getDate());

//Daily Record Functionality
editDaily.addEventListener('click', toggleEditable);
dailyReport.addEventListener('change', (e) => {
    detectEdits(e.target);

    const body = dailyReport.firstElementChild.nextElementSibling;
    const emptyEntry = body.lastElementChild;
    const emptyEntryActivity = emptyEntry.firstElementChild.value;
    const emptyEntryHour = emptyEntry.lastElementChild.firstElementChild.value;
    const emptyEntryMin = emptyEntry.lastElementChild.lastElementChild.value;
    
    const targetEntry = e.target.parentElement.classList.contains('time-container') ? e.target.parentElement.parentElement : e.target.parentElement;

    if(targetEntry === emptyEntry && emptyEntryActivity != '' && emptyEntryHour != '' && emptyEntryMin != '') {
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.innerHTML = 'x';
        deleteButton.addEventListener('click', (e) => deleteEntry(e));
        targetEntry.appendChild(deleteButton);
        
        createEmptyEntry(body);
    }
});

//Calendar Functionality
calendarBody.addEventListener('wheel', (e) => {
    if(e.deltaY > 0) {
        shift(1);
    } else if(e.deltaY < 0) {
        shift(-1);
    }
});

forward.addEventListener('click', () => {
    shift(1);
});

backward.addEventListener('click', () => {
    shift(-1);
});

title.addEventListener('click', () => {
    if (calendarBody.display === 'month') {
        yearDisplay();
    } else {
        window.alert('Not Developed Yet');
    }
});