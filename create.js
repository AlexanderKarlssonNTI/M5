
const buttons = {
    circle: document.getElementById('btn-circular'),
    rectangle: document.getElementById('btn-rectangle'),
    branch: document.getElementById('btn-branch'),
    generate: document.getElementById('btn-generate'),
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

    for (const [key, buttonElement] of Object.entries(buttons)) {
        buttonElement.classList.toggle('selected', key === wantedWorldType);
    }
    for (const section of optionalSections) {
        const enabled = section.getAttribute('data-require-world') === wantedWorldType;
        section.classList.toggle('enabled', enabled);
    }
}
onWorldTypeChanged();


let currentWorld;
let updateCurrentUi = function() {};
const generateWorld = function () {
    let world;
    if (isNaN(branchFactorConfig) || isNaN(numberOfRoomsConfig) || isNaN(lengthConfig) || isNaN(startLengthConfig) || isNaN(widthConfig)) {
        return;
    }
    if (wantedWorldType === 'circle' && world.sideLength === 0 || wantedWorldType === 'rectangle' && world.nrOfRooms === 0 || world.sideLength === 0 || wantedWorldType === 'branch' && world.branchFactor === 0 || world.sideLength === 0) {
        buttons.generate.disabled = true;
        showWorld(0);
    }

    if (wantedWorldType != 'circle' && world.sideLength != 0 || wantedWorldType != 'rectangle' && world.nrOfRooms != 0 || world.sideLength != 0 || wantedWorldType != 'branch' && world.branchFactor != 0 || world.sideLength != 0) {
        buttons.generate.disabled = false;
    }

    let createdWorld;
    switch (wantedWorldType) {
        case 'circle':
            world = new World('',wantedWorldType, parseInt(numberOfRoomsConfig.value),0);
            createdWorld = world;
            break;
        case 'rectangle':
            world = new World('',wantedWorldType, parseInt(lengthConfig.value),parseInt(widthConfig.value));
            createdWorld = world;
            break;
        case 'branch':
            world = new World('',wantedWorldType, parseInt(startLengthConfig.value),parseFloat(branchFactorConfig.value));
            createdWorld = world;
            break;
    }
    if (createdWorld !== null) {
        updateCurrentUi = showWorld(createdWorld);
        currentWorld = createdWorld;
    }
};
generateWorld();


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
        queueUpdate();
    };
}

numberOfRoomsConfig.oninput = queueUpdate;
lengthConfig.oninput = queueUpdate;
widthConfig.oninput = queueUpdate;
startLengthConfig.oninput = queueUpdate;
branchFactorConfig.oninput = queueUpdate;

const preview = document.getElementById('row-container');
preview.addEventListener('click', function (e) {
    const roomId = e.target.getAttribute('data-room-id');

    if (roomId === undefined || roomId === null) return;

    const room = currentWorld.rooms[roomId - 1];
    room.canEnter = !room.canEnter;
    // Allow connecting "circular" rooms that wrap around the map
    room.connectTo(currentWorld.wrappingRoomRightOf(room));
    updateCurrentUi();
});