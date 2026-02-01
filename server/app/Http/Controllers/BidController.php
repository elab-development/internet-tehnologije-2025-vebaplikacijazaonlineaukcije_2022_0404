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
     * Display a listing of the resource.
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

    public function auctionBids(Auction $auction)
    {
        if (!Auth::check() || !(Auth::user()->isAdmin() ?? false)) {
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

    public function userBids(User $user)
    {
        if (!Auth::check() || !(Auth::user()->isAdmin() ?? false)) {
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
     * Store a newly created resource in storage.
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, Bid $bid)
    {
        if (!Auth::check() || ($bid->user_id !== Auth::id() && !(Auth::user()->isAdmin() ?? false))) {
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
     * Remove the specified resource from storage.
     */
    public function destroy(Bid $bid)
    {
        if (!Auth::check() || ($bid->user_id !== Auth::id() && !(Auth::user()->isAdmin() ?? false))) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $auction = $bid->auction;

        $bid->delete();

        $highest = $auction->bids()->max('amount');
        $auction->update(['highest_bid' => $highest ?? $auction->start_price]);

        return response()->json(['message' => 'Bid deleted successfully']);
    }
}
