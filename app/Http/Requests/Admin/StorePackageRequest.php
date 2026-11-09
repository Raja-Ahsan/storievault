<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'badge' => ['nullable', 'string', 'max:255'],
            'price_cents' => ['nullable', 'integer', 'min:0'],
            'words_limit' => ['nullable', 'integer', 'min:0'],
            'stories_limit' => ['nullable', 'integer', 'min:0'],
            'interval' => ['nullable', 'string', 'in:monthly,yearly'],
            'features' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'discount_enabled' => ['sometimes', 'boolean'],
            'discount_type' => ['nullable', Rule::in(['percentage', 'fixed'])],
            'discount_value' => ['nullable', 'integer', 'min:1'],
            'discount_duration' => ['nullable', Rule::in(['once', 'repeating', 'forever'])],
            'discount_duration_in_months' => ['nullable', 'integer', 'min:1', 'max:36'],
            'discount_starts_at' => ['nullable', 'date'],
            'discount_ends_at' => ['nullable', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $startsAt = $this->input('discount_starts_at');
            $endsAt = $this->input('discount_ends_at');

            if ($startsAt && $endsAt && strtotime((string) $endsAt) < strtotime((string) $startsAt)) {
                $validator->errors()->add('discount_ends_at', 'End date must be on or after the start date.');
            }

            if (! $this->boolean('discount_enabled')) {
                return;
            }

            $priceCents = (int) $this->input('price_cents', 0);

            if ($priceCents <= 0) {
                $validator->errors()->add('discount_enabled', 'Discounts can only be applied to paid packages.');

                return;
            }

            if (! $this->filled('discount_type')) {
                $validator->errors()->add('discount_type', 'Select a discount type.');
            }

            if (! $this->filled('discount_value')) {
                $validator->errors()->add('discount_value', 'Enter a discount value.');
            }

            if (! $this->filled('discount_duration')) {
                $validator->errors()->add('discount_duration', 'Select a discount duration.');
            }

            if ($this->input('discount_duration') === 'repeating'
                && (int) $this->input('discount_duration_in_months') < 1) {
                $validator->errors()->add(
                    'discount_duration_in_months',
                    'Limited-month discounts require at least 1 month.'
                );
            }

            $type = $this->input('discount_type');
            $value = (int) $this->input('discount_value');

            if ($type === 'percentage' && ($value < 1 || $value > 100)) {
                $validator->errors()->add('discount_value', 'Percentage discount must be between 1 and 100.');
            }

            if ($type === 'fixed') {
                if ($value >= $priceCents) {
                    $validator->errors()->add('discount_value', 'Fixed discount must be less than the package price.');
                }

                $after = $priceCents - $value;
                if ($after < 50) {
                    $validator->errors()->add(
                        'discount_value',
                        'Discounted price must be at least $0.50 (Stripe minimum).'
                    );
                }
            }

            if ($type === 'percentage') {
                $after = (int) round($priceCents * (1 - ($value / 100)));
                if ($after < 50 && $value < 100) {
                    $validator->errors()->add(
                        'discount_value',
                        'Discounted price must be at least $0.50 (Stripe minimum).'
                    );
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $startsAt = $this->input('discount_starts_at');
        $endsAt = $this->input('discount_ends_at');

        $this->merge([
            'discount_enabled' => filter_var(
                $this->input('discount_enabled', false),
                FILTER_VALIDATE_BOOLEAN
            ),
            'is_active' => filter_var(
                $this->input('is_active', true),
                FILTER_VALIDATE_BOOLEAN
            ),
            'discount_starts_at' => ($startsAt === '' || $startsAt === null) ? null : $startsAt,
            'discount_ends_at' => ($endsAt === '' || $endsAt === null) ? null : $endsAt,
            'words_limit' => $this->input('words_limit') === '' || $this->input('words_limit') === null
                ? null
                : $this->input('words_limit'),
            'stories_limit' => $this->input('stories_limit') === '' || $this->input('stories_limit') === null
                ? null
                : $this->input('stories_limit'),
        ]);
    }
}
