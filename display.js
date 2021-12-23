function showWorld(world, assumeBidirectionalPaths = false) {
    const rowContainer = document.getElementById('row-container');
    // Remove all child elements in row container (from previous show world calls):
    rowContainer.innerHTML = '';
    if (!world) {
        return null;
    }
    const updateFunctions = [];

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


            const spacerDiagonalUpperLeft = document.createElement('div');
            spacerDiagonalUpperLeft.classList.add('spacer');
            spacerDiagonalUpperLeft.classList.add('upper-left');

            const spacerDiagonalUpperRight = document.createElement('div');
            spacerDiagonalUpperRight.classList.add('spacer');
            spacerDiagonalUpperRight.classList.add('upper-right');

            const spacerDiagonalBottomLeft = document.createElement('div');
            spacerDiagonalBottomLeft.classList.add('spacer');
            spacerDiagonalBottomLeft.classList.add('bottom-left');

            const spacerDiagonalBottomRight = document.createElement('div');
            spacerDiagonalBottomRight.classList.add('spacer');
            spacerDiagonalBottomRight.classList.add('bottom-right');


            // Create a div tag for each room:
            const roomDiv = document.createElement('div');
            roomDiv.classList.add('room');

            const roomIndex = row * world.sideLength + i;
            if (roomIndex < world.rooms.length) {
                const room = world.rooms[roomIndex];

                const spacers = [
                    spacerBefore, spacerAfter, spacerAbove, spacerBelow,
                    spacerDiagonalUpperLeft, spacerDiagonalUpperRight, spacerDiagonalBottomLeft, spacerDiagonalBottomRight,
                ];
                for (const pathElement of spacers) {
                    pathElement.setAttribute('data-path-from-room-id', room.ID);
                }

                // Set room id attribute to allow click events to get a room id (allows "room" actions):
                roomDiv.setAttribute('data-room-id', room.ID);

                if (!assumeBidirectionalPaths) {
                    // Add room id attribute to spacers (allows them to be clicked and do a "room" action):
                    for (const element of spacers) {
                        element.setAttribute('data-room-id', room.ID);
                    }
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
                    const roomAbove = totalRows <= 2 ? world.roomAboveOf(room) : world.wrappingRoomAboveOf(room);
                    {
                        const targetRoom = roomAbove;
                        const roomAboveOf = room.hasExitTo(targetRoom);
                        roomDiv.classList.toggle('path-to-above', roomAboveOf);
                        spacerAbove.classList.toggle('has-path', roomAboveOf);
                        if (targetRoom) {
                            spacerAbove.setAttribute('data-path-to-room-id', targetRoom.ID);
                        }
                    }
                    const roomBelow = totalRows <= 2 ? world.roomBelowOf(room) : world.wrappingRoomBelowOf(room);
                    {
                        const targetRoom = roomBelow;
                        const roomBelowOf = room.hasExitTo(targetRoom);
                        roomDiv.classList.toggle('path-to-below', roomBelowOf);
                        spacerBelow.classList.toggle('has-path', roomBelowOf);
                        if (targetRoom) {
                            spacerBelow.setAttribute('data-path-to-room-id', targetRoom.ID);
                        }
                    }

                    if (world.sideLength > 2 || totalRows > 2) {
                        {
                            const targetRoom = world.wrappingRoomLeftOf(roomAbove);
                            const hasPath = room.hasExitTo(targetRoom);
                            roomDiv.classList.toggle('path-to-upper-left', hasPath);
                            spacerDiagonalUpperLeft.classList.toggle('has-path', hasPath);
                            if (targetRoom) {
                                spacerDiagonalUpperLeft.setAttribute('data-path-to-room-id', targetRoom.ID);
                            }
                        }
                        {
                            const targetRoom = world.wrappingRoomRightOf(roomAbove);
                            const hasPath = room.hasExitTo(targetRoom);
                            roomDiv.classList.toggle('path-to-upper-right', hasPath);
                            spacerDiagonalUpperRight.classList.toggle('has-path', hasPath);
                            if (targetRoom) {
                                spacerDiagonalUpperRight.setAttribute('data-path-to-room-id', targetRoom.ID);
                            }
                        }
                        {
                            const targetRoom = world.wrappingRoomLeftOf(roomBelow);
                            const hasPath = room.hasExitTo(targetRoom);
                            roomDiv.classList.toggle('path-to-bottom-left', hasPath);
                            spacerDiagonalBottomLeft.classList.toggle('has-path', hasPath);
                            if (targetRoom) {
                                spacerDiagonalBottomLeft.setAttribute('data-path-to-room-id', targetRoom.ID);
                            }
                        }
                        {
                            const targetRoom = world.wrappingRoomRightOf(roomBelow);
                            const hasPath = room.hasExitTo(targetRoom);
                            roomDiv.classList.toggle('path-to-bottom-right', hasPath);
                            spacerDiagonalBottomRight.classList.toggle('has-path', hasPath);
                            if (targetRoom) {
                                spacerDiagonalBottomRight.setAttribute('data-path-to-room-id', targetRoom.ID);
                            }
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
                // Mimic layout of normal row div in row "spacer":
                rowSpacerAfter.appendChild(spacerDiagonalBottomLeft);
                rowSpacerBefore.appendChild(spacerDiagonalUpperLeft);
            }

            // Add room
            rowDiv.appendChild(roomDiv);
            rowSpacerAfter.appendChild(spacerBelow);
            rowSpacerBefore.appendChild(spacerAbove);

            // Spacer after room:
            rowDiv.appendChild(spacerAfter);
            // Mimic layout of normal row div in row "spacer":
            rowSpacerAfter.appendChild(spacerDiagonalBottomRight);
            rowSpacerBefore.appendChild(spacerDiagonalUpperRight);
        }

        if (row == 0 || !assumeBidirectionalPaths) {
            rowContainer.appendChild(rowSpacerBefore);
        }
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