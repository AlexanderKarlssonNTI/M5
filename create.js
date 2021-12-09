const buttons = {
    circle: document.getElementById('btn-circular'),
    rectangle: document.getElementById('btn-rectangle'),
    branch: document.getElementById('btn-branch')
};
const optionalSections = document.querySelectorAll('[data-require-world]');
const rememberWorldType = document.getElementById('remember-world-type');


const lengthConfig = document.getElementById('world-side-length');
const widthConfig = document.getElementById('world-side-width');
const numberOfRoomsConfig = document.getElementById('world-number-of-rooms');
const startLengthConfig = document.getElementById('world-start-length');
const branchFactorConfig = document.getElementById('world-branch-factor');


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


let currentWorld = null;
let updateCurrentUi = function() {};
const generateWorld = function () {
    let world;
    if (isNaN(branchFactorConfig.value) || isNaN(numberOfRoomsConfig.value) || isNaN(lengthConfig.value) || isNaN(startLengthConfig.value) || isNaN(widthConfig.value)) {
        console.log('NaNi!? Will not run invalid inputs');
        return false;
    }
    const generate = document.getElementById("btn-generate");
    if (wantedWorldType === 'circle' && numberOfRoomsConfig.value === 0 || wantedWorldType === 'rectangle' && lengthConfig.value === 0 || widthConfig.value === 0 || wantedWorldType === 'branch' && branchFactorConfig.value === 0 || startLengthConfig.value === 0) {
        generate.disabled = true;
        showWorld(null);
    }

    if (wantedWorldType != 'circle' && numberOfRoomsConfig.value != 0 || wantedWorldType != 'rectangle' && lengthConfig.value != 0 || widthConfig.value != 0 || wantedWorldType != 'branch' && branchFactorConfig.value != 0 || startLengthConfig.value != 0) {
        generate.disabled = false;
    }

    let createdWorld;
    switch (wantedWorldType) {
        case 'circle':
            world = new World('','circle', parseInt(numberOfRoomsConfig.value),0);
            createdWorld = world;
            break;
        case 'rectangle':
            world = new World('','rectangle', parseInt(lengthConfig.value),parseInt(widthConfig.value));
            createdWorld = world;
            break;
        case 'branch':
            world = new World('','branch', parseInt(startLengthConfig.value),parseFloat(branchFactorConfig.value));
            createdWorld = world;
            break;
    }
    if (createdWorld !== null) {
        updateCurrentUi = showWorld(createdWorld);
        currentWorld = createdWorld;
        return true;
    } else {
        return false;
    }
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
// Updates preview as input is changed, not used due to design choice for only one button to queue updates
// numberOfRoomsConfig.oninput = queueUpdate;
// lengthConfig.oninput = queueUpdate;
// widthConfig.oninput = queueUpdate;
// startLengthConfig.oninput = queueUpdate;
// branchFactorConfig.oninput = queueUpdate;

function showWorld(world) {
    const rowContainer = document.getElementById('row-container');
    // Remove all child elements in row container (from previous show world calls):
    rowContainer.innerHTML = '';
    if (!world) {
        return null;
    }
    const updateFunctions = [];

    const totalRows = world.rooms.length / world.sideLength;
    for (let row = 0; row < totalRows; row++) {
        // Spacer before each row:

        const rowSpacerBefore = document.createElement('div');
        rowSpacerBefore.classList.add('spacer');

        // Create a div tag for each row:
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');

        // Spacer after each row:
        const rowSpacerAfter = document.createElement('div');
        rowSpacerAfter.classList.add('spacer');

        for (let i = 0; i < world.sideLength; i++) {
            // Room like divs for row spacers (to easier show paths):
            const spacerBelow = document.createElement('div');
            spacerBelow.classList.add('spacer-room');

            const spacerAbove = document.createElement('div');
            spacerAbove.classList.add('spacer-room');

            const spacerBefore = document.createElement('div');
            spacerBefore.classList.add('spacer');

            const spacerAfter = document.createElement('div');
            spacerAfter.classList.add('spacer');

            // Create a div tag for each room:
            const roomDiv = document.createElement('div');
            roomDiv.classList.add('room');

            const roomIndex = row * world.sideLength + i;
            if (roomIndex < world.rooms.length) {
                const room = world.rooms[roomIndex];
                for (const element of [roomDiv, spacerBefore, spacerAfter, spacerAbove, spacerBelow]) {
                    element.setAttribute('data-room-id', room.ID);
                }

                const updateRoom = function () {
                    roomDiv.classList.toggle('blocked', !room.canEnter);
                    {
                        let roomLeftOf = room.hasExitTo(world.sideLength <= 2 ? world.roomLeftOf(room) : world.wrappingRoomLeftOf(room));
                        roomDiv.classList.toggle('path-to-left', roomLeftOf);
                        spacerBefore.classList.toggle('has-path', roomLeftOf);
                    }
                    {
                        let roomRightOf = room.hasExitTo(world.sideLength <= 2 ? world.roomRightOf(room) : world.wrappingRoomRightOf(room));
                        roomDiv.classList.toggle('path-to-right', roomRightOf);
                        spacerAfter.classList.toggle('has-path', roomRightOf);
                    }
                    {
                        const roomAboveOf = room.hasExitTo(world.roomAboveOf(room));
                        roomDiv.classList.toggle('path-to-above', roomAboveOf);
                        spacerAbove.classList.toggle('has-path', roomAboveOf);
                    }
                    {
                        const roomBelowOf =room.hasExitTo(world.roomBelowOf(room)) ;
                        roomDiv.classList.toggle('path-to-below', roomBelowOf);
                        spacerBelow.classList.toggle('has-path', roomBelowOf);
                    }
                };
                updateRoom();
                updateFunctions.push(updateRoom);
            } else {
                // There isn't a room at this index:
                roomDiv.classList.add('blocked');
            }

            // Spacer before room:
            rowDiv.appendChild(spacerBefore);
            {
                // Mimic layout of normal row div in row "spacer":
                const spacer = document.createElement('div');
                spacer.classList.add('spacer');
                rowSpacerAfter.appendChild(spacer);
            }
            {
                // Mimic layout of normal row div in row "spacer":
                const spacer = document.createElement('div');
                spacer.classList.add('spacer');
                rowSpacerBefore.appendChild(spacer);
            }

            // Add room
            rowDiv.appendChild(roomDiv);
            rowSpacerAfter.appendChild(spacerBelow);
            rowSpacerBefore.appendChild(spacerAbove);

            // Spacer after room:
            rowDiv.appendChild(spacerAfter);
            {
                // Mimic layout of normal row div in row "spacer":
                const spacer = document.createElement('div');
                spacer.classList.add('spacer');
                rowSpacerAfter.appendChild(spacer);
            }
            {
                // Mimic layout of normal row div in row "spacer":
                const spacer = document.createElement('div');
                spacer.classList.add('spacer');
                rowSpacerBefore.appendChild(spacer);
            }
        }

        rowContainer.appendChild(rowSpacerBefore);
        rowContainer.appendChild(rowDiv);
        rowContainer.appendChild(rowSpacerAfter);
    }

    // Return a function that updates the UI when called:
    return function () {
        for (const updateFunction of updateFunctions) {
            updateFunction();
        }
    };
}

function saveSpecifiedWorld() {
    if (currentWorld == null) {
        if (!generateWorld()) {
            console.error('Failed to generate a new world');
            return;
        }
    }
    if (currentWorld == null) {
        console.error('Please make a world first')
        return;
    }
    let data = new FormData();
    data.append("data" , JSON.stringify(currentWorld));
    let xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    xhr.open( 'post', 'http://localhost:8000/api/create', true );
    xhr.send(data);

    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                const getWorldIdFromThisText = xhr.responseText;
                getWorldIdFromThisText
                // Typical action to be performed when the document is ready:
                location.href='view.html';
            } else {
                console.error('Backend failed');
            }
        }
    };
}