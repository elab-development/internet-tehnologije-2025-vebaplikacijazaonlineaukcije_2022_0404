<?php

namespace App\Http\Controllers;

use App\Http\Resources\BidResource;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BidController extends Controller
{
    /**
     * @OA\Get(
     *   path="/bids",
     *   tags={"Bids"},
     *   summary="Lista bidova (admin: svi, buyer: samo njegovi)",
     *   security={{"sanctum":{}}},
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="count", type="integer"),
     *     @OA\Property(property="bids", type="array", @OA\Items(type="object"))
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=404, description="No bids", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function index()
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = Auth::user();
        $query = Bid::query();

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $bids = $query->get();

        if ($bids->isEmpty()) {
            return response()->json(['message' => 'No bids found!'], 404);
        }

        return response()->json([
            'count' => $bids->count(),
            'bids'  => BidResource::collection($bids),
        ]);
    }

    /**
     * @OA\Get(
     *   path="/auctions/{auctionId}/bids",
     *   tags={"Bids"},
     *   summary="Bidovi za konkretnu aukciju (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="auctionId", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="count", type="integer"),
     *     @OA\Property(property="bids", type="array", @OA\Items(type="object"))
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=404, description="No bids", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function auctionBids(Auction $auction)
    {
        if (!Auth::check() || !(Auth::user()->isAdmin())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $bids = $auction->bids()->get();

        if ($bids->isEmpty()) {
            return response()->json(['message' => 'No bids found for this auction!'], 404);
        }

        return response()->json([
            'count' => $bids->count(),
            'bids'  => BidResource::collection($bids),
        ]);
    }

    /**
     * @OA\Get(
     *   path="/users/{userId}/bids",
     *   tags={"Bids"},
     *   summary="Bidovi za konkretnog korisnika (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="userId", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="count", type="integer"),
     *     @OA\Property(property="bids", type="array", @OA\Items(type="object"))
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=404, description="No bids", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function userBids(User $user)
    {
        if (!Auth::check() || !(Auth::user()->isAdmin())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $bids = $user->bids()->get();

        if ($bids->isEmpty()) {
            return response()->json(['message' => 'No bids found for this user!'], 404);
        }

        return response()->json([
            'count' => $bids->count(),
            'bids'  => BidResource::collection($bids),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * @OA\Post(
     *   path="/bids",
     *   tags={"Bids"},
     *   summary="Postavljanje bida (buyer)",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"amount","auction_id"},
     *       @OA\Property(property="amount", type="number", example=150),
     *       @OA\Property(property="auction_id", type="integer", example=10)
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="message", type="string"),
     *     @OA\Property(property="bid", type="object")
     *   )),
     *   @OA\Response(response=403, description="Forbidden (nije buyer / bid na svoju aukciju)", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=404, description="Auction not found", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Validation / auction not active / bid too low", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = $request->user();
        if (!$user->isBuyer()) {
            return response()->json(['error' => 'Only buyers can place bids'], 403);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'auction_id' => ['required', 'exists:auctions,id'],
        ]);

        $auction = Auction::find($validated['auction_id']);
        if (!$auction) {
            return response()->json(['error' => 'Auction not found'], 404);
        }

        if (
            ($auction->start_time && now()->lt($auction->start_time)) ||
            ($auction->end_time && now()->gt($auction->end_time))
        ) {
            return response()->json(['error' => 'Auction is not active'], 422);
        }

        if ($auction->user_id === $user->id) {
            return response()->json(['error' => 'You cannot bid on your own auction'], 403);
        }

        $currentHighest = $auction->highest_bid ?? $auction->start_price;
        if ($validated['amount'] <= $currentHighest) {
            return response()->json(['error' => 'Bid must be higher than the current highest bid'], 422);
        }

        $validated['user_id'] = $user->id;

        $bid = Bid::create($validated);

        $highest = $auction->bids()->max('amount');
        $auction->update(['highest_bid' => $highest]);

        return response()->json([
            'message' => 'Bid created successfully',
            'bid' => new BidResource($bid),
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Bid $bid)
    {
        //
    }

    /**
     * @OA\Put(
     *   path="/bids/{id}",
     *   tags={"Bids"},
     *   summary="Update bida (owner ili admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(@OA\Property(property="amount", type="number", example=200))
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="message", type="string"),
     *     @OA\Property(property="bid", type="object")
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Bid too low / validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function update(Request $request, Bid $bid)
    {
        if (!Auth::check() || ($bid->user_id !== Auth::id() && !(Auth::user()->isAdmin()))) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'amount' => ['sometimes', 'numeric', 'min:0'],
        ]);

        if (!array_key_exists('amount', $validated)) {
            return response()->json([
                'message' => 'Nothing to update',
                'bid' => new BidResource($bid)
            ]);
        }

        $auction = $bid->auction;

        $otherHighest = $auction->bids()
            ->where('id', '!=', $bid->id)
            ->max('amount');

        $threshold = $otherHighest ?? $auction->start_price;

        if ($validated['amount'] <= $threshold) {
            return response()->json(['error' => 'Bid must be higher than the current highest bid'], 422);
        }

        $bid->update(['amount' => $validated['amount']]);

        $highest = $auction->bids()->max('amount');
        $auction->update(['highest_bid' => $highest]);

        return response()->json([
            'message' => 'Bid updated successfully',
            'bid' => new BidResource($bid)
        ]);
    }

    /**
     * @OA\Delete(
     *   path="/bids/{id}",
     *   tags={"Bids"},
     *   summary="Brisanje bida (owner ili admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(@OA\Property(property="message", type="string", example="Bid deleted successfully"))),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function destroy(Bid $bid)
    {
        if (!Auth::check() || ($bid->user_id !== Auth::id() && !(Auth::user()->isAdmin()))) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $auction = $bid->auction;

        $bid->delete();

        $highest = $auction->bids()->max('amount');
        $auction->update(['highest_bid' => $highest ?? $auction->start_price]);

        return response()->json(['message' => 'Bid deleted successfully']);
    }
}
