class Room {
    constructor(id) {
        this.name = this.Baptist();
        this.ID = id;
        this.exits = new Array;
        this.canEnter = true;
    }

    Baptist() {
        const adj = ["bloody","bleak","dark","clean","dirty","cozy","heavenly","hellish","beautiful","neverending", "holy", "lovely","empty"];
        const plc = ["hallway","room","corridor","toilet","kitchen","basement","bedroom", "dining room","garden","chapel","dining hall","bathroom"];
        const dsc = ["death","despair","hopelessnes","healing","horror","happines","joy","bliss", "buisness","love","sin","virtue","hope","corruption"];
        let word1 = adj[Math.floor(Math.random() * adj.length)];
        let word2 = plc[Math.floor(Math.random() * plc.length)];
        let word3 = dsc[Math.floor(Math.random() * dsc.length)];
        let fullName = "A "+word1+" "+word2+" of "+word3;
        return fullName;
    }
    
    hasExitTo(room) {
        if (room === null || room == undefined) return false;
        if (!this.canEnter || !room.canEnter) return false;
        return this.exits.includes(room.ID);
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
    constructor(Name, Type, parameter1, parameter2) {
        this.name = Name;
        this.type = Type;
        this.rooms = new Array;
        this.sideLength = new Number;
        switch(Type) {
            case "circle":
                this.generateCircleWorld(parameter1);
                break;
            case "rectangle":
                this.generateRectangleWorld(parameter1,parameter2);
                break;
            case "branch":
                this.generateBranchWorld(parameter1,parameter2);
                break;
            default:
                console.log("Error: Invalid inputs");
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
            for (let x = 1; x < nrOfRooms;x++) {
                this.rooms.push(new Room(x+1));
                this.rooms[x-1].exits.push(this.rooms[x].ID);
                this.rooms[x].exits.push(this.rooms[x-1].ID);
            }
            if (nrOfRooms != 2) {
                this.rooms[0].exits.push(nrOfRooms);
                this.rooms[nrOfRooms-1].exits.push(1);
            }
        }
    }

    generateRectangleWorld(length, width) {
        if (length == 1) {
            this.rooms.push(new Room(1));
            this.sideLength = 1;
        }
        else if (length > 1) {
            this.sideLength = length;
            this.rooms.push(new Room(1));
            for (let x = 1; x < length;x++) {
                this.rooms.push(new Room(x+1));
                this.rooms[x-1].exits.push(this.rooms[x].ID);
                this.rooms[x].exits.push(this.rooms[x-1].ID);
            }
            for (let y = 1; y < width; y++) {
                this.rooms.push(new Room(length*y+1));
                for (let x = 1; x < length;x++) {
                    this.rooms.push(new Room(length*y+x+1));
                    this.rooms[length*y+x-1].exits.push(this.rooms[length*y+x].ID);
                    this.rooms[length*y+x].exits.push(this.rooms[length*y+x-1].ID);
                }
                for (let x = 1; x <= length;x++) {
                    this.rooms[length*y+x-1].exits.push(this.rooms[length*(y-1)+x-1].ID);
                    this.rooms[length*(y-1)+x-1].exits.push(this.rooms[length*y+x-1].ID);
                }
            }
        }
    }

    generateBranchWorld(mainbranch,factor) {
        if (mainbranch == 1) {
            this.rooms.push(new Room(1));
            this.sideLength = mainbranch;
        }
        else if (mainbranch > 1 && Math.floor(mainbranch*factor) < 5) {
            this.sideLength = mainbranch;
            this.rooms.push(roomGenerator(1));
            for (let x = 1; x < mainbranch; x++) {
                this.rooms.push(roomGenerator(x+1));
                this.rooms[x-1].Exits.push(this.rooms[x].Id);
                this.rooms[x].Exits.push(this.rooms[x-1].Id);
            }
        }
        else if (Math.floor(mainbranch*factor) >= 5) {
            this.sideLength = mainbranch;
            this.rooms.push(new Room(1));
            for (let x = 1; x < mainbranch;x++) {
                this.rooms.push(new Room(x+1));
                this.rooms[x-1].exits.push(this.rooms[x].ID);
                this.rooms[x].exits.push(this.rooms[x-1].ID);
            }
            let childLength = Math.floor(mainbranch*factor);
            let mainLength = this.rooms.length;
            while (childLength > 5) {
                this.rooms.push(new Room(mainLength+1));
                for (let x = 1; x < childLength;x++) {
                    this.rooms.push(new Room(mainLength+x+1));
                    this.rooms[mainLength+x-1].exits.push(this.rooms[mainLength+x].ID);
                    this.rooms[mainLength+x].exits.push(this.rooms[mainLength+x-1].ID);
                }
                mainLength = this.rooms.length;
                childLength = Math.floor(childLength*factor);
            }
        }
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
