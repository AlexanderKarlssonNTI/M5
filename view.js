const urlParams = new URLSearchParams(window.location.search);
const viewedWorldId = parseInt(urlParams.get('id'));

let currentWorld = null;
let updateCurrentUi = function () { };
if (!isNaN(viewedWorldId)) {
    fetch('http://localhost:8000/api/worlds/' + viewedWorldId)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            currentWorld = new World(data.name, 'load', data);
            document.getElementById('world-name').textContent = data.name;
            updateCurrentUi = showWorld(currentWorld);
        })
        .catch(function (error) {
            console.error('Failed to get info from backend:\n', error);
        });
}


const worldNameLabel = document.getElementById('world-name');
const worldNameInput = document.getElementById('world-name-edit');

const editButton = document.getElementById("edit-btn");
const pathfinderButton = document.getElementById("pathfinder-btn");
const pathfinderCancel = document.getElementById("pathfinding-cancel");

const editButtonsSection = document.getElementById("edit-btns");

const editRoomsButton = document.getElementById("btn-toggle-rooms");
const editPathsButton = document.getElementById("btn-edit-paths");
const editSmartButton = document.getElementById("btn-edit-smart");
const editEraserButton = document.getElementById("btn-eraser");

const roomInfoDisplay = document.getElementById('room-display');
const roomHeaderDisplay = document.getElementById('room-display-name');
const roomIdDisplay = document.getElementById('room-info-id');
const roomExitsDisplay = document.getElementById('room-info-exits');


let isEditingTitle = false;
function enterTitleEdit() {
    isEditingTitle = true;
    for (const header of Array.from(document.getElementsByClassName('world-header'))) {
        header.classList.add('editing-name');
    }
    worldNameInput.value = currentWorld.name;
    worldNameInput.select();
    worldNameInput.focus();
}

function exitTitleEdit() {
    isEditingTitle = false;
    for (const header of Array.from(document.getElementsByClassName('world-header'))) {
        header.classList.remove('editing-name');
    }
}
function setWorldName(newName) {
    currentWorld.name = newName;
    worldNameLabel.textContent = newName;
}

worldNameLabel.addEventListener('click', function (e) {
    if (e.button == 0) {
        enterTitleEdit();
        e.stopPropagation();
    }
})
worldNameInput.addEventListener('keydown', function(event) {
    if (!isEditingTitle) return;

    // Inspired by code at:
    // https://github.com/piroor/treestyletab/blob/ef38e94026bbeaf4f83e8e4d04321f5eba540b6a/webextensions/resources/group-tab.js#L144

    // Event.isComposing for the Enter key to finish composition is always
    // "false" on keyup, so we need to handle this on keydown.
    if (event.isComposing)
        return;

    switch (event.key) {
        case 'Escape':
            exitTitleEdit();
            break;

        case 'Enter':
            setWorldName(worldNameInput.value);
            exitTitleEdit();
            break;
    }
});
document.addEventListener('click', function (e) {
    if (!isEditingTitle) return;

    if (e.button == 0 && e.target != worldNameInput) {
        setWorldName(worldNameInput.value);
        exitTitleEdit();
        e.stopPropagation();
    }
});

let currentlyEditing = false;
function changeEditMode(shouldBeActive) {
    shouldBeActive = Boolean(shouldBeActive);
    if (currentlyEditing === shouldBeActive) return;

    selectRoomId(null);
    showInfoAboutRoom(null);
    currentlyEditing = shouldBeActive;
    if (isPathfinding) {
        isPathfinding = false;
        currentPathfindingPhase = 1;
        pathfindingMode();
    }

    if (shouldBeActive) {
        setEditMode('rooms');
    } else {
        setEditMode(null);
    }

    editButton.classList.toggle("off", shouldBeActive);
    pathfinderButton.classList.toggle("off", shouldBeActive);
    editButtonsSection.classList.toggle("on", shouldBeActive);
}
document.getElementById("save-btn").addEventListener("click", function () { changeEditMode(false); });
document.getElementById("back-btn-edit").addEventListener("click", function () { changeEditMode(false); });


