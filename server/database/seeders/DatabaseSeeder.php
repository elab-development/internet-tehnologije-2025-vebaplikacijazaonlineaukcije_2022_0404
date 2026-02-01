<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'admin',
            'email' => 'admin@mail.com',
            'password' => Hash::make('password'),
            'role' => \App\Models\User::ROLE_ADMIN,
        ]);

        User::factory(3)->create(['role' => \App\Models\User::ROLE_SELLER]);
        User::factory(5)->create(['role' => \App\Models\User::ROLE_BUYER]);

        $this->call([
            CategorySeeder::class,
            AuctionSeeder::class,
            BidSeeder::class,
        ]);
    }
}
