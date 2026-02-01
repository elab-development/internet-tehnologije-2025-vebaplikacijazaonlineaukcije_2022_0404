<?php

namespace Database\Factories;

use App\Models\Auction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bid>
 */
class BidFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'user_id' => User::where('role', User::ROLE_BUYER)->inRandomOrder()->value('id')
                ?? User::factory()->create(['role' => User::ROLE_BUYER])->id,
            'auction_id' => Auction::inRandomOrder()->value('id')
                ?? Auction::factory()->create()->id,
        ];
    }
}
