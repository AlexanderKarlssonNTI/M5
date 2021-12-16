class Room {
    constructor(id, name = null) {
        this.name = name || this.Baptist();
        this.ID = id;
        this.exits = new Array;
        this.canEnter = true;
    }

    Baptist() {
        const adj = ["bloody", "bleak", "dark", "clean", "dirty", "cozy", "heavenly", "hellish", "beautiful", "never-ending", "holy", "lovely", "empty"];
        const plc = ["hallway", "room", "corridor", "toilet", "kitchen", "basement", "bedroom", "dining room", "garden", "chapel", "dining hall", "bathroom"];
        const dsc = ["death", "despair", "hopelessness", "healing", "horror", "happiness", "joy", "bliss", "business", "love", "sin", "virtue", "hope", "corruption"];
        let word1 = adj[Math.floor(Math.random() * adj.length)];
        let word2 = plc[Math.floor(Math.random() * plc.length)];
        let word3 = dsc[Math.floor(Math.random() * dsc.length)];
        let fullName = "A " + word1 + " " + word2 + " of " + word3;
        return fullName;
    }

    hasExitTo(room) {
        if (room === null || room == undefined) return false;
        if (!this.canEnter || !room.canEnter) return false;
        return this.exits.includes(room.ID);
    }
    removeExitTo(room) {
        if (room === null || room === undefined) return false;

        const index = this.exits.indexOf(room.ID);
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

        if (this.exits.includes(room.ID)) {
            // Already have exit:
            return false;
        }
        this.exits.push(room.ID);
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
    constructor(Name, Type, parameter1, parameter2) {
        this.name = Name;
        this.type = Type;
        this.rooms = new Array;
        this.sideLength = new Number;
        switch (Type) {
            case "circle":
                this.generateCircleWorld(parameter1);
                break;
            case "rectangle":
                this.generateRectangleWorld(parameter1, parameter2);
                break;
            case "branch":
                this.generateBranchWorld(parameter1, parameter2);
                break;
            case "branch-alternative":
                this.type = 'branch';
                this.generateBranchWorldAlternative(parameter1, parameter2);
                break;
            case "load":
                this.load(parameter1);
                break;
            default:
                console.log("Error: Invalid inputs");
        }
    }
    load(data) {
        this.name = data.name;
        this.type = data.type;
        this.rooms = [];
        this.sideLength = data.sideLength;

        for (const room of data.rooms) {
            const createdRoom = new Room(room.ID, room.name);
            createdRoom.canEnter = room.canEnter;
            createdRoom.exits = room.exits;
            this.rooms.push(createdRoom);
        }
    }
    generateCircleWorld(nrOfRooms) {
        if (nrOfRooms == 1) {
            this.rooms.push(new Room(1));
            this.sideLength = 1;
        }
        else if (nrOfRooms > 1) {
            this.rooms.push(new Room(1));
            this.sideLength = nrOfRooms;
            for (let x = 1; x < nrOfRooms; x++) {
                this.rooms.push(new Room(x + 1));
                this.rooms[x - 1].exits.push(this.rooms[x].ID);
                this.rooms[x].exits.push(this.rooms[x - 1].ID);
            }
            if (nrOfRooms != 2) {
                this.rooms[0].exits.push(nrOfRooms);
                this.rooms[nrOfRooms - 1].exits.push(1);
            }
        }
    }

    generateRectangleWorld(length, height) {
        if (length < 1) {
            return;
        }

        this.sideLength = length;
        this.rooms.push(new Room(1));
        for (let x = 1; x < length; x++) {
            this.rooms.push(new Room(x + 1));
            this.rooms[x - 1].exits.push(this.rooms[x].ID);
            this.rooms[x].exits.push(this.rooms[x - 1].ID);
        }
        for (let y = 1; y < height; y++) {
            this.rooms.push(new Room(length * y + 1));
            for (let x = 1; x < length; x++) {
                this.rooms.push(new Room(length * y + x + 1));
                this.rooms[length * y + x - 1].exits.push(this.rooms[length * y + x].ID);
                this.rooms[length * y + x].exits.push(this.rooms[length * y + x - 1].ID);
            }
            for (let x = 1; x <= length; x++) {
                this.rooms[length * y + x - 1].exits.push(this.rooms[length * (y - 1) + x - 1].ID);
                this.rooms[length * (y - 1) + x - 1].exits.push(this.rooms[length * y + x - 1].ID);
            }
        }
    }

    generateBranchWorld(mainbranch, factor) {
        if (factor >= 1 || isNaN(factor)) {
            console.error('Factor must be less than 1 but it was: ', factor);
            return;
        }
        this.sideLength = mainbranch;
        if (mainbranch == 1) {
            this.rooms.push(new Room(1));
        } else {
            this.rooms.push(new Room(1));
            for (let x = 1; x < mainbranch; x++) {
                this.rooms.push(new Room(x + 1));
                this.rooms[x - 1].exits.push(this.rooms[x].ID);
                this.rooms[x].exits.push(this.rooms[x - 1].ID);
            }
            let childLength = Math.floor(mainbranch * factor);
            let mainLength = this.rooms.length;
            while (childLength > 5) {
                this.rooms.push(new Room(mainLength + 1));
                // TODO: add empty rooms at the beginning and end of the row (with canEnter set to false).
                for (let x = 1; x < childLength; x++) {
                    this.rooms.push(new Room(mainLength + x + 1));
                    this.rooms[mainLength + x - 1].exits.push(this.rooms[mainLength + x].ID);
                    this.rooms[mainLength + x].exits.push(this.rooms[mainLength + x - 1].ID);
                }
                // TODO: connect first and last room to previous row
                mainLength = this.rooms.length;
                childLength = Math.floor(childLength * factor);
            }
        }
    }

    // included due to problems in the normal one...
    generateBranchWorldAlternative(lengthOfMainBranch, branchFactor) {
        if (!lengthOfMainBranch || isNaN(lengthOfMainBranch)) {
            console.error('Please set a length for the main branch, was: ', lengthOfMainBranch);
            return;
        }
        if (isNaN(branchFactor)) {
            console.error('Branch factor was NaN, ', branchFactor);
            return;
        }

        this.sideLength = lengthOfMainBranch;


        // Generate main branch:
        this.rooms.push(new Room(1));
        for (let x = 1; x < lengthOfMainBranch; x++) {
            this.rooms.push(new Room(x + 1));

            this.rooms[x - 1].exits.push(this.rooms[x].ID);
            this.rooms[x].exits.push(this.rooms[x - 1].ID);
        }

        // Generate child branches:
        let lengthOfParentBranch = lengthOfMainBranch;
        let startOfParentBranch = 0;
        let row = 1;
        while (true) {
            const lengthOfChildBranch = Math.round(lengthOfParentBranch * branchFactor);
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
                const room = new Room(this.rooms.length + 1);
                room.canEnter = false;

                this.rooms.push(room);
            }

            // Enable and connect the rooms we actually want to use:

            const startOfChildBranch = startOfParentBranch + Math.floor(Math.random() * (lengthOfParentBranch - lengthOfChildBranch + 1));
            for (let i = 0; i < lengthOfChildBranch; i++) {
                // Room is at: skip previous row + we skip some rooms at the start of the row + the index of the current child room:
                const room = this.rooms[this.sideLength * row + startOfChildBranch + i];
                room.canEnter = true;

                const isLastRoom = i + 1 >= lengthOfChildBranch;
                if (i != 0) {
                    // Connect to previous room in this child branch:
                    room.connectTo(this.roomLeftOf(room));
                }
                if (i == 0 || isLastRoom) {
                    // Connect to parent branch:
                    room.connectTo(this.roomAboveOf(room));
                }
            }

            // Update parent branch info for next loop iteration:
            lengthOfParentBranch = lengthOfChildBranch;
            startOfParentBranch = startOfChildBranch;
            row++;
        }
    }


    wrappingRoomLeftOf(room) {
        let id = room.ID - 1;
        if ((room.ID - 1) % this.sideLength == 0) {
            // First room
            id = room.ID + this.sideLength - 1;
            if (id > this.rooms.length) {
                return null;
            }
        }
        return this.rooms[id - 1];
    }
    wrappingRoomRightOf(room) {
        let id = room.ID + 1;
        if ((room.ID % this.sideLength) == 0) {
            // last room
            id = room.ID - this.sideLength + 1;
            if (id <= 0) {
                return null;
            }
        }
        return this.rooms[id - 1];
    }
    wrappingRoomAboveOf(room) {
        const nonWrapping = this.roomAboveOf(room);
        if (nonWrapping === null) {
            const rows = Math.ceil(this.rooms.length / this.sideLength);
            // Skip all except last row + colum offset for specified room:
            const id = (rows - 1) * this.sideLength + ((room.ID - 1) % this.sideLength);
            if (id >= this.rooms.length) {
                return null;
            }
            return this.rooms[id];
        } else {
            return nonWrapping;
        }
    }
    wrappingRoomBelowOf(room) {
        const nonWrapping = this.roomBelowOf(room);
        if (nonWrapping === null) {
            // colum offset for specified room:
            const id = (room.ID - 1) % this.sideLength;
            return this.rooms[id];
        } else {
            return nonWrapping;
        }
    }
    roomLeftOf(room) {
        const id = room.ID - 1;
        if ((room.ID - 1) % this.sideLength == 0) {
            // First room
            return null;
        }
        return this.rooms[id - 1];
    }
    roomRightOf(room) {
        const id = room.ID + 1;
        if ((room.ID % this.sideLength) == 0) {
            // last room
            return null;
        }
        return this.rooms[id - 1];
    }
    roomAboveOf(room) {
        const id = room.ID - this.sideLength;
        if (id <= 0) {
            return null;
        }
        return this.rooms[id - 1];
    }
    roomBelowOf(room) {
        const id = room.ID + this.sideLength;
        if (id > this.rooms.length) {
            return null;
        }
        return this.rooms[id - 1];
    }

    blockRoom(room) {
        if (!room) return;
        room.disconnectFrom(this.wrappingRoomAboveOf(room));
        room.disconnectFrom(this.wrappingRoomBelowOf(room));
        room.disconnectFrom(this.wrappingRoomLeftOf(room));
        room.disconnectFrom(this.wrappingRoomRightOf(room));
        room.canEnter = false;
    }

    getRoomById(roomId) {
        switch (typeof roomId) {
            case 'string':
                roomId = parseInt(roomId);
            case 'number':
                if (isNaN(roomId)) {
                    return null;
                }
                if (roomId < 1 || roomId > this.rooms.length) {
                    return null;
                }
                return this.rooms[roomId - 1];
            default:
                return null;
        }
    }
    getRoomByActiveRoomNumber(number) {
        switch (typeof number) {
            case 'string':
                number = parseInt(number);
            case 'number':
                if (isNaN(number)) {
                    return null;
                }
                if (number < 0) {
                    return null;
                }
                break;
            default:
                return null;
        }
        let visibleCount = 0;
        for (const room of this.rooms) {
            if (room.canEnter) {
                if (visibleCount === number) {
                    return room;
                }
                visibleCount++;
            }
        }
        return null;
    }
    activeRoomNumberForRoom(room) {
        let roomId;
        switch (typeof room) {
            case 'object':
                if (!room) {
                    return null;
                }
                roomId = room.ID;
                break;
            case 'string':
                room = parseInt(room);
            case 'number':
                if (isNaN(room)) {
                    return null;
                }
                if (room < 0 || room > this.rooms.length) {
                    return null;
                }
                roomId = room;
                break;
            default:
                return null;
        }

        let count = 0;
        for (let i = 0; i < (roomId - 1); i++) {
            if (this.rooms[i].canEnter) {
                count++;
            }
        }
        return count;
    }
}

