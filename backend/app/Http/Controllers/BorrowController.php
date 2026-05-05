<?php

namespace App\Http\Controllers;

use App\Models\Borrow;
use App\Models\Item;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BorrowController extends Controller
{
    public function index(Request $request)
    {
        $query = Borrow::with(['user', 'item', 'approvedBy']);

        if ($request->user()->isStaff()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('item', fn($qi) =>
                    $qi->where('item_name', 'like', "%{$request->search}%")
                )->orWhereHas('user', fn($qu) =>
                    $qu->where('name', 'like', "%{$request->search}%")
                )->orWhere('borrow_code', 'like', "%{$request->search}%");
            });
        }

        if ($request->date_from && $request->date_to) {
            $query->whereBetween('borrow_date', [
                $request->date_from,
                $request->date_to,
            ]);
        }

        $borrows = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($borrows);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code'        => 'required|exists:items,item_code',
            'quantity'         => 'required|integer|min:1',
            'borrow_date'      => 'required|date|after_or_equal:today',
            'return_date_plan' => 'required|date|after:borrow_date',
            'purpose'          => 'required|string|max:500',
        ]);

        $item = Item::where('item_code', $validated['item_code'])->firstOrFail();

        if ($item->condition === 'damaged') {
            return response()->json(['message' => 'Item dalam kondisi rusak, tidak dapat dipinjam.'], 422);
        }

        if ($item->available_quantity < $validated['quantity']) {
            return response()->json([
                'message' => "Stok tidak mencukupi. Tersedia: {$item->available_quantity} unit."
            ], 422);
        }

        $borrow = Borrow::create([
            ...$validated,
            'user_id'     => $request->user()->id,
            'borrow_code' => 'BRW-' . strtoupper(Str::random(8)),
            'status'      => 'waiting',
        ]);

        ActivityLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'Submit Borrow Request',
            'model_type' => 'Borrow',
            'model_id'   => $borrow->id,
            'new_data'   => $borrow->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($borrow->load(['user', 'item']), 201);
    }

    public function show(Borrow $borrow)
    {
        return response()->json($borrow->load(['user', 'item', 'approvedBy']));
    }

    public function accept(Request $request, Borrow $borrow)
    {
        if (!$request->user()->canManage()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        if ($borrow->status !== 'waiting') {
            return response()->json(['message' => 'Hanya permintaan berstatus waiting yang dapat disetujui.'], 422);
        }

        $item = $borrow->item;

        if ($item->available_quantity < $borrow->quantity) {
            return response()->json(['message' => 'Stok tidak mencukupi saat ini.'], 422);
        }

        $borrow->update([
            'status'      => 'accepted',
            'approved_by' => $request->user()->id,
            'admin_notes' => $request->admin_notes,
        ]);

        $item->decrement('available_quantity', $borrow->quantity);

        ActivityLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'Accept Borrow',
            'model_type' => 'Borrow',
            'model_id'   => $borrow->id,
            'new_data'   => $borrow->fresh()->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($borrow->load(['user', 'item', 'approvedBy']));
    }

    public function reject(Request $request, Borrow $borrow)
    {
        if (!$request->user()->canManage()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        if ($borrow->status !== 'waiting') {
            return response()->json(['message' => 'Hanya permintaan berstatus waiting yang dapat ditolak.'], 422);
        }

        $borrow->update([
            'status'      => 'rejected',
            'approved_by' => $request->user()->id,
            'admin_notes' => $request->admin_notes,
        ]);

        ActivityLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'Reject Borrow',
            'model_type' => 'Borrow',
            'model_id'   => $borrow->id,
            'new_data'   => $borrow->fresh()->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($borrow->load(['user', 'item']));
    }

    public function returnItem(Request $request, Borrow $borrow)
    {
        if (!$request->user()->canManage()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        if ($borrow->status !== 'accepted') {
            return response()->json(['message' => 'Hanya peminjaman berstatus accepted yang dapat dikembalikan.'], 422);
        }

        $borrow->update([
            'status'             => 'returned',
            'return_date_actual' => Carbon::today(),
            'admin_notes'        => $request->admin_notes ?? $borrow->admin_notes,
        ]);

        $borrow->item->increment('available_quantity', $borrow->quantity);

        ActivityLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'Return Item',
            'model_type' => 'Borrow',
            'model_id'   => $borrow->id,
            'new_data'   => $borrow->fresh()->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($borrow->load(['user', 'item']));
    }
}
