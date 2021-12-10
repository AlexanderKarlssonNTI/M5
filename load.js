
fetch('http://localhost:8000/api/load')
    .then(function (response) { return response.json(); })
    .then(function (data) {
        console.log(data);
        for (const world of data.worlds) {
            const createLabel = function(text) {
                const label = document.createElement('label');
                label.textContent = text;
                return label;
            }
            // TODO: Add links with id to the corresponding world, possibly in a layout where all fields of a world are contained in rows and instead adding borders between columns via an absolutly positioned element
            document.getElementById('world-name').appendChild(createLabel(world.name));
            // TODO: Change the world type data in some way to show it starting with a capital letter
            document.getElementById('world-type').appendChild(createLabel(world.type));
            document.getElementById('world-room-amount').appendChild(createLabel(world.roomTotalAmount));
        }
    })
    .catch(function (error) {
        console.error('Failed to get info from backend:\n', error);
    });
