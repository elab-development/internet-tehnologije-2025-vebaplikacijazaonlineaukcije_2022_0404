<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'final_price' => $this->final_price,

            'auction' => $this->whenLoaded('auction', function () {
                return [
                    'id' => $this->auction->id,
                    'title' => $this->auction->title,
                    'end_time' => $this->auction->end_time,
                    'highest_bid' => $this->auction->highest_bid,
                ];
            }),

            'buyer' => $this->whenLoaded('buyer', function () {
                return [
                    'id' => $this->buyer->id,
                    'name' => $this->buyer->name,
                    'email' => $this->buyer->email,
                ];
            }),

            'created_at' => $this->created_at,
        ];
    }
}
