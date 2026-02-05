<?php

use App\Http\Controllers\AuctionController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::get('/auctions', [AuctionController::class, 'index']);
Route::get('/auctions/{auction}', [AuctionController::class, 'show']);

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::resource('categories', CategoryController::class)
        ->only(['store', 'update', 'destroy']);
    Route::resource('auctions', AuctionController::class)
        ->only(['store', 'update', 'destroy']);

    Route::resource('bids', BidController::class)
        ->only(['index', 'show', 'store', 'update', 'destroy']);
    Route::get('/auctions/{auction}/bids', [BidController::class, 'auctionBids']);
    Route::get('/users/{user}/bids', [BidController::class, 'userBids']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::post('/transactions', [TransactionController::class, 'store']);

    Route::get('/me', [UserController::class, 'me']);
    Route::post('/logout', [UserController::class, 'logout']);
});
