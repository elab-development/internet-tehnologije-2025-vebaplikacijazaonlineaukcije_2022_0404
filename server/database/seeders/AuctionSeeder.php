<?php

namespace Database\Seeders;

use App\Models\Auction;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AuctionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $auctions = [
            [
                'title' => 'iPhone 16 Pro Max',
                'description' => 'Brand new sealed in box.',
                'start_price' => 999.99,
                'start_time' => now(),
                'end_time' => now()->addDays(7),
                'highest_bid' => 1099.99,
                'user_id' => User::where('role', User::ROLE_SELLER)->inRandomOrder()->value('id'),
                'category_id' => Category::where('name', 'Electronics')->first()->id,
            ],
            [
                'title' => 'Dyson Vacuum Cleaner',
                'description' => 'Powerful and lightweight perfect for all floors.',
                'start_price' => 299.99,
                'start_time' => now(),
                'end_time' => now()->addDays(5),
                'highest_bid' => 349.99,
                'user_id' => User::where('role', User::ROLE_SELLER)->inRandomOrder()->value('id'),
                'category_id' => Category::where('name', 'Home Appliances')->first()->id,
            ],
            [
                'title' => 'Designer Handbag',
                'description' => 'Authentic Gucci Marmont shoulder bag.',
                'start_price' => 1200.00,
                'start_time' => now(),
                'end_time' => now()->addDays(10),
                'highest_bid' => 1350.00,
                'user_id' => User::where('role', User::ROLE_SELLER)->inRandomOrder()->value('id'),
                'category_id' => Category::where('name', 'Fashion')->first()->id,
            ],
            [
                'title' => 'The Great Gatsby - First Edition',
                'description' => 'Rare first edition copy of F. Scott Fitzgerald’s classic novel.',
                'start_price' => 5000.00,
                'start_time' => now(),
                'end_time' => now()->addDays(14),
                'highest_bid' => 5500.00,
                'user_id' => User::where('role', User::ROLE_SELLER)->inRandomOrder()->value('id'),
                'category_id' => Category::where('name', 'Books')->first()->id,
            ],
            [
                'title' => 'Tesla Model 3',
                'description' => '2024 model, low mileage great condition.',
                'start_price' => 35000.00,
                'start_time' => now(),
                'end_time' => now()->addDays(30),
                'highest_bid' => 37500.00,
                'user_id' => User::where('role', User::ROLE_SELLER)->inRandomOrder()->value('id'),
                'category_id' => Category::where('name', 'Vehicles')->first()->id,
            ],
            [
                'title' => 'Abstract Oil Painting',
                'description' => 'Original art piece by renowned artist.',
                'start_price' => 750.00,
                'start_time' => now(),
                'end_time' => now()->addDays(12),
                'highest_bid' => 900.00,
                'user_id' => User::where('role', User::ROLE_SELLER)->inRandomOrder()->value('id'),
                'category_id' => Category::where('name', 'Art')->first()->id,
            ],
        ];

        foreach ($auctions as $auction) {
            Auction::create($auction);
        }
    }
}
