<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\BorrowController;
use App\Http\Controllers\ReportController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::get('/items',                  [ItemController::class, 'index']);
    Route::get('/items/categories',       [ItemController::class, 'categories']);
    Route::get('/items/{item:item_code}', [ItemController::class, 'show']);

    Route::get('/borrows',                      [BorrowController::class, 'index']);
    Route::post('/borrows',                     [BorrowController::class, 'store']);
    Route::get('/borrows/{borrow:borrow_code}', [BorrowController::class, 'show']);

    Route::middleware('role:moderator,admin')->group(function () {
        Route::post('/items',                    [ItemController::class, 'store']);
        Route::put('/items/{item:item_code}',    [ItemController::class, 'update']);
        Route::delete('/items/{item:item_code}', [ItemController::class, 'destroy']);

        Route::post('/borrows/{borrow:borrow_code}/accept', [BorrowController::class, 'accept']);
        Route::post('/borrows/{borrow:borrow_code}/reject', [BorrowController::class, 'reject']);
        Route::post('/borrows/{borrow:borrow_code}/return', [BorrowController::class, 'returnItem']);

        Route::get('/reports/dashboard',     [ReportController::class, 'dashboard']);
        Route::get('/reports/summary',       [ReportController::class, 'summary']);

        Route::middleware('role:admin')->group(function () {
            Route::get('/reports/activity-log',  [ReportController::class, 'activityLog']);
        });
    });
});
