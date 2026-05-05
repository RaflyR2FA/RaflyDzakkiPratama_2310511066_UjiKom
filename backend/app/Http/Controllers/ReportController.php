<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Borrow;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboard()
    {
        $totalItems        = Item::count();
        $availableItems    = Item::where('available_quantity', '>', 0)
                                 ->where('condition', '!=', 'damaged')->count();
        $damagedItems      = Item::where('condition', 'damaged')->count();
        $totalBorrows      = Borrow::count();
        $activeBorrows     = Borrow::where('status', 'accepted')->count();
        $waitingBorrows    = Borrow::where('status', 'waiting')->count();
        $returnedBorrows   = Borrow::where('status', 'returned')->count();
        $totalUsers        = User::count();

        $borrowsPerMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $borrowsPerMonth[] = [
                'month'    => $month->format('M Y'),
                'total'    => Borrow::whereYear('borrow_date', $month->year)
                                    ->whereMonth('borrow_date', $month->month)
                                    ->count(),
                'returned' => Borrow::whereYear('borrow_date', $month->year)
                                    ->whereMonth('borrow_date', $month->month)
                                    ->where('status', 'returned')
                                    ->count(),
            ];
        }

        $popularItems = Item::withCount([
            'borrows as total_borrowed' => fn($q) =>
                $q->whereIn('status', ['accepted', 'returned'])
        ])
        ->orderByDesc('total_borrowed')
        ->limit(5)
        ->get(['id', 'item_code', 'item_name', 'category', 'total_borrowed']);

        $categoryDistribution = Item::selectRaw(
            'category, COUNT(*) as count, SUM(total_quantity) as total_units'
        )->groupBy('category')->get();

        return response()->json([
            'stats' => [
                'total_items'     => $totalItems,
                'available_items' => $availableItems,
                'damaged_items'   => $damagedItems,
                'total_borrows'   => $totalBorrows,
                'active_borrows'  => $activeBorrows,
                'waiting_borrows' => $waitingBorrows,
                'returned_borrows'=> $returnedBorrows,
                'total_users'     => $totalUsers,
            ],
            'borrows_per_month'    => $borrowsPerMonth,
            'popular_items'        => $popularItems,
            'category_distribution'=> $categoryDistribution,
        ]);
    }

    public function summary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $borrows = Borrow::with(['user', 'item'])
            ->whereBetween('borrow_date', [$request->start_date, $request->end_date])
            ->get();

        return response()->json([
            'period' => [
                'from' => $request->start_date,
                'to'   => $request->end_date,
            ],
            'total'    => $borrows->count(),
            'waiting'  => $borrows->where('status', 'waiting')->count(),
            'accepted' => $borrows->where('status', 'accepted')->count(),
            'returned' => $borrows->where('status', 'returned')->count(),
            'rejected' => $borrows->where('status', 'rejected')->count(),
            'records'  => $borrows,
        ]);
    }

    public function activityLog(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $logs = ActivityLog::with('user')
            ->when($request->search, fn($q) =>
                $q->where('action', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($qu) =>
                      $qu->where('name', 'like', "%{$request->search}%")
                  )
            )
            ->when($request->model_type, fn($q) =>
                $q->where('model_type', $request->model_type)
            )
            ->latest()
            ->paginate(20);

        return response()->json($logs);
    }
}
