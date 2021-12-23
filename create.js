const buttons = {
    circle: document.getElementById('btn-circular'),
    rectangle: document.getElementById('btn-rectangle'),
    branch: document.getElementById('btn-branch')
};
const display = document.getElementById('row-container');

const optionalSections = document.querySelectorAll('[data-require-world]');
const rememberWorldType = document.getElementById('remember-world-type');

const randomizeWorldNameButton = document.getElementById('btn-random-world-name');

const nameConfig = document.getElementById('world-name');
const widthConfig = document.getElementById('world-side-length');
const heightConfig = document.getElementById('world-side-width');
const mazeCheckBoxConfig = document.getElementById("maze-mode");
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
    const previousRandomWorldName = nameConfig.value;
    let newName = previousRandomWorldName;
    while (previousRandomWorldName === newName) {
        newName = WorldBaptist();
    }
    nameConfig.value = newName;
    // Not sure if oninput is triggered when we manually change inputs
    inputChanged();
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
        worldName = WorldBaptist();
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
            const width = parseInt(widthConfig.value);
            const height = parseInt(heightConfig.value);
            if (isNaN(width) || isNaN(height)) {
                errorMessage = ('Invalid inputs, need to be numbers');
            } else if (width <= 0 || height <= 0) {
                errorMessage = ('Numbers too small, must be 1 or larger');
            } else if (width * height > 10000) {
                errorMessage = ('There is such a thing as too big');
            } else {
                createdWorld = new World(worldName, 'rectangle', width, height);
                if (mazeCheckBoxConfig.checked) {
                    const maze = new MazeBuilder(width, height);
                    for (let y = 1; y < maze.maze.length; y += 2) {
                        const roomY = (y - 1) / 2;
                        const row = maze.maze[y];
                        // console.log(roomY, row, y + 1 < maze.maze.length ? maze.maze[y + 1] : null);

                        // Horizontal walls
                        for (let x = 2; x < row.length; x += 2) {
                            const roomX = (x - 2) / 2;
                            const roomBefore = createdWorld.getRoomById(roomY * createdWorld.sideLength + roomX + 1);
                            const roomAfter = createdWorld.getRoomById(roomY * createdWorld.sideLength + roomX + 1 + 1);
                            if (!roomBefore || !roomAfter) continue;
                            if (row[x] && row[x].includes("wall")) {
                                roomBefore.disconnectFrom(roomAfter);
                            }
                        }
                        // Vertical walls
                        if (y + 1 < maze.maze.length) {
                            const nextRow = maze.maze[y + 1];
                            for (let x = 1; x < nextRow.length; x += 2) {
                                const roomX = (x - 1) / 2;
                                const room = createdWorld.getRoomById(roomY * createdWorld.sideLength + roomX + 1);
                                const roomBelow = createdWorld.getRoomById((roomY + 1) * createdWorld.sideLength + roomX + 1);
                                if (!room || !roomBelow) continue;
                                if (nextRow[x] && nextRow[x].includes("wall")) {
                                    room.disconnectFrom(roomBelow);
                                }
                            }
                        }
                    }
                    createdWorld.type = 'maze';
                }
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
        const messageLabel = document.createElement('span');
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
    if (mazeCheckBoxConfig.checked) {
        buttons.rectangle.textContent = 'M a z e';
    } else {
        buttons.rectangle.textContent = 'Rectangle';
    }
    if (branchCheckBoxConfig.checked) {
        buttons.branch.style.cssText = 'width: 17vw; margin-left: 0.7vw;'
        buttons.branch.textContent = 'Branch';
    } else {
        buttons.branch.style.cssText = 'width: 19vw; margin-left: -0.4vw;'
        buttons.branch.textContent = 'Branch*';
    }
    worldChangedSincePreview = true;
}
inputChanged();

nameConfig.oninput = inputChanged;

numberOfRoomsConfig.oninput = inputChanged;

widthConfig.oninput = inputChanged;
heightConfig.oninput = inputChanged;
mazeCheckBoxConfig.oninput = inputChanged;

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
        console.error('Please make a world first');
        return;
    }

    const offlineMode = localStorage.getItem('pathOS_offlineModeEnabled') === 'true';

    if (offlineMode) {
        const worldIds = JSON.parse(localStorage.getItem('pathOS_worlds') || '[]');
        let id = 1;
        while (worldIds.includes('pathOS_world-' + id)) {
            id++;
        }
        const worldKey = 'pathOS_world-' + id;
        worldIds.push(worldKey);
        localStorage.setItem(worldKey, JSON.stringify(currentWorld));
        localStorage.setItem('pathOS_worlds', JSON.stringify(worldIds));

        location.href = 'view.html?id=' + id;
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