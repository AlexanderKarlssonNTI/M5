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

function showWorld(world) {
    console.log("Kilroy was here!");
    const rowContainer = document.getElementById('row-container');
    // Remove all child elements in row container (from previous show world calls):
    rowContainer.innerHTML = '';
    const updateFunctions = [];

    console.log("Start");
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
                console.log(room);
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

    console.log("Show world done");
    // Return a function that updates the UI when called:
    return function () {
        for (const updateFunction of updateFunctions) {
            updateFunction();
        }
    };
}

