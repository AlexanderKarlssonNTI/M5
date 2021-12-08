<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WorldController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $worldId)
    {
        // Create world
        $world = new World;
        $world->title = $request->input('title');
        $world->type = $request->input('type');
        $world->roomBranchFactor = $request->input('room_branch_factor');
        $world->roomRowAmount = $request->input('room_row_amount');
        $world->roomTotalAmount = $request->input('room_total_amount');
        $world->save();

        // Create rooms of world
        $room = new Room;
        $room->title = $request->input('title');
        $room->exits = $request->input('exits');
        $room->enterable = $request->input('enterable');
        $room->world_id = $worldId;
        $room->save();

        // Create room exits
        $exits = new Exit;
        $exits->room_id = $roomId;
        $exits->has_exit_to_room_id = $hasExitToRoomId;
        $exits->save();

        return redirect('/view?{$roomID}');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return redirect("/view/{$roomID}");
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
