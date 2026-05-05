<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Item::with('createdBy');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('item_name', 'like', "%{$request->search}%")
                  ->orWhere('item_code', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%");
            });
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->condition) {
            $query->where('condition', $request->condition);
        }

        if ($request->status) {
            match ($request->status) {
                'available'      => $query->where('available_quantity', '>', 0)
                                          ->where('condition', '!=', 'damaged'),
                'fully_borrowed' => $query->where('available_quantity', 0)
                                          ->where('condition', '!=', 'damaged'),
                'damaged'        => $query->where('condition', 'damaged'),
                default          => null,
            };
        }

        $items = $query->paginate($request->per_page ?? 15);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name'      => 'required|string|max:255',
            'category'       => 'required|string|max:100',
            'description'    => 'nullable|string',
            'total_quantity'  => 'required|integer|min:1',
            'condition'      => 'required|in:good,damaged,under_repair',
            'location'       => 'nullable|string|max:255',
            'photo'          => 'nullable|image|max:2048',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_date'  => 'nullable|date',
        ]);

        $prefix = strtoupper(substr(preg_replace('/\s+/', '', $validated['category']), 0, 3));
        $validated['item_code']          = $prefix . '-' . strtoupper(Str::random(6));
        $validated['available_quantity'] = $validated['total_quantity'];
        $validated['created_by']         = $request->user()->id;

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('items', 'public');
        }

        $item = Item::create($validated);

        ActivityLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'Add Item',
            'model_type' => 'Item',
            'model_id'   => $item->id,
            'new_data'   => $item->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($item->load('createdBy'), 201);
    }

    public function show(Item $item)
    {
        return response()->json($item->load(['createdBy', 'borrows.user']));
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'item_name'      => 'sometimes|string|max:255',
            'category'       => 'sometimes|string|max:100',
            'description'    => 'nullable|string',
            'total_quantity'  => 'sometimes|integer|min:1',
            'condition'      => 'sometimes|in:good,damaged,under_repair',
            'location'       => 'nullable|string|max:255',
            'photo'          => 'nullable|image|max:2048',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_date'  => 'nullable|date',
        ]);

        $oldData = $item->toArray();

        if ($request->hasFile('photo')) {
            if ($item->photo) {
                Storage::disk('public')->delete($item->photo);
            }
            $validated['photo'] = $request->file('photo')->store('items', 'public');
        }

        if (isset($validated['total_quantity'])) {
            $diff = $validated['total_quantity'] - $item->total_quantity;
            $validated['available_quantity'] = max(0, $item->available_quantity + $diff);
        }

        $item->update($validated);

        ActivityLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'Update Item',
            'model_type' => 'Item',
            'model_id'   => $item->id,
            'old_data'   => $oldData,
            'new_data'   => $item->fresh()->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($item->load('createdBy'));
    }

    public function destroy(Request $request, Item $item)
    {
        $activeBorrow = $item->borrows()
            ->whereIn('status', ['waiting', 'accepted', 'borrowed'])
            ->exists();

        if ($activeBorrow) {
            return response()->json([
                'message' => 'Item tidak dapat dihapus karena masih ada peminjaman aktif.'
            ], 422);
        }

        ActivityLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'Delete Item',
            'model_type' => 'Item',
            'model_id'   => $item->id,
            'old_data'   => $item->toArray(),
            'ip_address' => $request->ip(),
        ]);

        $item->delete();

        return response()->json(['message' => 'Item berhasil dihapus']);
    }

    public function categories()
    {
        $categories = Item::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }
}
