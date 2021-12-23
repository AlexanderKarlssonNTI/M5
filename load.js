function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

let allWorlds = null;
loadingAllWorlds
    .then(function (data) {
        console.log(data);
        allWorlds = data.worlds;
        for (const world of data.worlds) {
            const createEntry = function (text) {
                const label = document.createElement('label');

                const span = document.createElement('span');
                span.textContent = text || 'No name';
                label.appendChild(span);

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
            document.getElementById('world-room-amount').appendChild(createEntry(world.roomActiveAmount));
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

function loadWorld() {
    if (selectedWorld >= 1) {
        window.location.href='view.html?id=' + selectedWorld;
    }
}

function deleteSelectedWorld(selectedWorld) {
    const onSuccess = function () {
        // remove selected world
        const elements = document.querySelectorAll(`[data-world-id="${selectedWorld}"]`);
        for (const element of elements) {
            element.parentElement.removeChild(element);
        }
    };
    if (offlineMode) {
        // Update list of worlds that are stored in local storage:
        let worldIds = JSON.parse(localStorage.getItem('pathOS_worlds') || '[]');
        worldIds = worldIds.filter(function (id) {
            return String(id) != String('pathOS_world-' + selectedWorld);
        });
        localStorage.setItem('pathOS_worlds', JSON.stringify(worldIds));

        // Remove the specified world:
        localStorage.removeItem('pathOS_world-' + selectedWorld);
        onSuccess();
        return;
    }
    fetch('http://localhost:8000/api/worlds/' + selectedWorld + "/delete", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: selectedWorld})
    })
    .then(function () {
        onSuccess();
    })
    .catch(function(error) {
        console.error('Failed to remove world:\n', error);
    })
};

function reshuffleName() {
    for (const world of allWorlds) {
        if (world.id != selectedWorld) {
            continue;
        }


        const previousRandomWorldName = world.name;
        let newName = previousRandomWorldName;
        while (previousRandomWorldName === newName) {
            newName = WorldBaptist();
        }
        world.name = newName;

        for (const label of document.querySelectorAll(`#world-name [data-world-id="${world.id}"] span`)) {
            label.textContent = newName;
        }


        if (offlineMode) {
            const previousData = JSON.parse(localStorage.getItem('pathOS_world-' + world.id));
            previousData.name = newName;
            localStorage.setItem('pathOS_world-' + world.id, JSON.stringify(previousData));
            return;
        }

        let xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
        xhr.open('put', 'http://localhost:8000/api/worlds/' + selectedWorld, true);
        xhr.send(JSON.stringify({
            world: {
                name: newName,
            },
        }));

        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    // Typical action to be performed when the document is ready:
                    console.log('OK');
                } else {
                    console.error('Backend failed:\n', xhr.responseText);
                }
            }
        };
    }
}