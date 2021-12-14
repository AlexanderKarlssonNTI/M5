const urlParams = new URLSearchParams(window.location.search);
const viewedWorldId = parseInt(urlParams.get('id'));
console.log('viewed world id: ', viewedWorldId);

let currentWorld = null;
let updateCurrentUi = function () { };
if (!isNaN(viewedWorldId)) {
    fetch('http://localhost:8000/api/worlds/' + viewedWorldId)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            console.log(data);
            currentWorld = new World(data.name, 'load', data);
            document.getElementById('world-name').textContent = data.name;
            updateCurrentUi = showWorld(currentWorld);
        })
        .catch(function (error) {
            console.error('Failed to get info from backend:\n', error);
        });
}


const editButton = document.getElementById("edit-btn");
const pathfinderButton = document.getElementById("pathfinder-btn");

const editButtonsSection = document.getElementById("edit-btns");

const editRoomsButton = document.getElementById("btn-toggle-rooms");
const editPathsButton = document.getElementById("btn-edit-paths");


let currentlyEditing = false;
function changeEditMode(shouldBeActive) {
    shouldBeActive = Boolean(shouldBeActive);
    if (currentlyEditing === shouldBeActive) return;

    selectRoomId(null);
    currentlyEditing = shouldBeActive;
    if (isPathfinding) {
        pathfinderButton.classList.remove('selected');
        isPathfinding = false;
    }

    editButton.classList.toggle("off", shouldBeActive);
    pathfinderButton.classList.toggle("off", shouldBeActive);
    editButtonsSection.classList.toggle("on", shouldBeActive);
}
document.getElementById("save-btn").addEventListener("click", function () { changeEditMode(false); });
document.getElementById("back-btn-edit").addEventListener("click", function () { changeEditMode(false); });


let isPathfinding = false;
pathfinderButton.addEventListener('click', function () {
    isPathfinding = !isPathfinding;
    selectRoomId(null);
    pathfindingMode(pathfindingPhase,'');
    // pathfinderButton.classList.toggle('selected', isPathfinding);
});

let pathfindingPhase = 1;
let pathfinderStart;
let pathfinderEnd;
let PathfinderSelectS = document.getElementById("Pathfinder-selectS");
let PathfinderSelectE = document.getElementById("Pathfinder-selectE");
let PathfinderResults = document.getElementById("Pathfinder-results");
function pathfindingMode(phase,inputRoom) {
    if (phase === 1){
        console.log("Phase 1")
        PathfinderSelectS.classList.toggle("on",true);
        PathfinderSelectE.classList.toggle("on",false);
        PathfinderResults.classList.toggle("on",false);
        pathfindingPhase = 2;
    }
    else if (phase === 2){
        console.log("Phase 2")
        PathfinderSelectS.classList.toggle("on",false);
        PathfinderSelectE.classList.toggle("on",true);
        pathfinderStart = inputRoom;
        pathfindingPhase = 3;
    }
    else if (phase === 3){
        console.log("Phase 3")
        PathfinderSelectE.classList.toggle("on",false);
        PathfinderResults.classList.toggle("on",true);
        pathfinderEnd = inputRoom;
        let paths = [];
        if (currentWorld.type != "rectangle") {
            paths = SPF(currentWorld, pathfinderStart, pathfinderEnd);
        }
        let shortestPath = paths[0];
        for (let x = 1; x<paths.length;x++) {
            if (paths[x].length < shortestPath.length) {
                shortestPath = paths[x];
            }
        }
        PathfinderResults.innerHTML = "Shortest path between "+pathfinderStart+" and "+pathfinderEnd+":<br />"+shortestPath;
        selectRoomId(null);
        isPathfinding = !isPathfinding;
        pathfindingPhase = 1;
    }
    else{
        console.log("ERROR WITH PATHFINDING");
    }
}



const editModes = {
    rooms: editRoomsButton,
    paths: editPathsButton,
};
let currentEditMode = 'rooms';
editModes[currentEditMode].classList.add('selected');

for (const key of Object.keys(editModes)) {
    editModes[key].addEventListener('click', function () {
        if (currentEditMode === key) return;
        selectRoomId(null);
        editModes[currentEditMode].classList.remove('selected');
        currentEditMode = key;
        editModes[currentEditMode].classList.add('selected');
    });
}



