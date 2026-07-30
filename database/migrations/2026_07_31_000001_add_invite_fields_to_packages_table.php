<?php

use App\Models\Package;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            if (! Schema::hasColumn('packages', 'is_public')) {
                $table->boolean('is_public')->default(true)->after('is_active');
            }
            if (! Schema::hasColumn('packages', 'invite_token')) {
                $table->string('invite_token', 64)->nullable()->unique()->after('is_public');
            }
        });

        // Hide free packages from public listing and give them shareable invite links
        Package::query()
            ->where(function ($q) {
                $q->where('price_cents', 0)->orWhereNull('price_cents');
            })
            ->get()
            ->each(function (Package $package) {
                $package->update([
                    'is_public' => false,
                    'invite_token' => $package->invite_token ?: Str::random(40),
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            if (Schema::hasColumn('packages', 'invite_token')) {
                $table->dropColumn('invite_token');
            }
            if (Schema::hasColumn('packages', 'is_public')) {
                $table->dropColumn('is_public');
            }
        });
    }
};
