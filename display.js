function showWorld(world, assumeBidirectionalPaths = false) {
    const rowContainer = document.getElementById('row-container');
    // Remove all child elements in row container (from previous show world calls):
    rowContainer.innerHTML = '';
    if (!world) {
        return null;
    }
    const updateFunctions = [];

    console.log("Start");
    const totalRows = Math.ceil(world.rooms.length / world.sideLength);
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

            // Add room id attribute to more spacers (allows them to be clicked and do a "room" action)
            let addRoomIdAttribute = function () { };

            const roomIndex = row * world.sideLength + i;
            if (roomIndex < world.rooms.length) {
                const room = world.rooms[roomIndex];
                console.log(room);

                for (const pathElement of [spacerBefore, spacerAfter, spacerAbove, spacerBelow]) {
                    pathElement.setAttribute('data-path-from-room-id', room.ID);
                }

                // Set room id attribute to allow click events to get a room id (allows "room" actions):
                if (assumeBidirectionalPaths) {
                    roomDiv.setAttribute('data-room-id', room.ID);
                } else {
                    for (const element of [roomDiv, spacerBefore, spacerAfter, spacerAbove, spacerBelow]) {
                        element.setAttribute('data-room-id', room.ID);
                    }
                    addRoomIdAttribute = function (element) {
                        element.setAttribute('data-room-id', room.ID);
                    };
                }

                // Update UI with info about exits and "blocked" room:
                const updateRoom = function () {
                    roomDiv.classList.toggle('blocked', !room.canEnter);
                    {
                        const targetRoom = world.sideLength <= 2 ? world.roomLeftOf(room) : world.wrappingRoomLeftOf(room);
                        const roomLeftOf = room.hasExitTo(targetRoom);
                        roomDiv.classList.toggle('path-to-left', roomLeftOf);
                        spacerBefore.classList.toggle('has-path', roomLeftOf);
                        if (targetRoom) {
                            spacerBefore.setAttribute('data-path-to-room-id', targetRoom.ID);
                        }
                    }
                    {
                        const targetRoom = world.sideLength <= 2 ? world.roomRightOf(room) : world.wrappingRoomRightOf(room);
                        const roomRightOf = room.hasExitTo(targetRoom);
                        roomDiv.classList.toggle('path-to-right', roomRightOf);
                        spacerAfter.classList.toggle('has-path', roomRightOf);
                        if (targetRoom) {
                            spacerAfter.setAttribute('data-path-to-room-id', targetRoom.ID);
                        }
                    }
                    {
                        const targetRoom = totalRows <= 2 ? world.roomAboveOf(room) : world.wrappingRoomAboveOf(room);
                        const roomAboveOf = room.hasExitTo(targetRoom);
                        roomDiv.classList.toggle('path-to-above', roomAboveOf);
                        spacerAbove.classList.toggle('has-path', roomAboveOf);
                        if (targetRoom) {
                            spacerAbove.setAttribute('data-path-to-room-id', targetRoom.ID);
                        }
                    }
                    {
                        const targetRoom = totalRows <= 2 ? world.roomBelowOf(room) : world.wrappingRoomBelowOf(room);
                        const roomBelowOf = room.hasExitTo(targetRoom);
                        roomDiv.classList.toggle('path-to-below', roomBelowOf);
                        spacerBelow.classList.toggle('has-path', roomBelowOf);
                        if (targetRoom) {
                            spacerBelow.setAttribute('data-path-to-room-id', targetRoom.ID);
                        }
                    }
                };
                updateRoom();
                updateFunctions.push(updateRoom);
            } else {
                // There isn't a room at this index:
                roomDiv.classList.add('blocked');
            }

            // Spacer before room:
            if (i == 0 || !assumeBidirectionalPaths) {
                rowDiv.appendChild(spacerBefore);
                {
                    // Mimic layout of normal row div in row "spacer":
                    const spacer = document.createElement('div');
                    spacer.classList.add('spacer');
                    addRoomIdAttribute(spacer);
                    rowSpacerAfter.appendChild(spacer);
                }
                {
                    // Mimic layout of normal row div in row "spacer":
                    const spacer = document.createElement('div');
                    spacer.classList.add('spacer');
                    addRoomIdAttribute(spacer);
                    rowSpacerBefore.appendChild(spacer);
                }
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
                addRoomIdAttribute(spacer);
                rowSpacerAfter.appendChild(spacer);
            }
            {
                // Mimic layout of normal row div in row "spacer":
                const spacer = document.createElement('div');
                spacer.classList.add('spacer');
                addRoomIdAttribute(spacer);
                rowSpacerBefore.appendChild(spacer);
            }
        }

        if (row == 0 || !assumeBidirectionalPaths) {
            rowContainer.appendChild(rowSpacerBefore);
        }
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