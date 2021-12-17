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
        DB::transaction(function () use ($content, $allContent, &$worldId) {
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
            // Use default value (we store the correct one later):
            $world->room_active_amount = count($content->rooms);
            $world->save();

            $worldId = $world->id;

            // Create rooms of world
            $activeRoomsCount = 0;
            $roomLength = count($content->rooms);
            $roomIds = [];
            for ($i = 0; $i < $roomLength; $i++) {
                $room = new Room;
                $room->room_id = $content->rooms[$i]->ID;
                $room->title = $content->rooms[$i]->name;
                $room->enterable = $content->rooms[$i]->canEnter;
                $room->world_id = $worldId;
                $room->save();

                if ($room->enterable) {
                    $activeRoomsCount++;
                }

                array_push($roomIds, $room->id);
            }

            // Store active room count:
            $world->room_active_amount = $activeRoomsCount;
            $world->save();

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
        $worlds = World::orderBy('created_at', 'desc')->get();
        $worldInfo = [];

        foreach ($worlds as $world) {
            $info = (object)[];
            $info->id = $world->id;
            $info->name = $world->title;
            $info->type = $world->type;
            $info->sideLength = $world->side_length;
            $info->roomTotalAmount = $world->room_total_amount;
            $info->roomActiveAmount = $world->room_active_amount;
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

        // Get info about world:
        $content->name = $world->title;
        $content->type = $world->type;
        $content->sideLength = $world->side_length;
        $content->rooms = [];


        // Get info about rooms (not their exits though):
        $rooms = Room::where('world_id', '=', $world->id)
            ->orderBy('room_id', 'asc')
            ->get();
        foreach ($rooms as $room) {
            $roomContent = (object)[];
            $roomContent->ID = $room->room_id;
            $roomContent->name = $room->title;
            $roomContent->canEnter = $room->enterable;


            $roomContent->exits = [];
            array_push($content->rooms, $roomContent);
        }

        // Get info about room exits from DB:
        $exit_infos = DB::table('rooms')
            // Get rooms for this world
            ->where('rooms.world_id', '=', $world->id)
            // With their exits:
            ->join('exits', 'rooms.id', '=', 'exits.room_id')
            // And more info about the exit rooms:
            ->join('rooms as exit_rooms', 'exits.has_exit_to_room_id', '=', 'exit_rooms.id')
            // Use room indexes as sorting order:
            ->orderBy('rooms.room_id', 'asc')
            // Name the info we want:
            ->select('exit_rooms.room_id as exit_room_id', 'rooms.room_id as room_id')
            ->get();

        // Store each rooms exits:
        foreach ($exit_infos as $exit_info) {
            array_push($content->rooms[$exit_info->room_id - 1]->exits, $exit_info->exit_room_id);
        }

        return response()->json($content);
    }
    public function edit(Request $request, $worldId)
    {
        $allContent = json_decode($request->getContent());
        $content = $allContent->world;

        $world = World::findOrFail($worldId);

        DB::transaction(function () use ($world, $content) {
            $world->title = $content->name;

            if (property_exists($content, 'rooms')) {
                $activeRoomsCount = 0;

                // Save room changes (not exits though)
                $roomLength = count($content->rooms);
                $rooms = Room::where('world_id', '=', $world->id)->orderBy('room_id', 'asc')->get();
                for ($i = 0; $i < $roomLength; $i++) {
                    $rooms[$i]->enterable = $content->rooms[$i]->canEnter;
                    $rooms[$i]->title = $content->rooms[$i]->name;
                    $rooms[$i]->save();
                    if ($rooms[$i]->enterable) {
                        $activeRoomsCount++;
                    }
                }

                // Update world:
                $world->room_active_amount = $activeRoomsCount;

                // Get info about room exits from DB:
                $exit_infos = DB::table('rooms')
                    // Get rooms for this world
                    ->where('rooms.world_id', '=', $world->id)
                    // With their exits:
                    ->join('exits', 'rooms.id', '=', 'exits.room_id')
                    // And more info about the exit rooms:
                    ->join('rooms as exit_rooms', 'exits.has_exit_to_room_id', '=', 'exit_rooms.id')
                    // Use room indexes as sorting order:
                    ->orderBy('rooms.room_id', 'asc')
                    // Name the info we want:
                    ->select('exits.id as exit_id', 'exit_rooms.room_id as exit_room_id', 'rooms.room_id as room_index')
                    ->get();

                // Compare db rooms with content rooms:
                foreach ($exit_infos as $exit_info) {
                    $exit_exists = false;

                    $exits_for_room = $content->rooms[$exit_info->room_index - 1]->exits;
                    for ($i = 0; $i < count($exits_for_room); $i++) {
                        if ($exits_for_room[$i] == $exit_info->exit_room_id) {
                            $exit_exists = true;
                            array_splice($exits_for_room, $i, 1);
                            break;
                        }
                    }
                    $content->rooms[$exit_info->room_index - 1]->exits = $exits_for_room;

                    if (!$exit_exists) {
                        RoomExit::find($exit_info->exit_id)->delete();
                    }
                }
                // Add any exits that didn't previously exist:
                for ($room_index = 0; $room_index < count($content->rooms); $room_index++) {
                    foreach ($content->rooms[$room_index]->exits as $exit_id) {
                        // new exit (didn't alreay exist in database (since we removed them from content)):
                        $new_exit = new RoomExit();
                        $new_exit->room_id = $rooms[$room_index]->id;
                        $new_exit->has_exit_to_room_id = $rooms[$exit_id - 1]->id;
                        $new_exit->save();
                    }
                }
            }
            $world->save();
        });
    }
}