const editModes = {
    rooms: editRoomsButton,
    paths: editPathsButton,
    smart: editSmartButton,
    eraser: editEraserButton,
};
let currentEditMode = null;

function setEditMode(wantedMode) {
    if (!wantedMode) {
        wantedMode = null;
    }

    if (currentEditMode === wantedMode) return;
    selectRoomId(null);
    if (currentEditMode !== null) {
        editModes[currentEditMode].classList.remove('selected');
    }
    currentEditMode = wantedMode;
    if (currentEditMode !== null) {
        editModes[currentEditMode].classList.add('selected');


        roomInfoDisplay.style.visibility = 'visible';
        roomIdDisplay.style.display = 'none';
        roomExitsDisplay.style.display = 'none';
        if (currentEditMode === 'rooms') {
            roomHeaderDisplay.textContent = 'Create or erase rooms on click';
        }
        if (currentEditMode === 'paths') {
            roomHeaderDisplay.textContent = 'Connect or disconnect paths on click';
        }
        if (currentEditMode === 'smart') {
            roomHeaderDisplay.textContent = 'Create on click and drag';
        }
        if (currentEditMode === 'eraser') {
            roomHeaderDisplay.textContent = 'Erase on click and drag';
        }
    }
}

for (const key of Object.keys(editModes)) {
    editModes[key].addEventListener('click', function () {
        setEditMode(key);
    });
}




let isPathfinding = false;
pathfinderButton.addEventListener('click', function () {
    isPathfinding = true;
    currentPathfindingPhase = 1;
    pathfindingMode();
    // pathfinderButton.classList.toggle('selected', isPathfinding);
});

pathfinderCancel.addEventListener("click", function () {
    isPathfinding = false;
    currentPathfindingPhase = 1;
    pathfindingMode();
});

