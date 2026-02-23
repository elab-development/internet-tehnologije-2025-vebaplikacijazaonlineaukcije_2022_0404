<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *   title="Auction API",
 *   version="1.0.0",
 *   description="REST API za aukcijsku aplikaciju (Laravel + Sanctum)."
 * )
 *
 * @OA\Server(
 *   url="/api",
 *   description="API base"
 * )
 *
 * @OA\Tag(name="Auth", description="Registracija, login, me, logout")
 * @OA\Tag(name="Categories", description="CRUD nad kategorijama")
 * @OA\Tag(name="Auctions", description="Pretraga, pregled i CRUD nad aukcijama")
 * @OA\Tag(name="Bids", description="Bidovi (buyer), pregled (admin/buyer)")
 * @OA\Tag(name="Transactions", description="Transakcije (buyer/admin)")
 * @OA\Tag(name="Admin", description="Admin KPI & chart podaci")
 *
 * @OA\SecurityScheme(
 *   securityScheme="sanctum",
 *   type="http",
 *   scheme="bearer",
 *   bearerFormat="Token",
 *   description="Uneti token dobijen sa /login ili /register. Format: Bearer {token}"
 * )
 *
 * @OA\Schema(
 *   schema="ErrorMessage",
 *   type="object",
 *   @OA\Property(property="message", type="string", example="Unauthorized")
 * )
 *
 * @OA\Schema(
 *   schema="ValidationError",
 *   type="object",
 *   additionalProperties=true,
 *   example={"email":{"The email field is required."}}
 * )
 */
class ApiDoc extends Controller {}
