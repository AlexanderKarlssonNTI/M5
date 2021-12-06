class Room {
    constructor(id) {
        this.name = this.Baptist();
        this.ID = id;
        this.exits = new Array;
    }

    Baptist() {
        const adj = ["bloody","bleak","dark","clean","dirty","cozy","heavenly","hellish","beautiful","neverending", "holy", "lovely","empty"];
        const plc = ["hallway","room","corridor","toilet","kitchen","basement","bedroom", "dining room","garden","chapel","dining hall","bathroom"];
        const dsc = ["death","despair","hopelessnes","healing","horror","happines","joy","bliss", "buisness","love","sin","virtue","hope"];
        let word1 = adj[Math.floor(Math.random() * adj.length)];
        let word2 = plc[Math.floor(Math.random() * plc.length)];
        let word3 = dsc[Math.floor(Math.random() * dsc.length)];
        let fullName = "A "+word1+" "+word2+" of "+word3;
        return fullName;
    }
}

class World {
    constructor(Name, Type, parameter1, parameter2) {
        this.name = Name;
        this.type = Type;
        this.rooms = new Array;
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
        }
        else if (nrOfRooms > 1) {
            this.rooms.push(new Room(1));
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
        }
        else if (length > 1) {
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
        }
        else if (mainbranch > 1 && Math.floor(mainbranch*factor) < 5) {
            this.rooms.push(roomGenerator(1));
            for (let x = 1; x < mainbranch; x++) {
                this.rooms.push(roomGenerator(x+1));
                this.rooms[x-1].Exits.push(this.rooms[x].Id);
                this.rooms[x].Exits.push(this.rooms[x-1].Id);
            }
        }
        else if (Math.floor(mainbranch*factor) >= 5) {
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
}
