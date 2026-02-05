<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('auction_id')->constrained('auctions')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();

            $table->decimal('final_price', 10, 2);

            $table->timestamps();

            $table->unique('auction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
