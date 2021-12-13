const urlParams = new URLSearchParams(window.location.search);
const viewedWorldId = parseInt(urlParams.get('id'));
console.log('viewed world id: ', viewedWorldId);

let currentWorld = null;
let updateCurrentUi = function() {};
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


let currentlySelectedRoomId = null;
function selectRoomId(roomId) {
    if (typeof roomId === 'number') {
        // Make sure we don't mix numbers and strings.
        roomId = String(roomId);
    }
    if (currentlySelectedRoomId === roomId) {
        // Already selected
        selectRoomId(null);
        return;
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
}


const preview = document.getElementById('row-container');
const editPathsButton = document.getElementById('btn-edit-paths');

editPathsButton.addEventListener('click', function(e) {
    
});

preview.addEventListener('click', function (e) {
    console.log("Preparing View");
    const roomId = e.target.getAttribute('data-room-id');
    console.log(roomId);
    if (roomId === undefined || roomId === null) {
        console.log("room ID invalid, didn't click on a room");
        selectRoomId(null);
        return;
    }
    selectRoomId(roomId);
    console.log("Room id valid");
    const room = currentWorld.rooms[roomId - 1];

    //room.canEnter = !room.canEnter;
    console.log("View done");

    updateCurrentUi();
    console.log("Updating");
});


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
        console.log(solved);
        return solved;
    }
    else {
        console.log("Invalid parameter/s");
    }
}