let currentPathfindingPhase = 1;
let pathfinderStart;
let pathfinderEnd;
let pathfindingIntervalId = null;
let pathfindingAnimationTime = 1000;
// let PathfinderSelectS = document.getElementById("Pathfinder-selectS");
// let PathfinderSelectE = document.getElementById("Pathfinder-selectE");
// let PathfinderResults = document.getElementById("Pathfinder-results");
function pathfindingMode(inputRoom = null) {

    // Clear old paths:
    if (pathfindingIntervalId !== null) {
        clearInterval(pathfindingIntervalId);
        pathfindingIntervalId = null;
    }
    const clearAllClasses = function (className) {
        for (const element of Array.from(document.getElementsByClassName(className))) {
            element.classList.remove(className);
        }
    };
    clearAllClasses('found-path-room-highlighting');
    clearAllClasses('found-path-spacer-highlighting');


    // Make sure UI is in the correct state:
    showInfoAboutRoom(null);

    pathfinderCancel.classList.toggle("on", isPathfinding);
    pathfinderButton.classList.toggle("off", isPathfinding);
    if (isPathfinding) {
        roomInfoDisplay.style.visibility = 'visible';
    } else {
        roomInfoDisplay.style.visibility = 'hidden';
    }


    // Do pathfinding stuff:
    if (currentPathfindingPhase === 1) {
        // PathfinderSelectS.classList.toggle("on",true);
        // PathfinderSelectE.classList.toggle("on",false);
        // PathfinderResults.classList.toggle("on",false);
        roomIdDisplay.style.display = 'none';
        roomExitsDisplay.style.display = 'none';
        roomHeaderDisplay.textContent = 'Select Start';
        selectRoomId(null);
        currentPathfindingPhase = 2;
    }
    else if (currentPathfindingPhase === 2) {
        // PathfinderSelectS.classList.toggle("on",false);
        // PathfinderSelectE.classList.toggle("on",true);
        roomHeaderDisplay.textContent = 'Select End';
        pathfinderStart = inputRoom;
        selectRoomId(inputRoom);
        currentPathfindingPhase = 3;
    }
    else if (currentPathfindingPhase === 3) {
        // PathfinderSelectE.classList.toggle("on",false);
        // PathfinderResults.classList.toggle("on",true);

        // roomPath.classlist.remove;
        // spacerPath.classList.remove;
        pathfinderEnd = inputRoom;
        let shortestPath = null;
        if (currentWorld.type != "rectangle" && false) {
            let paths = SPF(currentWorld, pathfinderStart, pathfinderEnd);
            if (!paths) {
                // there was an error
                paths = [];
            }
            shortestPath = paths[0];
            for (let x = 1; x < paths.length; x++) {
                if (paths[x].length < shortestPath.length) {
                    shortestPath = paths[x];
                }
            }
        } else {
            roomHeaderDisplay.textContent = "Calculating..."
            shortestPath = DijkstraAlternative(currentWorld, pathfinderStart, pathfinderEnd);
        }
        let shortestPathText = "doesn't exist";
        if (shortestPath) {
            shortestPathText = String(shortestPath.map(function (id) {
                return currentWorld.activeRoomNumberForRoom(id) + 1;
            }));
        }
        roomHeaderDisplay.textContent = "Shortest path between " +
            String(currentWorld.activeRoomNumberForRoom(pathfinderStart) + 1) + " and " +
            String(currentWorld.activeRoomNumberForRoom(pathfinderEnd) + 1) + ": \n" +
            shortestPathText + "\n Select another end or the start to continue";

        // Add new classes:
        if (!shortestPath) {
            shortestPath = [];
        }

        if (pathfindingAnimationTime > 0 && shortestPath.length > 1) {
            // One step per room + 2 steps for paths between rooms - only one step for paths at end and start
            let totalSteps = shortestPath.length * 3 - 2;

            let minFrameTime = 1000 / 60;
            let frameTime = pathfindingAnimationTime / totalSteps;
            if (frameTime < minFrameTime) {
                frameTime = minFrameTime;
            }

            let totalFrames = Math.ceil(pathfindingAnimationTime / frameTime);
            let stepsPerFrame = Math.ceil(totalSteps / totalFrames);
            let currentStep = 0;
            const doStep = function () {
                for (let i = 0; i < stepsPerFrame; i++) {
                    let i = Math.floor((currentStep + 2) / 3);
                    if (currentStep >= totalSteps || i >= shortestPath.length) {
                        clearInterval(pathfindingIntervalId);
                        pathfindingIntervalId = null;
                        return;
                    }
                    switch (currentStep % 3) {
                        case 0:
                            // Activate room:
                            for (const roomPath of document.querySelectorAll(`.room[data-room-id="${shortestPath[i]}"]`)) {
                                roomPath.classList.add('found-path-room-highlighting');
                            }
                            break;
                        case 1:
                            // Activate path after room:
                            for (const spacerPath of document.querySelectorAll(`.has-path[data-path-from-room-id="${shortestPath[i - 1]}"][data-path-to-room-id="${shortestPath[i]}"]`)) {
                                spacerPath.classList.add('found-path-spacer-highlighting');
                            }
                            break;
                        case 2:
                            // Activate path before next room:
                            for (const spacerPath of document.querySelectorAll(`.has-path[data-path-from-room-id="${shortestPath[i]}"][data-path-to-room-id="${shortestPath[i - 1]}"]`)) {
                                spacerPath.classList.add('found-path-spacer-highlighting');
                            }
                            break;
                    }

                    currentStep++;
                }
            };
            pathfindingIntervalId = setInterval(doStep, frameTime);
            // Do first step immediately:
            doStep();
        } else {
            for (let i = 0; i < shortestPath.length; i++) {
                for (const roomPath of document.querySelectorAll(`.room[data-room-id="${shortestPath[i]}"]`)) {
                    roomPath.classList.add('found-path-room-highlighting');
                }
                if (i !== 0) {
                    for (const spacerPath of document.querySelectorAll(`.has-path[data-path-from-room-id="${shortestPath[i - 1]}"][data-path-to-room-id="${shortestPath[i]}"]`)) {
                        spacerPath.classList.add('found-path-spacer-highlighting');
                    }
                    for (const spacerPath of document.querySelectorAll(`.has-path[data-path-from-room-id="${shortestPath[i]}"][data-path-to-room-id="${shortestPath[i - 1]}"]`)) {
                        spacerPath.classList.add('found-path-spacer-highlighting');
                    }
                }
            }
        }
    }
    else {
        console.log("ERROR WITH PATHFINDING");
    }
}




