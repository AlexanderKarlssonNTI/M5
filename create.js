const buttons = {
    circle: document.getElementById('btn-circular'),
    rectangle: document.getElementById('btn-rectangle'),
    branch: document.getElementById('btn-branch')
};
const display = document.getElementById('row-container');

const optionalSections = document.querySelectorAll('[data-require-world]');
const rememberWorldType = document.getElementById('remember-world-type');

const hiddenNameComparisonInput = document.getElementById('name-comparison');
const randomizeWorldNameButton = document.getElementById('btn-random-world-name');

const nameConfig = document.getElementById('world-name');
const lengthConfig = document.getElementById('world-side-length');
const widthConfig = document.getElementById('world-side-width');
const numberOfRoomsConfig = document.getElementById('world-number-of-rooms');
const startLengthConfig = document.getElementById('world-start-length');
const branchFactorConfig = document.getElementById('world-branch-factor');
const branchCheckBoxConfig = document.getElementById("connect-branch-box");


let wantedWorldType = 'circle';
if (Object.keys(buttons).includes(rememberWorldType.value)) {
    // Remember world type between reloads (just like other config values):
    wantedWorldType = rememberWorldType.value;
}
function onWorldTypeChanged() {
    rememberWorldType.value = wantedWorldType;

    // Highlight buttons:
    for (const [key, buttonElement] of Object.entries(buttons)) {
        buttonElement.classList.toggle('selected', key === wantedWorldType);
    }
    // Hide/show sections/divs
    for (const section of optionalSections) {
        const enabled = section.getAttribute('data-require-world') === wantedWorldType;
        section.classList.toggle('enabled', enabled);
    }
}
onWorldTypeChanged();

function randomizeWorldName() {
    // hiddenNameComparisonInput.value = WorldBaptist();
    nameConfig.value = WorldBaptist();
    // while (nameConfig.value == hiddenNameComparisonInput.value) {
    //     console.log('a');
    //     hiddenNameComparisonInput.value = WorldBaptist();
    //     if (nameConfig.value != hiddenNameComparisonInput.value) {
    //         nameConfig.value = hiddenNameComparisonInput.value;
    //     }
    // }
}

let currentWorld = null;
let updateCurrentUi = function () { };
const generateWorld = function (showAsWell = true) {
    let createdWorld;

    // Default world name
    let worldName;
    if (nameConfig.value) {
        worldName = nameConfig.value;
    } else {
        let world = new World();
        worldName = world.name;
    }

    let errorMessage = null;
    switch (wantedWorldType) {
        case 'circle':
            const numberOfRooms = parseInt(numberOfRoomsConfig.value);
            if (isNaN(numberOfRooms)) {
                errorMessage = 'Number of rooms is not a number';
            } else if (numberOfRooms <= 0) {
                errorMessage = 'Must be at least one room for a circular world';
            } else if (numberOfRooms > 1000) {
                errorMessage = 'There is such a thing as too big';
            } else {
                createdWorld = new World(worldName, 'circle', numberOfRooms);
            }
            break;
        case 'rectangle':
            const length = parseInt(lengthConfig.value);
            const width = parseInt(widthConfig.value);
            if (isNaN(length) || isNaN(width)) {
                errorMessage = ('Invalid inputs, need to be numbers');
            } else if (length <= 0 || width <= 0) {
                errorMessage = ('Numbers too small, must be 1 or larger');
            } else if (length * width > 10000) {
                errorMessage = ('There is such a thing as too big');
            } else {
                createdWorld = new World(worldName, 'rectangle', length, width);
            }
            break;
        case 'branch':
            const startLength = parseInt(startLengthConfig.value);
            const branchFactor = parseFloat(branchFactorConfig.value);
            if (isNaN(startLength) || isNaN(branchFactor)) {
                errorMessage = 'Invalid inputs, need to be numbers';
            } else if (startLength <= 0) {
                errorMessage = 'Numbers too small, start length must be 1 or larger';
            } else if (branchFactor < 0) {
                errorMessage = 'Numbers too small, branch factor can\'t be smaller than 0';
            } else if (branchFactor >= 1) {
                errorMessage = 'Branch factor must be smaller than 1';
            } else if (startLength > 1000) {
                errorMessage = 'There is such a thing as too big';
            } else {
                createdWorld = new World(worldName, branchCheckBoxConfig.checked ? 'branch-alternative' : 'branch', startLength, branchFactor);
            }
            break;
    }

    if (createdWorld !== null) {
        if (showAsWell) {
            updateCurrentUi = showWorld(createdWorld);
        } else {
            showWorld(null);
            updateCurrentUi = function () { };
        }
        worldChangedSincePreview = false;
        currentWorld = createdWorld;
    } else {
        showWorld(null);
        updateCurrentUi = function () { };
    }

    // Show error after we clear the world preview (since that clears everything in the `row-container`)
    if (errorMessage !== null) {
        console.error('Failed to create world because: ', errorMessage);
        messageLabel = document.createElement('span');
        messageLabel.textContent = errorMessage;
        display.appendChild(messageLabel);
    }

    // Return true if we successfully created a world:
    return createdWorld !== null;
};

document.getElementById("preview-btn").addEventListener('click', generateWorld);

// Ensure we don't spam updates (might cause performance issues)
let timeoutId = null;
let wantUpdate = false;
function queueUpdate() {
    if (timeoutId !== null) {
        wantUpdate = true;
        return;
    }
    wantUpdate = false;
    generateWorld();

    // Delay next update:
    timeoutId = setTimeout(function () {
        timeoutId = null;
        if (wantUpdate) {
            queueUpdate();
        }
    }, 500);
}


for (const [key, value] of Object.entries(buttons)) {
    value.onclick = function () {
        wantedWorldType = key;
        onWorldTypeChanged();
        // Updates preview as the world type is selected, not used due to design choice for only one button to queue updates
        // queueUpdate();
    };
}

let worldChangedSincePreview = true;
function inputChanged() {
    worldChangedSincePreview = true;
}
nameConfig.oninput = inputChanged;

numberOfRoomsConfig.oninput = inputChanged;

lengthConfig.oninput = inputChanged;
widthConfig.oninput = inputChanged;

startLengthConfig.oninput = inputChanged;
branchFactorConfig.oninput = inputChanged;
branchCheckBoxConfig.oninput = inputChanged;


function saveSpecifiedWorld() {
    if (currentWorld == null || worldChangedSincePreview) {
        // No preview (so generate new world):
        if (!generateWorld(false)) {
            console.error('Failed to generate a new world');
            return;
        }
    }
    if (currentWorld == null) {
        // No preview and failed to generate new world:
        console.error('Please make a world first')
        return;
    }
    let xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    xhr.open('post', 'http://localhost:8000/api/create', true);
    xhr.send(JSON.stringify({
        type: wantedWorldType,
        world: currentWorld,
    }));

    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                const createdInfo = JSON.parse(xhr.responseText);
                console.log(createdInfo);
                // Typical action to be performed when the document is ready:
                location.href = 'view.html?id=' + createdInfo.id;
            } else {
                console.error('Backend failed:\n', xhr.responseText);
            }
        }
    };
}