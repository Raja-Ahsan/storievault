import React from 'react';
import {
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react';

const durationOptions = [
  { label: 'Select duration', value: '' },
  { label: 'First Billing Only', value: 'once' },
  { label: 'Limited Months', value: 'repeating' },
  { label: 'Forever', value: 'forever' },
];

const typeOptions = [
  { label: 'Select type', value: '' },
  { label: 'Percentage (%)', value: 'percentage' },
  { label: 'Fixed Amount ($)', value: 'fixed' },
];

function formatMoneyFromCents(cents) {
  if (cents === '' || cents === null || cents === undefined || isNaN(cents)) {
    return null;
  }
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

export default function PackageDiscountFields({ data, setData, errors }) {
  const priceCents = Number(data.price_cents) || 0;
  const enabled = data.discount_enabled === true || data.discount_enabled === '1' || data.discount_enabled === 1;

  let previewCents = null;
  if (enabled && priceCents > 0 && data.discount_value) {
    if (data.discount_type === 'percentage') {
      const pct = Math.min(100, Math.max(0, Number(data.discount_value)));
      previewCents = Math.round(priceCents * (1 - pct / 100));
    } else if (data.discount_type === 'fixed') {
      previewCents = priceCents - Number(data.discount_value);
    }
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol md={12}>
          <div className="d-flex align-items-center justify-content-between border rounded p-3 bg-light">
            <div>
              <div className="fw-semibold">Enable Discount</div>
              <small className="text-muted">
                Optional package discount synced to Stripe Coupons (auto-applied at checkout — no promo code).
              </small>
            </div>
            <CFormSwitch
              id="discount_enabled"
              checked={enabled}
              onChange={(e) => setData('discount_enabled', e.target.checked)}
            />
          </div>
          {errors.discount_enabled && (
            <div className="text-danger mt-1">{errors.discount_enabled}</div>
          )}
        </CCol>
      </CRow>

      {enabled && (
        <>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="discount_type">Discount Type</CFormLabel>
              <CFormSelect
                id="discount_type"
                value={data.discount_type || ''}
                onChange={(e) => {
                  setData('discount_type', e.target.value);
                  setData('discount_value', '');
                }}
                invalid={!!errors.discount_type}
                options={typeOptions}
              />
              {errors.discount_type && (
                <div className="text-danger">{errors.discount_type}</div>
              )}
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="discount_value">Discount Value</CFormLabel>
              {data.discount_type === 'fixed' ? (
                <CInputGroup>
                  <CInputGroupText>$</CInputGroupText>
                  <CFormInput
                    id="discount_value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      data.discount_value
                        ? (Number(data.discount_value) / 100).toFixed(2)
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setData('discount_value', '');
                        return;
                      }
                      setData('discount_value', Math.round(parseFloat(value) * 100));
                    }}
                    invalid={!!errors.discount_value}
                    placeholder="3.80"
                  />
                </CInputGroup>
              ) : (
                <CInputGroup>
                  <CFormInput
                    id="discount_value"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={data.discount_value || ''}
                    onChange={(e) => setData('discount_value', e.target.value === '' ? '' : Number(e.target.value))}
                    invalid={!!errors.discount_value}
                    placeholder="20"
                  />
                  <CInputGroupText>%</CInputGroupText>
                </CInputGroup>
              )}
              {errors.discount_value && (
                <div className="text-danger">{errors.discount_value}</div>
              )}
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="discount_duration">Discount Duration</CFormLabel>
              <CFormSelect
                id="discount_duration"
                value={data.discount_duration || ''}
                onChange={(e) => setData('discount_duration', e.target.value)}
                invalid={!!errors.discount_duration}
                options={durationOptions}
              />
              {errors.discount_duration && (
                <div className="text-danger">{errors.discount_duration}</div>
              )}
            </CCol>

            {data.discount_duration === 'repeating' && (
              <CCol md={6}>
                <CFormLabel htmlFor="discount_duration_in_months">Number of Months</CFormLabel>
                <CFormInput
                  id="discount_duration_in_months"
                  type="number"
                  min="1"
                  max="36"
                  value={data.discount_duration_in_months || ''}
                  onChange={(e) =>
                    setData(
                      'discount_duration_in_months',
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  invalid={!!errors.discount_duration_in_months}
                />
                {errors.discount_duration_in_months && (
                  <div className="text-danger">{errors.discount_duration_in_months}</div>
                )}
              </CCol>
            )}
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="discount_starts_at">Start Date (optional)</CFormLabel>
              <CFormInput
                id="discount_starts_at"
                type="date"
                value={data.discount_starts_at || ''}
                onChange={(e) => setData('discount_starts_at', e.target.value)}
                invalid={!!errors.discount_starts_at}
              />
              {errors.discount_starts_at && (
                <div className="text-danger">{errors.discount_starts_at}</div>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="discount_ends_at">End Date (optional)</CFormLabel>
              <CFormInput
                id="discount_ends_at"
                type="date"
                value={data.discount_ends_at || ''}
                onChange={(e) => setData('discount_ends_at', e.target.value)}
                invalid={!!errors.discount_ends_at}
              />
              {errors.discount_ends_at && (
                <div className="text-danger">{errors.discount_ends_at}</div>
              )}
            </CCol>
          </CRow>

          {previewCents !== null && previewCents >= 0 && (
            <CAlert color="info" className="mb-3">
              <strong>Preview:</strong>{' '}
              <span style={{ textDecoration: 'line-through' }}>{formatMoneyFromCents(priceCents)}</span>
              {' → '}
              <strong>{formatMoneyFromCents(previewCents)}</strong>
              {data.discount_duration === 'once' && (
                <div className="small mt-1">First billing only — then {formatMoneyFromCents(priceCents)} renews.</div>
              )}
              {data.discount_duration === 'repeating' && data.discount_duration_in_months && (
                <div className="small mt-1">
                  Discount for {data.discount_duration_in_months} month(s) — then {formatMoneyFromCents(priceCents)} renews.
                </div>
              )}
              {data.discount_duration === 'forever' && (
                <div className="small mt-1">Discount applies for the life of the subscription.</div>
              )}
            </CAlert>
          )}
        </>
      )}
    </>
  );
}

/** Format a DB datetime/date as YYYY-MM-DD for <input type="date"> */
export function toDateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** @deprecated use toDateInputValue */
export function toDatetimeLocalValue(value) {
  return toDateInputValue(value);
}