let currentlySelectedRoomId = null;
function selectRoomId(roomId) {
    if (typeof roomId === 'number') {
        // Make sure we don't mix numbers and strings.
        roomId = String(roomId);
    }
    if (!roomId) {
        roomId = null;
    }

    if (currentlySelectedRoomId === roomId) {
        return false;
    }
    if (currentlySelectedRoomId !== null) {
        // Unselect old room.
        for (const element of document.querySelectorAll(`.room[data-room-id="${currentlySelectedRoomId}"]`)) {
            element.classList.remove('selected');
        }
        currentlySelectedRoomId = null;
    }
    if (roomId !== null) {
        for (const element of document.querySelectorAll(`.room[data-room-id="${roomId}"]`)) {
            element.classList.add('selected');
        }
        currentlySelectedRoomId = roomId;
    }
    return true;
}


const preview = document.getElementById('row-container');
preview.addEventListener('click', function (e) {
    // console.log("Preparing View");
    const roomId = e.target.getAttribute('data-room-id');
    console.log('Clicked on: ', roomId);
    if (roomId === undefined || roomId === null) {
        // console.log("room ID invalid, didn't click on a room");
        if (!isPathfinding) {
            if (!currentlyEditing) {
                showInfoAboutRoom(null);
            }
            selectRoomId(null);
        }
        return;
    }
    // console.log("Room id valid");
    const room = currentWorld.rooms[roomId - 1];

    if (currentlyEditing) {
        switch (currentEditMode) {
            case 'rooms':
                if (room.canEnter) {
                    currentWorld.blockRoom(room);
                } else {
                    room.canEnter = true;
                }
                updateCurrentUi();
                break;

            case 'paths':
                if (currentlySelectedRoomId == roomId) {
                    // Clicked on same room twice so just unselect:
                    selectRoomId(null);
                } else if (currentlySelectedRoomId !== null) {
                    // Toggle path
                    const selectedRoomId = currentlySelectedRoomId;
                    selectRoomId(roomId);

                    const previousRoomId = parseInt(selectedRoomId);
                    if (isNaN(previousRoomId)) {
                        console.error('invalid selected room id', selectedRoomId);
                        return;
                    }

                    const previousRoom = currentWorld.getRoomById(previousRoomId);

                    if (previousRoom.hasExitTo(room)) {
                        // Rooms are already connected, so disconnect them:
                        console.log('pr', previousRoom, room);
                        previousRoom.disconnectFrom(room);
                        updateCurrentUi();
                    } else if (currentWorld.isWrappingNeighbors(previousRoom, room)) {
                        // Rooms are close, so connect them:
                        previousRoom.connectTo(room);
                        updateCurrentUi();
                    } else {
                        // Can't connect rooms far away from each other, so assume they want to select a different room:
                        selectRoomId(roomId);
                    }
                } else {
                    // No room selected, so select this one:
                    selectRoomId(roomId);
                }
                break;
        }
    } else {
        if (isPathfinding) {
            if (String(roomId) === String(currentlySelectedRoomId)) {
                // Choose a new starting point
                currentPathfindingPhase = 1;
                pathfindingMode();
                return;
            }
            if (!room.canEnter) {
                // Clicked on hidden room:
                return;
            }
            pathfindingMode(room.ID);
        } else {
            if (!selectRoomId(roomId)) {
                // Already selected:
                selectRoomId(null);
                showInfoAboutRoom(null);
            } else {
                showInfoAboutRoom(room);
            }
        }
    }
});

