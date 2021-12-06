class Room {
    constructor() {
        this.title = '';
        this.id = 1;
        this.exits = [];
        this.canEnter = true;
    }

    hasExitTo(room) {
        if (room === null || room === undefined) return false;
        if (!this.canEnter || !room.canEnter) return false;
        return this.exits.includes(room.id);
    }
    removeExitTo(room) {
        if (room === null || room === undefined) return false;

        const index = this.exits.indexOf(room.id);
        if (index > -1) {
            this.exits.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }
    addExitTo(room) {
        if (room === null || room === undefined) return false;
        if (!this.canEnter || !room.canEnter) return false;

        if (this.exits.includes(room.id)) {
            // Already have exit:
            return false;
        }
        this.exits.push(room.id);
        return true;
    }

    connectTo(room) {
        if (!room) return;
        this.addExitTo(room);
        room.addExitTo(this);
    }
    disconnectFrom(room) {
        if (!room) return;
        this.removeExitTo(room);
        room.removeExitTo(this);
    }
}

class World {
    constructor() {
        this.name = '';
        this.rooms = [];
        this.sideLength = 4;
    }

    wrappingRoomLeftOf(room) {
        let id = room.id - 1;
        if ((room.id % this.sideLength) == 1) {
            // First room
            id = room.id + this.sideLength - 1;
            if (id > this.rooms.length) {
                return null;
            }
        }
        return this.rooms[id - 1];
    }
    wrappingRoomRightOf(room) {
        let id = room.id + 1;
        if ((room.id % this.sideLength) == 0) {
            // last room
            id = room.id - this.sideLength + 1;
            if (id <= 0) {
                return null;
            }
        }
        return this.rooms[id - 1];
    }
    roomLeftOf(room) {
        const id = room.id - 1;
        if ((room.id % this.sideLength) == 1) {
            // First room
            return null;
        }
        return this.rooms[id - 1];
    }
    roomRightOf(room) {
        const id = room.id + 1;
        if ((room.id % this.sideLength) == 0) {
            // last room
            return null;
        }
        return this.rooms[id - 1];
    }
    roomAboveOf(room) {
        const id = room.id - this.sideLength;
        if (id <= 0) {
            return null;
        }
        return this.rooms[id - 1];
    }
    roomBelowOf(room) {
        const id = room.id + this.sideLength;
        if (id > this.rooms.length) {
            return null;
        }
        return this.rooms[id - 1];
    }

    blockRoom(room) {
        if (!room) return;
        room.disconnectFrom(this.roomAboveOf(room));
        room.disconnectFrom(this.roomBelowOf(room));
        room.disconnectFrom(this.roomLeftOf(room));
        room.disconnectFrom(this.roomRightOf(room));
        room.canEnter = false;
    }
}

class WorldBuilder {
    constructor() {
        this.nrOfRooms = 6;
        this.sideLength = 4;
        this.branchFactor = 0.7;
        this.id = 1;
    }


    titleGen() {
        const word1 = ['bloody', 'sacred', 'fucked', 'raw', 'stained', 'hellish', 'banal', 'simple', 'fine'];
        const word2 = ['room', 'place', 'corner'];
        const word3 = ['greatness', 'horror', 'delusions'];
        let roomTitle = 'A ' + word1[Math.floor(Math.random() * word1.length)];
        roomTitle += ' ' + word2[Math.floor(Math.random() * word2.length)] + ' of ';
        roomTitle += word3[Math.floor(Math.random() * word3.length)];
        // let uniqueRoomTitle = roomTitle.filter(onlyUnique);
        return roomTitle;
    }

    stringWorldRoomGen() {
        let room = new Room();
        room.title = this.titleGen();
        room.id = this.id++;
        const exitPreviousRoom = room.id - 1;
        const exitNextRoom = room.id + 1;
        if (exitPreviousRoom > 0) {
            if (exitNextRoom <= this.nrOfRooms) {
                room.exits = [exitPreviousRoom, exitNextRoom];
            } else if (exitNextRoom > this.nrOfRooms) {
                room.exits = [exitPreviousRoom];
            }
        } else {
            room.exits = [exitNextRoom];
        }
        return room;
    }

    squareWorldRoomGen() {
        let room = new Room();
        room.title = this.titleGen();
        room.id = this.id++;
        const exitLeftRoom = room.id - 1;
        const exitRightRoom = room.id + 1;
        const exitUpRoom = room.id - this.sideLength;
        const exitDownRoom = room.id + this.sideLength;
        if (exitLeftRoom % this.sideLength != 0) {
            room.exits.push(exitLeftRoom);
        }
        if ((room.id % this.sideLength) != 0 && exitRightRoom <= this.nrOfRooms) {
            room.exits.push(exitRightRoom);
        }
        if (exitUpRoom > 0) {
            room.exits.push(exitUpRoom);
        }
        if (exitDownRoom <= this.nrOfRooms) {
            room.exits.push(exitDownRoom);
        }
        return room;
    }

    branchedWorldRoomGen() {
        const room = this.squareWorldRoomGen();
        let lengthOfMainBranch = 12;
        let childBranch = lengthOfMainBranch * 0.7;

        return room;
    }


    generateStringWorld() {
        this.id = 1;
        let world = new World();
        world.name = 'The world - ' + this.titleGen();
        world.sideLength = this.sideLength;

        // world.id = (((1+Math.random())*0x10000)|0);
        for (let i = 0; i < this.nrOfRooms; i++) {
            world.rooms.push(this.stringWorldRoomGen());
        }
        return world;
    }

    generateSquareWorld() {
        this.id = 1;
        let world = new World();
        world.name = 'The world - ' + this.titleGen();
        world.sideLength = this.sideLength;

        // world.id = (((1+Math.random())*0x10000)|0);
        for (let i = 0; i < this.nrOfRooms; i++) {
            world.rooms.push(this.squareWorldRoomGen());
        }
        return world;
    }

    generateBranchedWorld(lengthOfMainBranch) {
        if (!lengthOfMainBranch || isNaN(lengthOfMainBranch)) {
            console.error('Please set a length for the main branch, was: ', lengthOfMainBranch);
            return null;
        }
        if (isNaN(this.branchFactor)) {
            console.error('Branch factor was NaN, ', this.branchFactor);
            return null;
        }

        // Generate main branch:
        this.nrOfRooms = lengthOfMainBranch;
        this.sideLength = lengthOfMainBranch;
        const world = this.generateSquareWorld();

        // Generate child branches:
        let lengthOfParentBranch = lengthOfMainBranch;
        let startOfParentBranch = 0;
        let row = 1;
        while (true) {
            const lengthOfChildBranch = Math.round(lengthOfParentBranch * this.branchFactor);
            if (lengthOfChildBranch <= 5) {
                // Don't allow child branches that are 5 rooms or shorter:
                break;
            }
            if (lengthOfChildBranch >= lengthOfParentBranch) {
                // Prevent infinite loop
                console.error('Invalid branch factor, child branch same length as parent branch, length: ', lengthOfParentBranch);
                break;
            }

            // Create blocked/empty/placeholder rooms for this row:
            for (let i = 0; i < lengthOfMainBranch; i++) {
                const room = new Room();
                room.title = this.titleGen();
                room.id = this.id++;
                room.canEnter = false;

                world.rooms.push(room);
                world.nrOfRooms++;
            }

            // Enable and connect the rooms we actually want to use:

            let startOfChildBranch = startOfParentBranch + Math.floor(Math.random() * (lengthOfParentBranch - lengthOfChildBranch + 1));
            for (let i = 0; i < lengthOfChildBranch; i++) {
                // Room is at: skip previous row + we skip some rooms at the start of the row + the index of the current child room:
                let room = world.rooms[world.sideLength * row + startOfChildBranch + i];
                room.canEnter = true;

                const isLastRoom = i + 1 >= lengthOfChildBranch;
                if (i != 0) {
                    // Connect to previous room in this child branch:
                    room.connectTo(world.roomLeftOf(room));
                }
                if (i == 0 || isLastRoom) {
                    // Connect to parent branch:
                    room.connectTo(world.roomAboveOf(room));
                }

            }

            // Update parent branch info for next loop iteration:
            lengthOfParentBranch = lengthOfChildBranch;
            startOfParentBranch = startOfChildBranch;
            row++;
        }

        return world;
    }
}


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
                    element.setAttribute('data-room-id', room.id);
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

