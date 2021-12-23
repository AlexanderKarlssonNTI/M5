const offlineMode = localStorage.getItem('pathOS_offlineModeEnabled') === 'true';

const urlParams = new URLSearchParams(window.location.search);
const viewedWorldId = parseInt(urlParams.get('id'));

let currentWorld = null;
let updateCurrentUi = function () { };
if (!isNaN(viewedWorldId)) {
    if (offlineMode) {
        const data = JSON.parse(localStorage.getItem('pathOS_world-' + viewedWorldId));
        currentWorld = new World(data.name, 'load', data);
        document.getElementById('world-name').textContent = data.name;
        updateCurrentUi = showWorld(currentWorld);
    } else {
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
}


const worldNameLabel = document.getElementById('world-name');
const worldNameInput = document.getElementById('world-name-edit');

const editButton = document.getElementById("edit-btn");
const pathfinderButton = document.getElementById("pathfinder-btn");
const pathfinderCancel = document.getElementById("pathfinding-cancel");

const pathfinderVisualize = document.getElementById("visualize-pathfinder-method");
const pathfinderVisualizeDijkstraToEnd = document.getElementById("visualize-dijkstra-to-end");
const pathfinderVisualizeSpfAllPaths = document.getElementById("visualize-spf-all-paths");

const dijkstraAlgorithmButton = document.getElementById('pathfinder-method-dijkstra');
const aStarAlgorithmButton = document.getElementById('pathfinder-method-a-star');
const spfAlgorithmButton = document.getElementById('pathfinder-method-spf');
const spfFastAlgorithmButton = document.getElementById('pathfinder-method-spf-fast');

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
worldNameInput.addEventListener('keydown', function (event) {
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


const pathfindingAlgorithmConfigs = {
    dijkstra: dijkstraAlgorithmButton,
    aStar: aStarAlgorithmButton,
    spf: spfAlgorithmButton,
    spfFast: spfFastAlgorithmButton,
};
let currentPathfindingAlgorithm = null;

function setPathfindingAlgorithm(wantedAlgorithm) {
    if (!wantedAlgorithm) {
        wantedAlgorithm = null;
    }
    if (currentPathfindingAlgorithm === wantedAlgorithm) return;

    if (currentPathfindingAlgorithm !== null) {
        pathfindingAlgorithmConfigs[currentPathfindingAlgorithm].classList.remove('selected');
    }
    currentPathfindingAlgorithm = wantedAlgorithm;
    if (currentPathfindingAlgorithm !== null) {
        pathfindingAlgorithmConfigs[currentPathfindingAlgorithm].classList.add('selected');
    }
}
setPathfindingAlgorithm('dijkstra');

for (const key of Object.keys(pathfindingAlgorithmConfigs)) {
    pathfindingAlgorithmConfigs[key].addEventListener('click', function () {
        setPathfindingAlgorithm(key);
    });
}




let pathfindingBackgroundWorkCancel = null;
function clearPathHighlight() {
    if (pathfindingBackgroundWorkCancel !== null) {
        pathfindingBackgroundWorkCancel();
        pathfindingBackgroundWorkCancel = null;
    }

    const clearAllClasses = function (className) {
        for (const element of Array.from(document.getElementsByClassName(className))) {
            element.classList.remove(className);
        }
    };
    clearAllClasses('found-path-room-highlighting');
    clearAllClasses('found-path-spacer-highlighting');
}
function pathHighlight(options) {
    if (!options) return;

    // To be safe, make sure to cancel anything else that is in progress:
    if (pathfindingBackgroundWorkCancel !== null) {
        pathfindingBackgroundWorkCancel();
        pathfindingBackgroundWorkCancel = null;
    }

    // Some default values when handling a simple path described by following room ids:
    if (options.simplePath) {
        options.roomsCount = options.simplePath.length;
        if (!('pathsPerRoom' in options)) {
            options.pathsPerRoom = 2;
        }
        options.getRoom = function (i) {
            return options.simplePath[i];
        };
        options.getPathStart = function (i, pathIndex) {
            if (pathIndex === 0) {
                // First path starts in previous room (indicates a path towards current room):
                return options.simplePath[i - 1];
            } else {
                // 2nd path starts in current room (indicates a path from current room towards the previous):
                return options.simplePath[i];
            }
        };
        options.getPathEnd = function (i, pathIndex) {
            if (pathIndex === 0) {
                // The first path indicates a path towards the current room:
                return options.simplePath[i];
            } else {
                // The second path indicates a path back towards the previous room:
                return options.simplePath[i - 1];
            }
        };
    }

    if (options.animationTime > 0 && options.roomsCount > 1) {
        // One step per room + {pathPerRooms} steps between rooms (no paths to do after the last room) - the first room is highlighted immediately
        let totalSteps = options.roomsCount + (options.roomsCount - 1) * options.pathsPerRoom - 1;

        let minFrameTime = 1000 / 30;
        let frameTime = options.animationTime / totalSteps;
        if (frameTime < minFrameTime) {
            frameTime = minFrameTime;
        }

        let totalFrames = Math.ceil(options.animationTime / frameTime);
        let stepsPerFrame = Math.ceil(totalSteps / totalFrames);
        let currentStep = 0;

        const stepsPerRoom = options.pathsPerRoom + 1;
        const startTime = Date.now();
        const doStep = function () {
            let stepsToDo = stepsPerFrame;
            if (options.compensateForLag) {
                const currentTime = Date.now();
                const currentFrame = Math.floor(currentStep / stepsPerFrame);

                const actualElapsedTime = currentTime - startTime;
                const wantedElapsedTime = (currentFrame - 1) * frameTime;
                const missedFrames = Math.floor((actualElapsedTime - wantedElapsedTime) / frameTime);

                if (missedFrames > 0) {
                    stepsToDo += missedFrames * stepsPerFrame;
                    console.warn('missed some frames for animation: ', missedFrames);
                }
            }
            for (let step = 0; step < stepsToDo; step++) {
                // The room index (for paths this is the room the path is towards, this ensures that we don't activate paths after the last room)
                let i = Math.floor((currentStep + options.pathsPerRoom) / stepsPerRoom);

                if (currentStep > totalSteps || i >= options.roomsCount) {
                    // (Done all steps + initial step) or (shown all rooms)
                    clearInterval(pathfindingIntervalId);
                    pathfindingBackgroundWorkCancel = null;

                    if (options.done) {
                        options.done();
                    }
                    return;
                }
                // First step is to highlight the room, any other step is to highlight a path:
                const pathIndexOrRoom = currentStep % stepsPerRoom;

                if (pathIndexOrRoom === 0) {
                    // Activate room:
                    for (const roomPath of document.querySelectorAll(`.room[data-room-id="${options.getRoom(i)}"]`)) {
                        roomPath.classList.add('found-path-room-highlighting');
                    }
                } else {
                    // Activate path towards room:
                    for (const spacerPath of document.querySelectorAll(`.has-path[data-path-from-room-id="${options.getPathStart(i, pathIndexOrRoom - 1)}"][data-path-to-room-id="${options.getPathEnd(i, pathIndexOrRoom - 1)}"]`)) {
                        spacerPath.classList.add('found-path-spacer-highlighting');
                    }
                }
                currentStep++;
            }
        };
        const pathfindingIntervalId = setInterval(doStep, frameTime);
        pathfindingBackgroundWorkCancel = function () {
            clearInterval(pathfindingIntervalId);
            if (options.canceled) {
                options.canceled();
            }
        };
        // Do first step immediately:
        doStep();
    } else {
        for (let i = 0; i < options.roomsCount; i++) {
            for (const roomPath of document.querySelectorAll(`.room[data-room-id="${options.getRoom(i)}"]`)) {
                roomPath.classList.add('found-path-room-highlighting');
            }
            if (i !== 0) {
                for (let pathIndex = 0; pathIndex < options.pathsPerRoom; pathIndex++) {
                    for (const spacerPath of document.querySelectorAll(`.has-path[data-path-from-room-id="${options.getPathStart(i, pathIndex)}"][data-path-to-room-id="${options.getPathEnd(i, pathIndex)}"]`)) {
                        spacerPath.classList.add('found-path-spacer-highlighting');
                    }
                }
            }
        }
        if (options.done) {
            const timeoutId = setTimeout(function() {
                pathfindingBackgroundWorkCancel = null;
                options.done();
            }, 0);
            pathfindingBackgroundWorkCancel = function () {
                clearTimeout(timeoutId);
                if (options.canceled) {
                    options.canceled();
                }
            };
        }
    }
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
let pathfindingAnimationTime = 1000;
// let PathfinderSelectS = document.getElementById("Pathfinder-selectS");
// let PathfinderSelectE = document.getElementById("Pathfinder-selectE");
// let PathfinderResults = document.getElementById("Pathfinder-results");
function pathfindingMode(inputRoom = null) {

    // Clear old paths:
    clearPathHighlight();

    // Make sure UI is in the correct state:
    showInfoAboutRoom(null);

    pathfinderCancel.classList.toggle("on", isPathfinding);
    pathfinderButton.classList.toggle("off", isPathfinding);
    roomInfoDisplay.classList.toggle('enable-pathfinder-options', isPathfinding);
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
        roomHeaderDisplay.textContent = "Calculating...";

        let shortestPath = null;
        let startTime = Date.now();

        const highlightToExit = function () {
            if (!shortestPath) return;

            pathHighlight({
                animationTime: pathfindingAnimationTime,
                compensateForLag: false,
                pathsPerRoom: 2,

                simplePath: shortestPath,
            });
        };
        const showShortestPathInfo = function () {
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
        };


        if (currentPathfindingAlgorithm === 'spf' || currentPathfindingAlgorithm === 'spfFast') {
            // Looking at partial paths is slow, so only do it when we are visualizing:
            const yieldPartialPaths = pathfinderVisualizeSpfAllPaths.checked && pathfinderVisualize.checked;

            const spfGenerator = SPF(currentWorld, pathfinderStart, pathfinderEnd, {
                // Can probably go through at least this many rooms before checking the current time again (which might be expensive):
                roomsToScanBeforeCheckingTime: 300,
                // Don't freeze UI for longer than this many milliseconds:
                maxProcessTime: 300,
                // Don't consider longer paths that go through rooms we already found shorter paths to:
                trackShortestPaths: currentPathfindingAlgorithm === 'spfFast',
                // If this is true then we will also visualize the paths that the algorithm rejects because they don't reach the exit
                // Also useful to visualize progress when it takes too long to find even one path to the exit:
                yieldPartialPaths,
            });
            const cancel = function () {
                console.log('SPF pathfinding was canceled after ' + (Date.now() - startTime) + ' ms');
            };
            const getNextPath = function () {
                const shouldVisualize = pathfinderVisualize.checked;

                // Increase the limit for `i` to do more work before giving
                // the browser a chance to do something.
                // Higher `i` => better pathfinding performance
                // but also more UI lag/freezes
                for (let i = 0; i < 10; i++) {
                    const next = spfGenerator.next();
                    if (next.done) {
                        // Pathfinding done! SPF has searched all paths!
                        // Complete the promise so that the pathfinding result
                        // can be displayed.
                        console.log('SPF pathfinding completed after ', Date.now() - startTime, ' ms');
                        showShortestPathInfo();
                        highlightToExit();
                        return;
                    }
                    if (next.value === 'longTime') {
                        // Took too long to find even one path to the exit, wait a bit and then continue:
                        break;
                    }
                    if (
                        // No partial paths OR check that it is a full path to the exit:
                        (!yieldPartialPaths || (next.value[next.value.length - 1] === pathfinderEnd)) &&
                        // No shortest path OR the new path is shorter then what we have seen before:
                        (shortestPath === null || shortestPath.length > next.value.length)
                    ) {
                        shortestPath = next.value;
                    }
                    if (shouldVisualize) {
                        pathHighlight({
                            animationTime: yieldPartialPaths ? 0 : 40,
                            compensateForLag: false,
                            pathsPerRoom: 2,

                            simplePath: next.value,

                            done: function () {
                                clearPathHighlight();
                                getNextPath();
                            },
                            canceled: function () {
                                // Our animation was canceled:
                                cancel();
                            },
                        });
                        // We will get the next path after we finish with the animation...
                        return;
                    }
                }
                // We calculated a couple of paths so now we tell the browser
                // to call us later and let it do some other things (such
                // as canceling our pathfinder method or any other UI work).
                const timeoutId = setTimeout(function () {
                    pathfindingBackgroundWorkCancel = null;
                    getNextPath();
                }, 0);
                pathfindingBackgroundWorkCancel = function () {
                    clearTimeout(timeoutId);
                    cancel();
                };
            };
            getNextPath();
        } else {
            const toRow = Math.floor((pathfinderEnd - 1) / currentWorld.sideLength);
            const toColumn = (pathfinderEnd - 1) % currentWorld.sideLength;
            const totalRows = Math.ceil(currentWorld.rooms.length / currentWorld.sideLength);

            const shouldUseAStar = currentPathfindingAlgorithm === 'aStar';

            // Minimum distance calculations for A* must assume less if any of these things are active:
            let hasDiagonalPaths = false;
            let hasHorizontalWrapping = false;
            let hasVerticalWrapping = false;
            if (shouldUseAStar) {
                for (let y = 0; y < totalRows; y++) {
                    for (let x = 0; x < currentWorld.sideLength; x++) {
                        const aRoom = currentWorld.getRoomById(y * currentWorld.sideLength + x + 1);
                        const roomBelow = currentWorld.wrappingRoomBelowOf(aRoom);
                        if (
                            aRoom.hasExitTo(currentWorld.wrappingRoomLeftOf(roomBelow)) ||
                            aRoom.hasExitTo(currentWorld.wrappingRoomRightOf(roomBelow))
                        ) {
                            hasDiagonalPaths = true;
                            break;
                        }
                    }
                    if (hasDiagonalPaths) break;
                }
                if (currentWorld.sideLength > 1) {
                    for (let i = 0; i < totalRows; i++) {
                        const aRoom = currentWorld.getRoomById(i * currentWorld.sideLength + 1);
                        const roomLeft = currentWorld.wrappingRoomLeftOf(aRoom);
                        if (
                            aRoom.hasExitTo(roomLeft) ||
                            (hasDiagonalPaths && (
                                aRoom.hasExitTo(currentWorld.wrappingRoomAboveOf(roomLeft)) ||
                                aRoom.hasExitTo(currentWorld.wrappingRoomBelowOf(roomLeft))
                            ))
                        ) {
                            hasHorizontalWrapping = true;
                            break;
                        }
                    }
                }
                if (totalRows > 1) {
                    for (let i = 0; i < currentWorld.sideLength; i++) {
                        const aRoom = currentWorld.getRoomById(i + 1);
                        const roomAbove = currentWorld.wrappingRoomAboveOf(aRoom);
                        if (
                            aRoom.hasExitTo(roomAbove) ||
                            (hasDiagonalPaths && (
                                aRoom.hasExitTo(currentWorld.wrappingRoomLeftOf(roomAbove)) ||
                                aRoom.hasExitTo(currentWorld.wrappingRoomRightOf(roomAbove))
                            ))
                        ) {
                            hasVerticalWrapping = true;
                            break;
                        }
                    }
                }
                console.log(
                    'A* Distance Calculation Parameters:',
                    '\nhasDiagonalPaths', hasDiagonalPaths,
                    '\nhasHorizontalWrapping', hasHorizontalWrapping,
                    '\nhasVerticalWrapping', hasVerticalWrapping
                );
            }

            const dijkstraInfo = DijkstraAlternative(currentWorld, pathfinderStart, pathfinderEnd, {
                // Get back info about what rooms were scanned and in what order:
                trackQueue: pathfinderVisualize.checked,
                // Use distance estimate to the end point to improve the algorithm (changes "dijkstra" to "A*" since they are otherwise the same):
                aStar: shouldUseAStar,
                // Set this to true to see how the pathfinding algorithm explores all rooms from the specified starting location (can be useful to see what room is explored last):
                continueAfterFindingEnd: pathfinderVisualizeDijkstraToEnd.checked,
                // Function used to calculate distance from a room to the end point when using "A*":
                aStarDistanceToEndFrom: function (roomId) {
                    const fromRow = Math.floor((roomId - 1) / currentWorld.sideLength);
                    const fromColumn = (roomId - 1) % currentWorld.sideLength;
                    let xDist = Math.abs(fromColumn - toColumn);
                    let yDist = Math.abs(fromRow - toRow);

                    if (hasVerticalWrapping) {
                        // If before you needed to go 8 out of 9 rows you now need to go only 1 row in the opposite direction:
                        const wrappingYDist = totalRows - yDist;
                        if (wrappingYDist < yDist) {
                            yDist = wrappingYDist;
                        }
                    }
                    if (hasHorizontalWrapping) {
                        // If before you needed to go 8 out of 9 columns you now need to go only 1 column in the opposite direction:
                        const wrappingXDist = currentWorld.sideLength - xDist;
                        if (wrappingXDist < xDist) {
                            xDist = wrappingXDist;
                        }
                    }
                    if (hasDiagonalPaths) {
                        // Can make both x and y movement in a single step (assumes that all diagonal paths have length 1)
                        if (xDist < yDist) {
                            xDist = 0;
                        } else {
                            yDist = 0;
                        }
                    }

                    return xDist + yDist;
                },
            });
            if (dijkstraInfo) {
                shortestPath = dijkstraInfo.pathToExit;
            }
            console.log('Dijkstra/A* pathfinding completed after ', Date.now() - startTime, ' ms');

            showShortestPathInfo();

            // Highlight the rooms searched by the pathfinding algorithm:
            pathHighlight({
                animationTime: pathfindingAnimationTime,
                compensateForLag: false,
                roomsCount: dijkstraInfo.trackedQueue.length,
                pathsPerRoom: 2,
                getRoom: function (i) {
                    return dijkstraInfo.trackedQueue[i];
                },
                getPathStart: function (i, pathIndex) {
                    if (pathIndex === 0) {
                        // First path starts in previous room (indicates a path towards current room):
                        return dijkstraInfo.previous[dijkstraInfo.trackedQueue[i] - 1];
                    } else {
                        // 2nd path starts in current room (indicates a path from current room towards the previous):
                        return dijkstraInfo.trackedQueue[i];
                    }
                },
                getPathEnd: function (i, pathIndex) {
                    if (pathIndex === 0) {
                        // The first path indicates a path towards the current room:
                        return dijkstraInfo.trackedQueue[i];
                    } else {
                        // The second path indicates a path back towards the previous room:
                        return dijkstraInfo.previous[dijkstraInfo.trackedQueue[i] - 1];
                    }
                },

                done: function () {
                    clearPathHighlight();
                    highlightToExit();
                },
            });
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
    // console.log('Clicked on: ', roomId);
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
                        // console.log('disconnect paths', previousRoom, room);
                        previousRoom.disconnectFrom(room);
                        updateCurrentUi();
                    } else if (currentWorld.isWrappingNeighbors(previousRoom, room) || currentWorld.isWrappingDiagonalNeighbors(previousRoom, room)) {
                        // console.log('connect paths');
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
let lastMouseExactRoomId = null;
function mouseMove(e) {
    let didChange = false;
    if (e.target) {
        const roomId = e.target.getAttribute('data-room-id');
        const handleRoomId = function (roomId, previousRoomId) {
            if (roomId) {
                const room = currentWorld.getRoomById(roomId);
                if (currentEditMode === 'smart') {
                    if (!room.canEnter) {
                        room.canEnter = true;
                        didChange = true;
                    }
                    if (previousRoomId !== null) {
                        const lastRoom = currentWorld.getRoomById(previousRoomId);
                        if (
                            !lastRoom.hasExitTo(room) &&
                            (
                                currentWorld.isWrappingNeighbors(lastRoom, room) ||
                                currentWorld.isWrappingDiagonalNeighbors(lastRoom, room)
                            )
                        ) {
                            lastRoom.connectTo(room);
                            didChange = true;
                        }
                    }
                }
                if (currentEditMode === 'eraser') {
                    if (room.canEnter) {
                        room.canEnter = false;
                        currentWorld.blockRoom(room);
                        didChange = true;
                    }
                }
            }
        };
        if (roomId) {
            handleRoomId(roomId, lastMouseRoomId);
            lastMouseRoomId = roomId;

            // More exact room id (only triggers when moving mouse over a room div and not over spacers, useful for diagonal paths):
            if (e.target.classList.contains('room')) {
                handleRoomId(roomId, lastMouseExactRoomId);
                lastMouseExactRoomId = roomId;
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
    lastMouseExactRoomId = null;
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
    const onSuccess = function () {
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
    };

    if (offlineMode) {
        const worldKey = 'pathOS_world-' + viewedWorldId;
        localStorage.setItem(worldKey, JSON.stringify(currentWorld));
        setTimeout(function () { onSuccess(); }, 100);
        return;
    }

    let xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    xhr.open('put', 'http://localhost:8000/api/worlds/' + viewedWorldId, true);
    xhr.send(JSON.stringify({
        world: currentWorld,
    }));

    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                onSuccess();
            } else {
                console.error('Backend failed:\n', xhr.responseText);
            }
        }
    };
}