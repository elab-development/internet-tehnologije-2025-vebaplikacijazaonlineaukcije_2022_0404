<?php

namespace Database\Seeders;

use App\Models\Auction;
use App\Models\Bid;
use App\Models\User;
use Illuminate\Database\Seeder;

class BidSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $auctions = Auction::all();

        foreach ($auctions as $auction) {
            $bids = [
                [
                    'amount' => $auction->start_price + 50.00,
                    'user_id' => User::where('role', User::ROLE_BUYER)->inRandomOrder()->value('id'),
                    'auction_id' => $auction->id,
                ],
                [
                    'amount' => $auction->start_price + 100.00,
                    'user_id' => User::where('role', User::ROLE_BUYER)->inRandomOrder()->value('id'),
                    'auction_id' => $auction->id,
                ],
                [
                    'amount' => $auction->start_price + 150.00,
                    'user_id' => User::where('role', User::ROLE_BUYER)->inRandomOrder()->value('id'),
                    'auction_id' => $auction->id,
                ],
            ];

            foreach ($bids as $bid) {
                $newBid = Bid::create($bid);

                if ($newBid->amount > $auction->highest_bid) {
                    $auction->highest_bid = $newBid->amount;
                    $auction->save();
                }
            }
        }
    }
}