function WorldBaptist() {
    const adj = ["bloody", "bleak", "dark", "clean", "dirty", "cozy", "heavenly", "hellish", "beautiful", "holy", "lovely", "empty"];
    const plc = ["plane","world","place"];
    const dsc = ["death", "despair", "hopelessness", "horror", "happiness", "joy", "bliss", "business", "love", "sin", "virtue", "hope", "corruption","struggle"];
    let word1 = adj[Math.floor(Math.random() * adj.length)];
    let word2 = plc[Math.floor(Math.random() * plc.length)];
    let word3 = dsc[Math.floor(Math.random() * dsc.length)];
    if (Math.ceil(Math.random() * 2) === 1) {
        let fullName = "The " + word2 + " of " + word3;
        return fullName;
    } else if (Math.ceil(Math.random() * 2) === 2){
        let fullName = "The " + word1 + " " + word2 + " of " + word3;
        return fullName;
    }
}

function SPF(world, startID, endID) {
    if (startID > 0 && endID > 0 && startID <= world.rooms.length && endID <= world.rooms.length) {
        let checking = [[startID]];
        let solved = [];
        while (checking.length > 0) {
            let newCheck = [];
            for (const path of checking) {
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
        console.error("Invalid parameter/s");
    }
}


function Dijkstra(world, startID, endID) {
    if (startID > 0 && endID > 0 && startID < world.rooms.length && endID < world.rooms.length) {
        let visited = [startID];
        let pathways = [];
        let paths = [];
        let checker = (arr, target) => target.every(Y => arr.includes(Y));
        for (let n = 0; n < world.rooms[0].exits.length;n++) {
            pathways.push([world.rooms[0].ID,world.rooms[0].exits[n]]);
        }
        for (let x = 1; x < world.rooms.length;x++) {
            // console.log("pathway");
            // console.log(pathways);
            let tempExits = world.rooms[x].exits;
            for (let y = 0; y < tempExits.length;y++) {
                let temp = [];
                temp.push(world.rooms[x].ID);
                temp.push(parseInt(tempExits[y]));
                // console.log("temp");
                // console.log(temp);
                let matching = false;
                for (let z = 0; z < pathways.length;z++) {
                    let tempy = checker(pathways[z],temp);
                    if (tempy != false) {
                        matching = true;
                    }
                }
                if (matching === false) {
                    pathways.push(temp);
                }
            }
        }
        for (path in pathways) {
            let temp;
            if (checker(pathways[path],[startID]) === true) {
                temp = pathways[path];
                console.log(temp.indexOf(startID));
                visited.push(temp[temp.indexOf(startID)-1]);
                paths.push([startID,temp[temp.indexOf(startID)-1]]);
                pathways.slice(pathways.indexOf(pathways[path]),1);
            }
        }
        console.log("Start");
        console.log(paths);
        let breaker = 0;
        let exitFound = false;
        while (paths.length > 0 && exitFound === false) {
            if (pathways.length == 0 || breaker == 10) {
                break;
            }
            for (currentPath in paths) {
                for (path in pathways) {
                    let temp;
                    let snippet = paths[currentPath].slice(-2);
                    console.log(snippet);
                    if (checker(snippet,pathways[path]) === false) {
                        console.log(temp);
                        temp = snippet.slice(snippet.indexOf(paths[-1]),1);
                        if (temp[0] == endID) {
                            paths[currentPath].push(temp[0]);
                            console.log(paths[currentPath]);
                            exitFound = false;
                            return paths[currentPath];
                        } else if (checker(visited,temp) === false) {
                            paths[currentPath].push(temp[0]);
                            console.log(paths[currentPath]);
                            visited.push(temp[0]);
                            console.log(visited);
                            pathways.slice(indexOf(pathways[path]),1);
                        }
                    }
                }
            }
            console.log(paths);
            breaker++;
        }
        console.log("End");
    }
    else {
        console.log("Invalid parameter/s");
    }
}