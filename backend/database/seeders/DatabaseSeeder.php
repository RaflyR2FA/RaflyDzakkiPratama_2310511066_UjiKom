<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Item;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name'       => 'Admin Sistem',
            'email'      => 'admin@inventaris.com',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'department' => 'IT',
        ]);

        $moderator = User::create([
            'name'       => 'Petugas Logistik',
            'email'      => 'moderator@inventaris.com',
            'password'   => Hash::make('password'),
            'role'       => 'moderator',
            'department' => 'Logistics',
        ]);

        User::create([
            'name'       => 'Staf Keuangan',
            'email'      => 'staff@inventaris.com',
            'password'   => Hash::make('password'),
            'role'       => 'staff',
            'department' => 'Finance',
        ]);

        $items = [
            [
                'item_code'          => 'COM-001',
                'item_name'          => 'Laptop Dell Latitude',
                'category'           => 'Computer',
                'total_quantity'     => 10,
                'available_quantity' => 8,
                'condition'          => 'good',
                'location'           => 'Warehouse A',
            ],
            [
                'item_code'          => 'COM-002',
                'item_name'          => 'Desktop HP EliteDesk',
                'category'           => 'Computer',
                'total_quantity'     => 15,
                'available_quantity' => 12,
                'condition'          => 'good',
                'location'           => 'Warehouse A',
            ],
            [
                'item_code'          => 'PRJ-001',
                'item_name'          => 'Projector Epson EB-X51',
                'category'           => 'Projector',
                'total_quantity'     => 5,
                'available_quantity' => 4,
                'condition'          => 'good',
                'location'           => 'Warehouse B',
            ],
            [
                'item_code'          => 'DSK-001',
                'item_name'          => 'Office Desk Standard',
                'category'           => 'Desk',
                'total_quantity'     => 30,
                'available_quantity' => 25,
                'condition'          => 'good',
                'location'           => 'Warehouse C',
            ],
            [
                'item_code'          => 'CHR-001',
                'item_name'          => 'Ergonomic Chair',
                'category'           => 'Chair',
                'total_quantity'     => 30,
                'available_quantity' => 28,
                'condition'          => 'good',
                'location'           => 'Warehouse C',
            ],
            [
                'item_code'          => 'PRT-001',
                'item_name'          => 'HP LaserJet Printer',
                'category'           => 'Printer',
                'total_quantity'     => 8,
                'available_quantity' => 2,
                'condition'          => 'good',
                'location'           => 'Warehouse A',
            ],
            [
                'item_code'          => 'MON-001',
                'item_name'          => 'LG Monitor 24"',
                'category'           => 'Monitor',
                'total_quantity'     => 20,
                'available_quantity' => 16,
                'condition'          => 'good',
                'location'           => 'Warehouse A',
            ],
            [
                'item_code'          => 'PHN-001',
                'item_name'          => 'Cisco IP Phone',
                'category'           => 'Phone',
                'total_quantity'     => 25,
                'available_quantity' => 0,
                'condition'          => 'damaged',
                'location'           => 'Warehouse B',
            ],
        ];

        foreach ($items as $item) {
            Item::create(array_merge($item, ['created_by' => $moderator->id]));
        }
    }
}
