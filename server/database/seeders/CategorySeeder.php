<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'description' => 'Devices gadgets and tech products.'
            ],
            [
                'name' => 'Home Appliances',
                'description' => 'Appliances and tools for the home.'
            ],
            [
                'name' => 'Fashion',
                'description' => 'Clothing accessories and footwear.'
            ],
            [
                'name' => 'Books',
                'description' => 'Fiction non-fiction and educational materials.'
            ],
            [
                'name' => 'Vehicles',
                'description' => 'Cars bikes and other transportation.'
            ],
            [
                'name' => 'Art',
                'description' => 'Paintings sculptures and collectibles.'
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
