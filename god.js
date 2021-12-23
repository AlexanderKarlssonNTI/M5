class Room {
    constructor(id, name = null) {
        this.name = name || this.Baptist();
        this.ID = id;
        this.exits = new Array;
        this.canEnter = true;
    }

    Baptist() {
        const adj = ["bloody", "bleak", "dark", "clean", "dirty", "cozy", "heavenly", "hellish", "beautiful", "never-ending", "holy", "lovely", "empty","disgusting","questionable"];
        const plc = ["hallway", "room", "corridor", "toilet", "kitchen", "basement", "bedroom", "dining room", "garden", "chapel", "dining hall", "bathroom","dungeon","cinema","trench","street","skyscraper","building","home","bar","park","alley","junkyard","castle","beach","airport","bank"];
        const dsc = ["death", "despair", "hopelessness", "healing", "horror", "happiness", "joy", "bliss", "business", "love", "sin", "virtue", "hope", "corruption","helplessness"];
        let word1 = adj[Math.floor(Math.random() * adj.length)];
        let word2 = plc[Math.floor(Math.random() * plc.length)];
        let word3 = dsc[Math.floor(Math.random() * dsc.length)];
        if ((Math.random() * 3) >= 2) {
            let fullName = "The " + word2 + " of " + word3;
            return fullName;
        } else {
            let fullName = "The " + word1 + " " + word2 + " of " + word3;
            return fullName;
        }
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
                this.type = 'branch*';
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
        if (!room) return null;
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
        if (!room) return null;
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
        if (!room) return null;
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
        if (!room) return null;
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
        if (!room) return null;
        const id = room.ID - 1;
        if ((room.ID - 1) % this.sideLength == 0) {
            // First room
            return null;
        }
        return this.rooms[id - 1];
    }
    roomRightOf(room) {
        if (!room) return null;
        const id = room.ID + 1;
        if ((room.ID % this.sideLength) == 0) {
            // last room
            return null;
        }
        return this.rooms[id - 1];
    }
    roomAboveOf(room) {
        if (!room) return null;
        const id = room.ID - this.sideLength;
        if (id <= 0) {
            return null;
        }
        return this.rooms[id - 1];
    }
    roomBelowOf(room) {
        if (!room) return null;
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

        for (const exitId of room.exits) {
            room.disconnectFrom(this.getRoomById(exitId));
        }

        room.canEnter = false;
    }
    isWrappingNeighbors(roomA, roomB) {
        if (!roomA || !roomB) return false;
        return this.wrappingRoomLeftOf(roomA) === roomB ||
            this.wrappingRoomRightOf(roomA) === roomB ||
            this.wrappingRoomAboveOf(roomA) === roomB ||
            this.wrappingRoomBelowOf(roomA) === roomB;
    }
    isWrappingDiagonalNeighbors(roomA, roomB) {
        if (!roomA || !roomB) return false;

        const above = this.wrappingRoomAboveOf(roomA);
        const below = this.wrappingRoomBelowOf(roomA);
        return this.wrappingRoomLeftOf(above) === roomB ||
            this.wrappingRoomRightOf(above) === roomB ||
            this.wrappingRoomLeftOf(below) === roomB ||
            this.wrappingRoomRightOf(below) === roomB;
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
    const adj = ["bloody", "bleak", "dark", "heavenly", "hellish", "beautiful", "holy", "lovely", "empty", "happy", "apocalyptic", "dystopic", "utopic", "wacky", "stupid", "idiotic"];
    const plc = ["plane", "world", "place", "kingdom", "village", "city", "refuge", "camp"];
    const dsc = ["death", "despair", "hopelessness", "horror", "happiness", "joy", "bliss", "business", "love", "sin", "corruption", "struggle", "nostalgia", "isolation"];
    let word1 = adj[Math.floor(Math.random() * adj.length)];
    let word2 = plc[Math.floor(Math.random() * plc.length)];
    let word3 = dsc[Math.floor(Math.random() * dsc.length)];
    if ((Math.random() * 3) >= 2) {
        let fullName = "The " + word2 + " of " + word3;
        return fullName;
    } else /* if (Math.ceil(Math.random() * 2) === 2) */ {
        let fullName = "The " + word1 + " " + word2 + " of " + word3;
        return fullName;
    }
}

function* SPF(world, startID, endID, options = null) {
    if (!options) {
        options = {};
    }
    if (startID > 0 && endID > 0 && startID <= world.rooms.length && endID <= world.rooms.length) {
        let timeCounter = 0;
        let startTime = Date.now();

        /// Stores the length of the shortest path to a room (shortestPathToRoomYet[roomId - 1] === shortestPathToRoomLength):
        const shortestPathToRoomYet = options.trackShortestPaths ? new Array(world.rooms.length).fill(null) : null;
        const checking = [[startID]];
        while (checking.length > 0) {
            // Process a path:
            const path = checking.shift();

            // Consider the exits of the path's last room, that is to say where
            // the path could continue:
            const lastRoomId = path[path.length - 1];
            const lastRoom = world.rooms[lastRoomId - 1];
            const exits = lastRoom.exits;
            for (let i = 0; i < exits.length; i++) {
                const exit = exits[i];
                if (exit == endID) {
                    // Found a path to the exit:
                    const temp = (i + 1 === exits.length) ? path : path.slice();
                    temp.push(exit);
                    yield temp;
                    continue;
                }
                if (shortestPathToRoomYet && shortestPathToRoomYet[exit - 1] !== null && shortestPathToRoomYet[exit - 1] <= path.length) {
                    // We have already found a path that gets us to this room in
                    // the same number of steps or fewer, so this path won't
                    // shorten the distance to the exit:
                    if (options.yieldPartialPaths) {
                        const temp = (i + 1 === exits.length) ? path : path.slice();
                        temp.push(exit);
                        yield temp;
                    }
                    continue;
                }
                if (path.includes(exit)) {
                    // This path already goes through this room so going back
                    // into it would just mean we went somewhere else for no reason,
                    // therefore we don't need to consider such a path:
                    if (options.yieldPartialPaths) {
                        const temp = (i + 1 === exits.length) ? path : path.slice();
                        temp.push(exit);
                        yield temp;
                    }
                    continue;
                }
                // A path through this room might lead to the exit, consider it later:

                if (shortestPathToRoomYet) {
                    shortestPathToRoomYet[exit - 1] = path.length;
                }

                // Optimization: only make a copy of path if there are actually more exits that need it:
                const temp = (i + 1 === exits.length) ? path : path.slice();

                temp.push(exit);
                checking.push(temp);
            }

            // Make sure we don't get stuck doing too much work:
            if (options.maxProcessTime !== undefined && ++timeCounter > options.roomsToScanBeforeCheckingTime) {
                timeCounter = 0;
                if ((Date.now() - startTime) > options.maxProcessTime) {
                    yield 'longTime';
                    startTime = Date.now();
                }
            }
        }
    }
    else {
        console.error("Invalid parameter/s");
    }
}

function DijkstraAlternative(world, startID, endID, options = null) {
    // Inspired by pseudo-code from wikipedia:
    // https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Pseudocode

    if (!options || typeof options !== 'object') {
        options = {};
    }

    if (startID <= 0 && endID <= 0 && startID > world.rooms.length && endID > world.rooms.length) {
        console.error("Invalid parameter/s");
        return null;
    }

    // Full distance when following shortest path to a room (distance[roomId - 1] === shortestDistanceToRoom):
    const distance = new Array(world.rooms.length).fill(null);
    // The room you come from when following the shortest path to a room (previous[roomId - 1] === neighborIdThatLeadsTowardsStart):
    const previous = new Array(world.rooms.length).fill(null);

    // Minimum total path length (from start to finish) if that path goes through a specific room (minTotalDistance[roomId - 1] === minimumLengthOfShortestPath):
    const minTotalDistance = options.aStar ? new Array(world.rooms.length).fill(null) : null;

    if (options.aStar) {
        minTotalDistance[startID - 1] = options.aStarDistanceToEndFrom(startID);
    }
    distance[startID - 1] = 0;
    // Anything in queue must have a distance (and preferably the ones closer to the start should have smaller distances)
    let queue = [startID];

    let trackedQueue = [];
    if (options.trackQueue) {
        trackedQueue.push(startID);
    }


    while (queue.length > 0) {
        // We ensure that the first element in queue has the lowest distance (of all unvisited rooms)
        const currentId = queue.shift();
        const currentRoom = world.rooms[currentId - 1];
        const currentDistance = distance[currentId - 1];

        for (const neighborId of currentRoom.exits) {
            // Could use some other distance between neighbors (instead of 1):
            const fullPathToNeighborDistance = currentDistance + 1;
            const shortestDistanceToNeighborSoFar = distance[neighborId - 1];

            if (shortestDistanceToNeighborSoFar === null || fullPathToNeighborDistance < shortestDistanceToNeighborSoFar) {
                // Ignore blocked rooms:
                if (!world.rooms[neighborId - 1].canEnter) continue;

                distance[neighborId - 1] = fullPathToNeighborDistance;
                previous[neighborId - 1] = currentId;

                // Add `neighborId` to queue in a way so that the queue remains sorted.
                // When using A * it should be sorted based on `minTotalDistance`
                // and when using Dijkstra it should be sorted based on `distance`
                let addLast = true;
                if (options.aStar) {
                    // Calculate and store the minimum total distance for paths
                    // that go through the neighbor room:
                    const neighborMinTotalDistance = fullPathToNeighborDistance + options.aStarDistanceToEndFrom(neighborId);
                    minTotalDistance[neighborId - 1] = neighborMinTotalDistance;

                    // Since we should search closer and closer to the exit we
                    // should hopefully be able to insert new search positions
                    // early in the queue. (so not that bad idea to start with
                    // low index and search towards higher instead of doing the
                    // opposite)
                    for (let i = 0; i < queue.length; i++) {
                        if (minTotalDistance[queue[i] - 1] > neighborMinTotalDistance) {
                            // Insert before this element (since it is larger then the one we want to insert):
                            if (options.trackQueue) {
                                trackedQueue.splice(trackedQueue.length - queue.length + i, 0, neighborId);
                            }
                            queue.splice(i, 0, neighborId);
                            addLast = false;
                            break;
                        }
                    }
                } else {
                    // Since neighbors are always 1 unit apart and we visit neighbors
                    // of the earlier rooms first we know that every previous room in
                    // the queue has a shorter distance then this newly added room
                    // so we can add it last.
                    //
                    // We will basically scan all rooms with distance `x` and only
                    // add new rooms with to distance `x + 1` to the queue. Then
                    // after all rooms with distance `x` has been scanned we continue
                    // scanning all rooms with distance `x + 1` in the same way
                    // while only adding rooms with distance `x + 2`.
                    //
                    // If the distance between rooms isn't always 1 then we could
                    // not just add it last in the queue (for example first neighbor
                    // of startID could have a diagonal path that is longer and then
                    // when we add non-diagonal path for another neighbor of startID
                    // it would have a shorter distance then that diagonal room and
                    // so would need to be inserted before it in the queue).
                }
                if (addLast) {
                    queue.push(neighborId);
                    if (options.trackQueue) {
                        trackedQueue.push(neighborId);
                    }
                }

                if (neighborId === endID && !options.continueAfterFindingEnd) {
                    // Found a path to the exit (also since we always visit rooms using the shortest path
                    // first we won't find a shorter path than this):
                    queue = [];
                    break;
                }
            }
        }
    }


    // Use our "path map" to find the shortest path to the exit:

    if (distance[endID - 1] === null) {
        // No path to exit:
        return null;
    }

    let pathToExit = [];
    let currentRoomId = endID;
    while (currentRoomId !== startID) {
        pathToExit.unshift(currentRoomId);
        // Get the room that you come from when following the shortest path to the current room:
        currentRoomId = previous[currentRoomId - 1];
    }
    pathToExit.unshift(startID);

    return {
        pathToExit,
        previous,
        distance,
        trackedQueue,
    };
}

function Dijkstra(world, startID, endID) {
    if (startID > 0 && endID > 0 && startID <= world.rooms.length && endID <= world.rooms.length) {
        let visited = [startID];
        let pathways = [];
        let paths = [];
        // Everything in target must also be in arr
        let checker = (arr, target) => target.every(Y => arr.includes(Y));
        for (let n = 0; n < world.rooms[0].exits.length; n++) {
            pathways.push([world.rooms[0].ID, world.rooms[0].exits[n]]);
        }
        for (let x = 1; x < world.rooms.length; x++) {
            // console.log("pathway");
            // console.log(pathways);
            let tempExits = world.rooms[x].exits;
            for (let y = 0; y < tempExits.length; y++) {
                let temp = [];
                temp.push(world.rooms[x].ID);
                temp.push(parseInt(tempExits[y]));
                // console.log("temp");
                // console.log(temp);
                let matching = false;
                for (let z = 0; z < pathways.length; z++) {
                    let tempy = checker(pathways[z], temp);
                    if (tempy != false) {
                        matching = true;
                    }
                }
                if (matching === false) {
                    pathways.push(temp);
                }
            }
        }
        for (let path in pathways) {
            let temp;
            if (checker(pathways[path], [startID]) === true) {
                temp = pathways[path];
                console.log(temp.indexOf(startID));
                visited.push(temp[temp.indexOf(startID) - 1]);
                paths.push([startID, temp[temp.indexOf(startID) - 1]]);
                pathways.slice(pathways.indexOf(pathways[path]), 1);
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
                    if (checker(snippet, pathways[path]) === false) {
                        console.log(temp);
                        temp = snippet.slice(snippet.indexOf(paths[-1]), 1);
                        if (temp[0] == endID) {
                            paths[currentPath].push(temp[0]);
                            console.log(paths[currentPath]);
                            exitFound = false;
                            return paths[currentPath];
                        } else if (checker(visited, temp) === false) {
                            paths[currentPath].push(temp[0]);
                            console.log(paths[currentPath]);
                            visited.push(temp[0]);
                            console.log(visited);
                            pathways.slice(indexOf(pathways[path]), 1);
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