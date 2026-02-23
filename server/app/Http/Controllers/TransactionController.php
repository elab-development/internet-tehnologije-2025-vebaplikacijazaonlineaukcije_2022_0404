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
    /**
     * @OA\Get(
     *   path="/transactions",
     *   tags={"Transactions"},
     *   summary="Lista transakcija (admin: sve, buyer: svoje)",
     *   security={{"sanctum":{}}},
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="count", type="integer"),
     *     @OA\Property(property="transactions", type="array", @OA\Items(type="object"))
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=404, description="No transactions", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
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

    /**
     * @OA\Get(
     *   path="/transactions/{id}",
     *   tags={"Transactions"},
     *   summary="Detalji transakcije (admin ili buyer-vlasnik)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(@OA\Property(property="transaction", type="object"))),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
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

    /**
     * @OA\Post(
     *   path="/transactions",
     *   tags={"Transactions"},
     *   summary="Kreiranje transakcije (buyer pobednik završene aukcije)",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"auction_id"},
     *       @OA\Property(property="auction_id", type="integer", example=10)
     *     )
     *   ),
     *   @OA\Response(response=201, description="Kreirano", @OA\JsonContent(
     *     @OA\Property(property="message", type="string", example="Transaction created successfully"),
     *     @OA\Property(property="transaction", type="object")
     *   )),
     *   @OA\Response(response=403, description="Forbidden (nije buyer / nije pobednik)", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=404, description="Auction not found", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=409, description="Već postoji transakcija", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Aukcija nije završena / nema bidova / validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
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
