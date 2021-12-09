<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\World;

class WorldController extends Controller
{
    public function store(Request $request)
    {
        $content = $request->json()->all();
        var_dump($content);

        // Create world
        $world = new World;
        $world->title = $request->input('title');
        $world->type = $request->input('type');
        $world->roomBranchFactor = $request->input('room_branch_factor');
        $world->roomRowAmount = $request->input('room_row_amount');
        $world->roomTotalAmount = $request->input('room_total_amount');
        $world->save();

        // Create rooms of world
        for ($i = 1; $i <= $roomTotalAmount; $i++) {
            $room = new Room;
            $room->title = $request->input('title');
            $room->exits = $request->input('exits');
            $room->enterable = $request->input('enterable');
            $room->world_id = $worldId;
            $room->save();

            // Create room exits
            $exits = new RoomExit;
            $exits->room_id = $roomId;
            $exits->has_exit_to_room_id = $hasExitToRoomId;
            $exits->save();
        }

        return response()->json((object)['id' => $world->id]);
    }
}