let lastMouseEvent = null;
let lastMouseRoomId = null;
function mouseMove(e) {
    let didChange = false;
    if (e.target) {
        const roomId = e.target.getAttribute('data-room-id');
        if (roomId) {
            const room = currentWorld.getRoomById(roomId);
            if (currentEditMode === 'smart') {
                if (!room.canEnter) {
                    room.canEnter = true;
                    didChange = true;
                }
                if (lastMouseRoomId !== null) {
                    const lastRoom = currentWorld.getRoomById(lastMouseRoomId);
                    if (!lastRoom.hasExitTo(room) && currentWorld.isWrappingNeighbors(lastRoom, room)) {
                        lastRoom.connectTo(room);
                        didChange = true;
                    }
                }
                lastMouseRoomId = roomId;
            }
            if (currentEditMode === 'eraser') {
                if (room.canEnter) {
                    room.canEnter = false;
                    currentWorld.blockRoom(room);
                    didChange = true;
                }
                if (lastMouseRoomId !== null) {
                    const lastRoom = currentWorld.getRoomById(lastMouseRoomId);
                    if (lastRoom.hasExitTo(room) && currentWorld.isWrappingNeighbors(lastRoom, room)) {
                        lastRoom.disconnectFrom(room);
                        didChange = true;
                    }
                }
                lastMouseRoomId = roomId;
            }
        }
    }
    if (didChange) {
        updateCurrentUi();
    }


    lastMouseEvent = e;
}
function stopDrag(cancel = true) {
    // If !cancel then maybe do something special?
    lastMouseEvent = null;
    lastMouseRoomId = null;
    preview.removeEventListener('mouseover', mouseMove);
}
preview.addEventListener('mousedown', function (e) {
    // By default a mousedown event enables drag and drop, but we don't want it so disable it:
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    if (!currentlyEditing) return;
    if (currentEditMode !== 'smart' && currentEditMode !== 'eraser') {
        return;
    }

    stopDrag();
    mouseMove(e);
    preview.addEventListener('mouseover', mouseMove, { bubble: true });
});
document.addEventListener('mouseup', function (e) {
    // console.log('mouse button up', e);
    // If not left mouse button then cancel current drag operation:
    stopDrag(e.buttons % 2 !== 0);
});
document.addEventListener('keydown', function (e) {
    // console.log('key down', e);
    if (e.key === 'Escape') {
        stopDrag();
    }
});
document.addEventListener('blur', function (e) {
    // console.log('document lost focus', e);
    stopDrag();
});


function showInfoAboutRoom(room) {
    if (room && room.canEnter) {
        roomInfoDisplay.style.visibility = 'visible';
        roomIdDisplay.style.display = 'block';
        roomExitsDisplay.style.display = 'block';

        document.getElementById('room-display-name').textContent = room.name;
        document.getElementById('room-display-id').textContent = String(currentWorld.activeRoomNumberForRoom(room) + 1);
        let exits = "";
        for (let i = 0; i < room.exits.length; i++) {
            if (i !== 0) {
                exits += ',';
            }
            exits += String(currentWorld.activeRoomNumberForRoom(room.exits[i]) + 1);
        }
        document.getElementById('room-display-exits').textContent = exits;
    } else {
        // Ensures that disabled rooms don't show any info display
        roomInfoDisplay.style.visibility = 'hidden';
        roomIdDisplay.style.display = 'none';
        roomExitsDisplay.style.display = 'none';
    }
}

let saveTheWorldTimeoutId = null;
function saveWorldEdits() {
    let xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    xhr.open('put', 'http://localhost:8000/api/worlds/' + viewedWorldId, true);
    xhr.send(JSON.stringify({
        world: currentWorld,
    }));

    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                if (saveTheWorldTimeoutId !== null) {
                    clearTimeout(saveTheWorldTimeoutId);
                    saveTheWorldTimeoutId = null;
                }
                // Typical action to be performed when the document is ready:
                roomInfoDisplay.style.visibility = 'visible';
                const shownText = 'Saved the world'
                roomHeaderDisplay.textContent = shownText;

                saveTheWorldTimeoutId = setTimeout(function () {
                    saveTheWorldTimeoutId = null;
                    if (roomHeaderDisplay.textContent === shownText) {
                        roomInfoDisplay.style.visibility = 'hidden';
                    }
                }, 5000);
            } else {
                console.error('Backend failed:\n', xhr.responseText);
            }
        }
    };
}