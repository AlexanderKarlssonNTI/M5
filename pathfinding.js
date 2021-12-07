// class World {
//     constructor() {
//         this.name = '';
//         this.rooms = [];
//         this.sideLength = 4;
//     }

//     wrappingRoomLeftOf(room) {
//         let id = room.id - 1;
//         if ((room.id % this.sideLength) == 1) {
//             // First room
//             id = room.id + this.sideLength - 1;
//             if (id > this.rooms.length) {
//                 return null;
//             }
//         }
//         return this.rooms[id - 1];
//     }
//     wrappingRoomRightOf(room) {
//         let id = room.id + 1;
//         if ((room.id % this.sideLength) == 0) {
//             // last room
//             id = room.id - this.sideLength + 1;
//             if (id <= 0) {
//                 return null;
//             }
//         }
//         return this.rooms[id - 1];
//     }
//     roomLeftOf(room) {
//         const id = room.id - 1;
//         if ((room.id % this.sideLength) == 1) {
//             // First room
//             return null;
//         }
//         return this.rooms[id - 1];
//     }
//     roomRightOf(room) {
//         const id = room.id + 1;
//         if ((room.id % this.sideLength) == 0) {
//             // last room
//             return null;
//         }
//         return this.rooms[id - 1];
//     }
//     roomAboveOf(room) {
//         const id = room.id - this.sideLength;
//         if (id <= 0) {
//             return null;
//         }
//         return this.rooms[id - 1];
//     }
//     roomBelowOf(room) {
//         const id = room.id + this.sideLength;
//         if (id > this.rooms.length) {
//             return null;
//         }
//         return this.rooms[id - 1];
//     }

//     blockRoom(room) {
//         if (!room) return;
//         room.disconnectFrom(this.roomAboveOf(room));
//         room.disconnectFrom(this.roomBelowOf(room));
//         room.disconnectFrom(this.roomLeftOf(room));
//         room.disconnectFrom(this.roomRightOf(room));
//         room.canEnter = false;
//     }
// }


function showWorld(world) {
    const rowContainer = document.getElementById('row-container');
    // Remove all child elements in row container (from previous show world calls):
    rowContainer.innerHTML = '';
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
                        const roomLeftOf = room.hasExitTo(world.wrappingRoomLeftOf(room));
                        roomDiv.classList.toggle('path-to-left', roomLeftOf);
                        spacerBefore.classList.toggle('has-path', roomLeftOf);
                    }
                    {
                        const roomRightOf = room.hasExitTo(world.wrappingRoomRightOf(room));
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

