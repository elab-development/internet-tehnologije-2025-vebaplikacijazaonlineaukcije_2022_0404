<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\Bid;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    /**
     * GET /admin/stats
     * Admin-only: KPI + chart data
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Periodi
        $now = now();
        $last30Start = $now->copy()->subDays(29)->startOfDay(); // poslednjih 30 dana uključivo
        $last12Start = $now->copy()->subMonths(11)->startOfMonth(); // poslednjih 12 meseci uključivo

        // -----------------------
        // KPI
        // -----------------------
        $totalUsers = User::count();
        $totalBuyers = User::where('role', User::ROLE_BUYER)->count();
        $totalSellers = User::where('role', User::ROLE_SELLER)->count();

        $totalAuctions = Auction::count();
        $activeAuctions = Auction::where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->count();

        $scheduledAuctions = Auction::where('start_time', '>', $now)->count();
        $finishedAuctions = Auction::where('end_time', '<', $now)->count();

        $totalBids = Bid::count();
        $totalTransactions = Transaction::count();

        $revenueTotal = (float) (Transaction::sum('final_price') ?? 0);
        $avgFinalPrice = (float) (Transaction::avg('final_price') ?? 0);

        $avgBidsPerAuction = $totalAuctions > 0 ? round($totalBids / $totalAuctions, 2) : 0.0;

        // conversion rate: završene aukcije koje imaju transakciju / sve završene aukcije
        $finishedWithTransaction = Auction::where('end_time', '<', $now)
            ->whereHas('transaction')
            ->count();
        $conversionRate = $finishedAuctions > 0 ? round(($finishedWithTransaction / $finishedAuctions) * 100, 2) : 0.0;

        // -----------------------
        // Chart 1: bids per day (last 30 days)
        // -----------------------
        $bidsPerDayRaw = Bid::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as count')
            ->where('created_at', '>=', $last30Start)
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $bidsPerDay = [];
        for ($i = 0; $i < 30; $i++) {
            $day = $last30Start->copy()->addDays($i)->toDateString();
            $bidsPerDay[] = [
                'day' => $day,
                'count' => (int) ($bidsPerDayRaw[$day]->count ?? 0),
            ];
        }

        // -----------------------
        // Chart 2: transactions per month + revenue per month (last 12 months)
        // -----------------------
        $txMonthlyRaw = Transaction::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m-01') as month, COUNT(*) as tx_count, COALESCE(SUM(final_price),0) as revenue")
            ->where('created_at', '>=', $last12Start)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $transactionsPerMonth = [];
        for ($m = 0; $m < 12; $m++) {
            $month = $last12Start->copy()->addMonths($m)->format('Y-m-01');
            $transactionsPerMonth[] = [
                'month' => $month, // lako za frontend label
                'tx_count' => (int) ($txMonthlyRaw[$month]->tx_count ?? 0),
                'revenue' => (float) ($txMonthlyRaw[$month]->revenue ?? 0),
            ];
        }

        // -----------------------
        // Chart 3: top categories by auctions count
        // -----------------------
        $topCategories = Category::query()
            ->leftJoin('auctions', 'auctions.category_id', '=', 'categories.id')
            ->select('categories.id', 'categories.name', DB::raw('COUNT(auctions.id) as auctions_count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('auctions_count')
            ->limit(8)
            ->get()
            ->map(fn($r) => [
                'category_id' => (int) $r->id,
                'category' => $r->name,
                'auctions_count' => (int) $r->auctions_count,
            ]);

        // -----------------------
        // Chart 4: top sellers by auctions created
        // -----------------------
        $topSellers = User::query()
            ->where('role', User::ROLE_SELLER)
            ->leftJoin('auctions', 'auctions.user_id', '=', 'users.id')
            ->select('users.id', 'users.name', DB::raw('COUNT(auctions.id) as auctions_count'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('auctions_count')
            ->limit(8)
            ->get()
            ->map(fn($r) => [
                'seller_id' => (int) $r->id,
                'seller' => $r->name,
                'auctions_count' => (int) $r->auctions_count,
            ]);

        // -----------------------
        // Bonus chart: users registrations per month (last 12 months)
        // -----------------------
        $usersMonthlyRaw = User::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m-01') as month, COUNT(*) as count")
            ->where('created_at', '>=', $last12Start)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $usersPerMonth = [];
        for ($m = 0; $m < 12; $m++) {
            $month = $last12Start->copy()->addMonths($m)->format('Y-m-01');
            $usersPerMonth[] = [
                'month' => $month,
                'count' => (int) ($usersMonthlyRaw[$month]->count ?? 0),
            ];
        }

        return response()->json([
            'kpis' => [
                'users_total' => $totalUsers,
                'users_buyers' => $totalBuyers,
                'users_sellers' => $totalSellers,

                'auctions_total' => $totalAuctions,
                'auctions_active' => $activeAuctions,
                'auctions_scheduled' => $scheduledAuctions,
                'auctions_finished' => $finishedAuctions,

                'bids_total' => $totalBids,
                'transactions_total' => $totalTransactions,

                'revenue_total' => $revenueTotal,
                'avg_final_price' => round($avgFinalPrice, 2),

                'avg_bids_per_auction' => $avgBidsPerAuction,
                'finished_to_transaction_rate_percent' => $conversionRate,
            ],
            'charts' => [
                'bids_per_day_last_30' => $bidsPerDay,
                'transactions_per_month_last_12' => $transactionsPerMonth,
                'top_categories_by_auctions' => $topCategories,
                'top_sellers_by_auctions' => $topSellers,
                'users_per_month_last_12' => $usersPerMonth,
            ],
            'meta' => [
                'generated_at' => $now->toISOString(),
                'last_30_start' => $last30Start->toDateString(),
                'last_12_start' => $last12Start->toDateString(),
            ]
        ]);
    }
}
