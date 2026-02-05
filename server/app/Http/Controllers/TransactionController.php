<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransactionResource;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    // GET /transactions
    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = $request->user();

        $q = Transaction::query()->with(['auction', 'buyer']);

        // admin vidi sve, buyer vidi svoje
        if (!$user->isAdmin()) {
            $q->where('buyer_id', $user->id);
        }

        $transactions = $q->latest()->get();

        if ($transactions->isEmpty()) {
            return response()->json(['message' => 'No transactions found!'], 404);
        }

        return response()->json([
            'count' => $transactions->count(),
            'transactions' => TransactionResource::collection($transactions),
        ]);
    }

    // GET /transactions/{transaction}
    public function show(Request $request, Transaction $transaction)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = $request->user();
        if (!$user->isAdmin() && $transaction->buyer_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $transaction->load(['auction', 'buyer']);

        return response()->json([
            'transaction' => new TransactionResource($transaction)
        ]);
    }

    // POST /transactions
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = $request->user();
        if (!$user->isBuyer()) {
            return response()->json(['error' => 'Only buyers can create transactions'], 403);
        }

        $validated = $request->validate([
            'auction_id' => ['required', 'exists:auctions,id'],
        ]);

        $auction = Auction::with('bids')->find($validated['auction_id']);
        if (!$auction) {
            return response()->json(['error' => 'Auction not found'], 404);
        }

        if (!$auction->end_time || now()->lte($auction->end_time)) {
            return response()->json(['error' => 'Auction is not finished yet'], 422);
        }

        if (Transaction::where('auction_id', $auction->id)->exists()) {
            return response()->json(['error' => 'Transaction already exists for this auction'], 409);
        }

        $maxAmount = Bid::where('auction_id', $auction->id)->max('amount');
        if ($maxAmount === null) {
            return response()->json(['error' => 'No bids for this auction'], 422);
        }

        $winningBid = Bid::where('auction_id', $auction->id)
            ->where('amount', $maxAmount)
            ->orderByDesc('created_at')
            ->first();

        if (!$winningBid) {
            return response()->json(['error' => 'Winning bid not found'], 422);
        }

        if ($winningBid->user_id !== $user->id) {
            return response()->json(['error' => 'You are not the winner of this auction'], 403);
        }

        $transaction = Transaction::create([
            'auction_id' => $auction->id,
            'buyer_id' => $user->id,
            'final_price' => $winningBid->amount,
        ]);

        $transaction->load(['auction', 'buyer']);

        return response()->json([
            'message' => 'Transaction created successfully',
            'transaction' => new TransactionResource($transaction),
        ], 201);
    }
}
