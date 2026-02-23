<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * @OA\Post(
     *   path="/register",
     *   tags={"Auth"},
     *   summary="Registracija korisnika (buyer/seller)",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"name","email","password"},
     *       @OA\Property(property="name", type="string", example="Petar Petrovic"),
     *       @OA\Property(property="email", type="string", format="email", example="petar@mail.com"),
     *       @OA\Property(property="password", type="string", example="password123"),
     *       @OA\Property(property="role", type="string", enum={"buyer","seller"}, example="buyer")
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Kreiran user + token",
     *     @OA\JsonContent(
     *       @OA\Property(property="data", type="object"),
     *       @OA\Property(property="access_token", type="string", example="1|abc..."),
     *       @OA\Property(property="token_type", type="string", example="Bearer")
     *     )
     *   ),
     *   @OA\Response(response=422, description="Validaciona greška", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'max:255', 'email', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['sometimes', 'string', Rule::in([User::ROLE_BUYER, User::ROLE_SELLER])],
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $role = $request->input('role', User::ROLE_BUYER);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    /**
     * @OA\Post(
     *   path="/login",
     *   tags={"Auth"},
     *   summary="Login (vraca bearer token)",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"email","password"},
     *       @OA\Property(property="email", type="string", format="email", example="admin@test.com"),
     *       @OA\Property(property="password", type="string", example="password123")
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Uspesan login",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Admin logged in"),
     *       @OA\Property(property="user", type="object"),
     *       @OA\Property(property="access_token", type="string", example="1|abc..."),
     *       @OA\Property(property="token_type", type="string", example="Bearer")
     *     )
     *   ),
     *   @OA\Response(response=401, description="Pogrešni kredencijali", @OA\JsonContent(ref="#/components/schemas/ErrorMessage")),
     *   @OA\Response(response=422, description="Validaciona greška", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Wrong credentials'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => $user->name . ' logged in',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    /**
     * @OA\Get(
     *   path="/me",
     *   tags={"Auth"},
     *   summary="Trenutno ulogovani korisnik",
     *   security={{"sanctum":{}}},
     *   @OA\Response(
     *     response=200,
     *     description="User info",
     *     @OA\JsonContent(@OA\Property(property="user", type="object"))
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user())
        ]);
    }

    /**
     * @OA\Post(
     *   path="/logout",
     *   tags={"Auth"},
     *   summary="Odjava (briše current token)",
     *   security={{"sanctum":{}}},
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(@OA\Property(property="message", type="string", example="You have successfully logged out."))
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated", @OA\JsonContent(ref="#/components/schemas/ErrorMessage"))
     * )
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'You have successfully logged out.'
        ]);
    }
}
