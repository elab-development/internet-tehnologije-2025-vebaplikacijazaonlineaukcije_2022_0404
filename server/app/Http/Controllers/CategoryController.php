<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * @OA\Get(
     *   path="/categories",
     *   tags={"Categories"},
     *   summary="Lista kategorija (public)",
     *   @OA\Response(
     *     response=200,
     *     description="Lista kategorija",
     *     @OA\JsonContent(
     *       @OA\Property(property="count", type="integer", example=3),
     *       @OA\Property(property="categories", type="array", @OA\Items(type="object"))
     *     )
     *   ),
     *   @OA\Response(response=404, description="Nema kategorija", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function index()
    {
        $categories = Category::all();

        if ($categories->isEmpty()) {
            return response()->json(['message' => 'No categories found!'], 404);
        }

        return response()->json([
            'count' => $categories->count(),
            'categories' => CategoryResource::collection($categories),
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
     *   path="/categories",
     *   tags={"Categories"},
     *   summary="Kreiranje kategorije (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"name"},
     *       @OA\Property(property="name", type="string", example="Electronics"),
     *       @OA\Property(property="description", type="string", nullable=true, example="Opis kategorije")
     *     )
     *   ),
     *   @OA\Response(response=200, description="Kreirano", @OA\JsonContent(
     *     @OA\Property(property="message", type="string", example="Category created successfully"),
     *     @OA\Property(property="category", type="object")
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function store(Request $request)
    {
        if (!Auth::check() || !(Auth::user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => new CategoryResource($category),
        ]);
    }

    /**
     * @OA\Get(
     *   path="/categories/{id}",
     *   tags={"Categories"},
     *   summary="Detalji kategorije (public)",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(@OA\Property(property="category", type="object")))
     * )
     */
    public function show(Category $category)
    {
        return response()->json([
            'category' => new CategoryResource($category)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * @OA\Put(
     *   path="/categories/{id}",
     *   tags={"Categories"},
     *   summary="Update kategorije (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       @OA\Property(property="name", type="string", example="Updated name"),
     *       @OA\Property(property="description", type="string", nullable=true, example="Updated desc")
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(
     *     @OA\Property(property="message", type="string"),
     *     @OA\Property(property="category", type="object")
     *   )),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function update(Request $request, Category $category)
    {
        if (!Auth::check() || !(Auth::user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category->id),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        if (empty($validated)) {
            return response()->json([
                'message' => 'Nothing to update',
                'category' => new CategoryResource($category),
            ]);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => new CategoryResource($category),
        ]);
    }

    /**
     * @OA\Delete(
     *   path="/categories/{id}",
     *   tags={"Categories"},
     *   summary="Brisanje kategorije (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(@OA\Property(property="message", type="string", example="Category deleted successfully"))),
     *   @OA\Response(response=403, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function destroy(Category $category)
    {
        if (!Auth::check() || !(Auth::user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
