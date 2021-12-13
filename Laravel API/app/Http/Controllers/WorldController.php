<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\World;
use App\Models\Room;
use App\Models\RoomExit;
use Illuminate\Support\Facades\DB;

class WorldController extends Controller
{
    public function store(Request $request)
    {
        $allContent = json_decode($request->getContent());
        $content = $allContent->world;

        $worldId = 0;
        DB::transaction(function() use ($content, $allContent, &$worldId) {
            // Create world
            $world = new World;
            $world->title = $content->name;
            $world->type = $allContent->type;
            $world->side_length = $content->sideLength;
            if (property_exists($allContent, 'roomBranchFactor')) {
                $world->room_branch_factor = $allContent->roomBranchFactor;
            }
            $world->room_row_amount = ceil(count($content->rooms) / $content->sideLength);
            $world->room_total_amount = count($content->rooms);
            $world->save();

            $worldId = $world->id;

            // Create rooms of world
            $roomLength = count($content->rooms);
            $roomIds = [];
            for ($i = 0; $i < $roomLength; $i++) {
                $room = new Room;
                $room->room_id = $content->rooms[$i]->ID;
                $room->title = $content->rooms[$i]->name;
                $room->enterable = $content->rooms[$i]->canEnter;
                $room->world_id = $worldId;
                $room->save();

                array_push($roomIds, $room->id);
            }

            // Create room exits
            for ($i = 0; $i < $roomLength; $i++) {
                foreach ($content->rooms[$i]->exits as $roomExit) {
                    $exits = new RoomExit;
                    $exits->room_id = $roomIds[$i];
                    // Get database id for the room at the exit index: 
                    $exits->has_exit_to_room_id = $roomIds[$roomExit - 1];
                    $exits->save();
                }
            }
        });

        return response()->json((object)['id' => $worldId]);
    }
    public function load()
    {
        $worlds = World::all();
        $worldInfo = [];
        
        foreach ($worlds as $world) {
            $info = (object)[];
            $info->id = $world->id;
            $info->name = $world->title;
            $info->type = $world->type;
            $info->sideLength = $world->side_length;
            $info->roomTotalAmount = $world->room_total_amount;
            array_push($worldInfo, $info);
        }

        return response()->json((object)['worlds' => $worldInfo]);
    }
    public function delete($worldId)
    {
        $world = World::findOrFail($worldId);
        $world->delete();
    }
    public function view($worldId)
    {
        $world = World::findOrFail($worldId);
        $content = (object)[];

        $content->name = $world->title;
        $content->type = $world->type;
        $content->sideLength = $world->side_length;
        $content->rooms = [];


        $rooms = Room::where('world_id', '=', $world->id)
            ->orderBy('room_id', 'asc')
            ->get();
        foreach ($rooms as $room) {
            $roomContent = (object)[];
            $roomContent->ID = $room->room_id;
            $roomContent->name = $room->title;
            $roomContent->canEnter = $room->enterable;


            $roomContent->exits = [];
            $exits = DB::table('exits')
                // Get exits for this room:
                ->where('exits.room_id', '=', $room->id)
                // Get more info about the rooms we have exits into:
                ->join('rooms', 'exits.has_exit_to_room_id', '=', 'rooms.id')
                // Only get the indexes of those rooms:
                ->select('rooms.room_id')
                ->get();
            foreach ($exits as $roomExit) {
                array_push($roomContent->exits, $roomExit->room_id);
            }
            array_push($content->rooms, $roomContent);
        }

        return response()->json($content);
    }
    public function edit(Request $request, $worldId)
    {
        $allContent = json_decode($request->getContent());
        $content = $allContent->world;

        $world = World::findOrFail($worldId);
    }
}