let currentlySelectedRoomId = null;
function selectRoomId(roomId) {
    if (typeof roomId === 'number') {
        // Make sure we don't mix numbers and strings.
        roomId = String(roomId);
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
    console.log(roomId);
    if (roomId === undefined || roomId === null) {
        // console.log("room ID invalid, didn't click on a room");
        selectRoomId(null);
        return;
    }
    // console.log("Room id valid");
    const room = currentWorld.rooms[roomId - 1];

    if (currentlyEditing) {
        switch (currentEditMode) {
            case 'rooms':
                room.canEnter = !room.canEnter;
                updateCurrentUi();
                break;

            case 'paths':
                if (currentlySelectedRoomId == roomId) {
                    // Clicked on same room twice so just unselect:
                    selectRoomId(null);
                } else if (currentlySelectedRoomId !== null) {
                    const selectedRoomId = currentlySelectedRoomId;
                    // Toggle path
                    selectRoomId(null);

                    const previousRoomId = parseInt(selectedRoomId);
                    if (isNaN(previousRoomId)) {
                        console.error('invalid selected room id', selectedRoomId);
                        return;
                    }

                    const previousRoom = currentWorld.rooms[previousRoomId - 1];

                    if (previousRoom.hasExitTo(room)) {
                        // Rooms are already connected, so disconnect them:
                        previousRoom.disconnectFrom(room);
                        updateCurrentUi();
                    } else if (
                        currentWorld.wrappingRoomLeftOf(previousRoom) === room ||
                        currentWorld.wrappingRoomRightOf(previousRoom) === room ||
                        currentWorld.wrappingRoomAboveOf(previousRoom) === room ||
                        currentWorld.wrappingRoomBelowOf(previousRoom) === room
                    ) {
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
            if (currentlySelectedRoomId !== null) {
                switch(pathfindingPhase){
                    case 2:
                        pathfindingMode(2,room.ID);
                        break;
                    case 3:
                        pathfindingMode(3,room.ID);
                        break;
                    default:
                        pathfindingMode(1,'');
                }
                // if (pathfindingPhase === 0 || pathfindingPhase === 1 || pathfindingPhase === 3) {
                //     pathfindingMode(pathfindingPhase,'');
                // }
                // else if (pathfindingPhase === 2 || pathfindingPhase === 3) {
                //     pathfindingMode(pathfindingPhase, room.ID);
                // }
            } else {
                // No room selected, so select this one:
                selectRoomId(roomId);
            }
        } else {
            if (!selectRoomId(roomId)) {
                // Already selected:
                selectRoomId(null);
            } else {
                showInfoAboutRoom(room);
            }
        }
    }
});

function showInfoAboutRoom(room) {
    document.getElementById('room-display-name').textContent = room.name;
    document.getElementById('room-display-id').textContent = room.ID;
    let exits = "";
    for (let i = 0; i < room.exits.length; i++) {
        if (i !== 0) {
            exits += ',';
        }
        exits += room.exits[i];
    }
    document.getElementById('room-display-exits').textContent = exits;
}

function saveWorldEdits() {

}


function SPF(world, startID, endID) {
    if (startID > 0 && endID > 0 && startID < world.rooms.length && endID < world.rooms.length) {
        let checking = [[startID]];
        let solved = [];
        while (checking.length > 0) {
            let newCheck = [];
            for (path of checking) {
                let lastroom = path[path.length - 1];
                let exits = world.rooms[lastroom - 1].exits;
                for (let i = 0; i < exits.length; i++) {
                    let temp = [];
                    let exit = world.rooms[lastroom - 1].exits[i];
                    if (exit == endID) {
                        temp = path.slice();
                        temp.push(exit);
                        solved.push(temp.slice());
                    }
                    else if (!path.includes(exit)) {
                        temp = path.slice();
                        temp.push(exit);
                        newCheck.push(temp.slice());
                    }
                }
            }
            checking = newCheck.slice();
        }
        return solved;
    }
    else {
        console.log("Invalid parameter/s");
    }
}