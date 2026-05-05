<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('borrows', function (Blueprint $table) {
            $table->id();
            $table->string('borrow_code')->unique();
            $table->foreignId('user_id')->constrained('users');
            $table->string('item_code');
            $table->foreign('item_code')
                ->references('item_code')
                ->on('items')
                ->onDelete('cascade');
            $table->integer('quantity');
            $table->date('borrow_date');
            $table->date('return_date_plan');
            $table->date('return_date_actual')->nullable();
            $table->enum('status', ['waiting', 'accepted', 'rejected', 'borrowed', 'returned'])->default('waiting');
            $table->text('purpose');
            $table->text('admin_notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrows');
    }
};
