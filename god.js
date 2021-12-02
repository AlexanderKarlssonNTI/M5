class Room {
    constructor(id) {
        this.name = this.Baptist();
        this.ID = id;
    }

    Baptist() {
        const adj = ["bloody","bleak","dark","clean","dirty","cozy","heavenly","hellish","beautiful","neverending", "holy", "lovely","empty"];
        const plc = ["hallway","room","corridor","toilet","kitchen","basement","bedroom", "dining room","garden","chapel","dining hall","bathroom"];
        const dsc = ["death","despair","hopelessnes","healing","horror","happines","joy","bliss", "buisness","love","sin","sin","hope"];
        let word1 = adj[Math.floor(Math.random() * adj.length)];
        let word2 = plc[Math.floor(Math.random() * plc.length)];
        let word3 = dsc[Math.floor(Math.random() * dsc.length)];
        let fullName = "A "+word1+" "+word2+" of "+word3;
        return fullName;
    }
}

class World {
    constructor(Name, Type, parameter) {
        this.name = Name;
        this.type = Type;
        this.rooms = new Array;
        switch(Type) {
            case "circle":
                this.generateCircleWorld(parameter);
                break;
            case "rectangle":
                this.generateRectangleWorld(parameter);
                break;
            case "branch":
                this.generateBranchWorld(parameter);
                break;
            default:
                console.log();
        }
    }
    generateCircleWorld(nrOfRooms) {}

    generateRectangleWorld(nrOfRooms) {}

    generateBranchWorld(nrOfRooms) {}
}

let test = new Room(1);

console.log(test);