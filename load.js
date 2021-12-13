function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

loadingAllWorlds
    .then(function (data) {
        console.log(data);
        for (const world of data.worlds) {
            const createEntry = function (text) {
                const label = document.createElement('label');
                label.textContent = text || 'No name';
                label.setAttribute('data-world-id', world.id);

                const input = document.createElement('input');
                input.type = 'checkbox';
                const worldId = world.id;
                input.onchange = function () {
                    worldSelected(worldId);
                };
                label.appendChild(input);

                return label;
            }
            document.getElementById('world-name').appendChild(createEntry(world.name));
            document.getElementById('world-type').appendChild(createEntry(capitalizeFirstLetter(world.type)));
            document.getElementById('world-room-amount').appendChild(createEntry(world.roomTotalAmount));
        }
    })
    .catch(function (error) {
        console.error('Failed to get info from backend:\n', error);
    });

let selectedWorld = '';
function changeSelectedClass(world, shouldBeSelected) {
    let worldLabels = document.querySelectorAll(`[data-world-id="${world}"]`);
    for (let x = 0; x < worldLabels.length; x++) {
        worldLabels[x].classList.toggle("selected", shouldBeSelected);
    }
}
function worldSelected(world) {
    world = String(world);
    if (selectedWorld === '') {
        changeSelectedClass(world, true);
        selectedWorld = world;
    }
    else if (selectedWorld !== '' && selectedWorld !== world) {
        changeSelectedClass(selectedWorld, false);
        changeSelectedClass(world, true);
        selectedWorld = world;
    }
    else if (selectedWorld !== '' && selectedWorld === world) {
        changeSelectedClass(world, false);
        selectedWorld = '';
    }
    console.log(selectedWorld);
}

function deleteSelectedWorld(selectedWorld) {
    fetch('http://localhost:8000/api/worlds/' + selectedWorld + "/delete", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: selectedWorld})
    })
    .then(function() {
        // remove selected world
        const elements = document.querySelectorAll(`[data-world-id="${selectedWorld}"]`);
        for (const element of elements) {
            element.parentElement.removeChild(element);
        }
    })
    .catch(function(error) {
        console.error('Failed to remove world:\n', error);
    })
};