const urlParams = new URLSearchParams(window.location.search);
const viewedWorldId = parseInt(urlParams.get('id'));
console.log('viewed world id: ', viewedWorldId);

let currentWorld = null;
let updateCurrentUi = function() {};
if (!isNaN(viewedWorldId)) {
    fetch('http://localhost:8000/api/view/' + viewedWorldId)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            // TODO: update ui to show the fetched world
            console.log(data);
            currentWorld = new World(data.name, 'load', data);
            updateCurrentUi = showWorld(currentWorld);
        })
        .catch(function (error) {
            console.error('Failed to get info from backend:\n', error);
        });
}


const preview = document.getElementById('row-container');
preview.addEventListener('click', function (e) {
    console.log("Preparing preview");
    const roomId = e.target.getAttribute('data-room-id');
    console.log(roomId);
    if (roomId === undefined || roomId === null) {
        console.log("room ID invalid, didn't click on a room");
        return;
    }
    console.log("Room id valid");
    const room = currentWorld.rooms[roomId - 1];

    room.canEnter = !room.canEnter;
    console.log("Preview done");

    updateCurrentUi();
    console.log("Updating");
});


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