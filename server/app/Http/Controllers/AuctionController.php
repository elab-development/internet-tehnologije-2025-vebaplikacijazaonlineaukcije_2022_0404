<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuctionResource;
use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AuctionController extends Controller
{
    /**
     * @OA\Get(
     *   path="/auctions",
     *   tags={"Auctions"},
     *   summary="Lista aukcija + filteri + paginacija (public)",
     *   @OA\Parameter(name="q", in="query", @OA\Schema(type="string")),
     *   @OA\Parameter(name="title", in="query", @OA\Schema(type="string")),
     *   @OA\Parameter(name="description", in="query", @OA\Schema(type="string")),
     *   @OA\Parameter(name="min_start_price", in="query", @OA\Schema(type="number")),
     *   @OA\Parameter(name="max_start_price", in="query", @OA\Schema(type="number")),
     *   @OA\Parameter(name="min_highest_bid", in="query", @OA\Schema(type="number")),
     *   @OA\Parameter(name="max_highest_bid", in="query", @OA\Schema(type="number")),
     *   @OA\Parameter(name="category_id", in="query", @OA\Schema(type="integer")),
     *   @OA\Parameter(name="user_id", in="query", @OA\Schema(type="integer")),
     *   @OA\Parameter(name="starts_before", in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Parameter(name="starts_after", in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Parameter(name="ends_before", in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Parameter(name="ends_after", in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Parameter(name="sort_by", in="query", @OA\Schema(type="string", example="created_at")),
     *   @OA\Parameter(name="sort_dir", in="query", @OA\Schema(type="string", enum={"asc","desc"}, example="desc")),
     *   @OA\Parameter(name="page", in="query", @OA\Schema(type="integer", example=1)),
     *   @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer", example=10)),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       @OA\Property(property="count", type="integer"),
     *       @OA\Property(property="page", type="integer"),
     *       @OA\Property(property="per_page", type="integer"),
     *       @OA\Property(property="auctions", type="array", @OA\Items(type="object"))
     *     )
     *   ),
     *   @OA\Response(response=404, description="No auctions", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['sometimes', 'string', 'max:255'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'min_start_price' => ['sometimes', 'numeric', 'min:0'],
            'max_start_price' => ['sometimes', 'numeric', 'min:0'],
            'min_highest_bid' => ['sometimes', 'numeric', 'min:0'],
            'max_highest_bid' => ['sometimes', 'numeric', 'min:0'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'starts_before' => ['sometimes', 'date'],
            'starts_after' => ['sometimes', 'date'],
            'ends_before' => ['sometimes', 'date'],
            'ends_after' => ['sometimes', 'date'],
            'sort_by' => ['sometimes', 'string'],
            'sort_dir' => ['sometimes', Rule::in(['asc', 'desc'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Auction::query();

        if (!empty($validated['q'])) {
            $q = $validated['q'];
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if (!empty($validated['title'])) {
            $query->where('title', 'like', '%' . $validated['title'] . '%');
        }
        if (!empty($validated['description'])) {
            $query->where('description', 'like', '%' . $validated['description'] . '%');
        }
        if (isset($validated['min_start_price'])) {
            $query->where('start_price', '>=', $validated['min_start_price']);
        }
        if (isset($validated['max_start_price'])) {
            $query->where('start_price', '<=', $validated['max_start_price']);
        }
        if (isset($validated['min_highest_bid'])) {
            $query->where('highest_bid', '>=', $validated['min_highest_bid']);
        }
        if (isset($validated['max_highest_bid'])) {
            $query->where('highest_bid', '<=', $validated['max_highest_bid']);
        }
        if (!empty($validated['category_id'])) {
            $query->where('category_id', $validated['category_id']);
        }
        if (!empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }
        if (!empty($validated['starts_before'])) {
            $query->where('start_time', '<=', $validated['starts_before']);
        }
        if (!empty($validated['starts_after'])) {
            $query->where('start_time', '>=', $validated['starts_after']);
        }
        if (!empty($validated['ends_before'])) {
            $query->where('end_time', '<=', $validated['ends_before']);
        }
        if (!empty($validated['ends_after'])) {
            $query->where('end_time', '>=', $validated['ends_after']);
        }

        $sortable = ['id', 'title', 'start_price', 'highest_bid', 'start_time', 'end_time', 'created_at'];
        $sortBy = in_array($request->get('sort_by'), $sortable, true) ? $request->get('sort_by') : 'created_at';
        $sortDir = $request->get('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->get('per_page', 10);
        $auctions = $query->paginate($perPage)->appends($request->query());

        if ($auctions->isEmpty()) {
            return response()->json(['message' => 'No auctions found!'], 404);
        }

        return response()->json([
            'count' => $auctions->total(),
            'page' => $auctions->currentPage(),
            'per_page' => $auctions->perPage(),
            'auctions' => AuctionResource::collection($auctions),
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
     *   path="/auctions",
     *   tags={"Auctions"},
     *   summary="Kreiranje aukcije (seller/admin)",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"title","start_price","start_time","end_time","category_id"},
     *       @OA\Property(property="title", type="string", example="iPhone 13"),
     *       @OA\Property(property="description", type="string", nullable=true, example="Polovan, odlican"),
     *       @OA\Property(property="start_price", type="number", example=100),
     *       @OA\Property(property="start_time", type="string", format="date-time", example="2026-02-20T10:00:00Z"),
     *       @OA\Property(property="end_time", type="string", format="date-time", example="2026-02-27T10:00:00Z"),
     *       @OA\Property(property="category_id", type="integer", example=1)
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="message", type="string"),
     *     @OA\Property(property="auction", type="object")
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = $request->user();
        if (!($user->isSeller() || $user->isAdmin())) {
            return response()->json(['error' => 'Only sellers can create auctions'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:auctions,title',
            'description' => 'nullable|string',
            'start_price' => 'required|numeric|min:0',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'category_id' => 'required|exists:categories,id',
        ]);

        $validated['user_id'] = $user->id;

        $auction = Auction::create($validated);

        return response()->json([
            'message' => 'Auction created successfully',
            'auction' => new AuctionResource($auction)
        ]);
    }


    /**
     * @OA\Get(
     *   path="/auctions/{id}",
     *   tags={"Auctions"},
     *   summary="Detalji aukcije (public)",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(@OA\Property(property="auction", type="object")))
     * )
     */
    public function show(Auction $auction)
    {
        return response()->json([
            'auction' => new AuctionResource($auction)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Auction $auction)
    {
        //
    }

    /**
     * @OA\Put(
     *   path="/auctions/{id}",
     *   tags={"Auctions"},
     *   summary="Update aukcije (admin ili owner seller)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       @OA\Property(property="title", type="string"),
     *       @OA\Property(property="description", type="string", nullable=true),
     *       @OA\Property(property="start_price", type="number"),
     *       @OA\Property(property="start_time", type="string", format="date-time"),
     *       @OA\Property(property="end_time", type="string", format="date-time"),
     *       @OA\Property(property="category_id", type="integer")
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="message", type="string"),
     *     @OA\Property(property="auction", type="object")
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function update(Request $request, Auction $auction)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = $request->user();

        $isOwner = $auction->user_id === $user->id;
        if (!($user->isAdmin() || ($user->isSeller() && $isOwner))) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('auctions', 'title')->ignore($auction->id),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'start_price' => ['sometimes', 'numeric', 'min:0'],
            'start_time' => ['sometimes', 'date'],
            'end_time' => ['sometimes', 'date', 'after:start_time'],
            'category_id' => ['sometimes', 'exists:categories,id'],
        ]);

        $auction->update($validated);

        return response()->json([
            'message' => 'Auction updated successfully',
            'auction' => new AuctionResource($auction)
        ]);
    }

    /**
     * @OA\Delete(
     *   path="/auctions/{id}",
     *   tags={"Auctions"},
     *   summary="Brisanje aukcije (admin ili owner seller)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(@OA\Property(property="message", type="string"))),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function destroy(Request $request, Auction $auction)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = $request->user();
        $isOwner = $auction->user_id === $user->id;

        if (!($user->isAdmin() || ($user->isSeller() && $isOwner))) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $auction->delete();

        return response()->json(['message' => 'Auction deleted successfully']);
    }
}
