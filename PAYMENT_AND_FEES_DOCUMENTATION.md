# Payment Flow & Fee Calculation Documentation

## Overview
This document explains how fees, taxes, and payments are calculated throughout the Holibayt platform.

## Fee Calculations

### Booking Modal (Short-Stay Properties)
Location: `src/components/BookingModal.tsx`

**Base Calculation:**
- Daily Price: Property price (converted if weekly/monthly)
  - If `price_type === 'monthly'`: `dailyPrice = basePrice / 30.44`
  - If `price_type === 'weekly'`: `dailyPrice = basePrice / 7`
- Nights: Number of days between check-in and check-out dates
- Subtotal: `dailyPrice × nights`

**Fees:**
- **Booking Fee**: 5% of subtotal
  - Calculation: `Math.round(subtotal * 0.05 * 100) / 100`
- **Security Deposit**: 20% of subtotal
  - Calculation: `Math.round(subtotal * 0.2 * 100) / 100`
- **Total Amount**: `subtotal + bookingFee`

**Minimum Amounts (Stripe Requirements):**
- EUR: €1
- USD: $1
- DZD: 100 DA

### Property Description Page (Short-Stay)
Location: `src/pages/Property.tsx` (lines 346-348)

**Tax Calculation:**
- Uses the property's `commission_rate` field (stored as decimal)
- Default commission rate: 15% (0.15)
- Tax Amount: `Math.round(subtotal × commission_rate × 100) / 100`

**Example:**
- If subtotal is 10,000 DA and commission_rate is 0.15:
  - Taxes = 10,000 × 0.15 = 1,500 DA

### Commission Settings (Admin Dashboard)
Location: `src/pages/admin/AdminSettings.tsx`

**Platform Commission Rates:**
- Default: 15%
- Short-Stay: 12%
- Rental: 10%
- Sale: 5%
- Minimum Commission: 1,000 DZD

These rates are stored in the `platform_settings` table under the key `commission_rates`.

## Payment Flow

### 1. User Initiates Payment
- User fills out booking form with dates and guest count
- System calculates: subtotal, booking fee, security deposit, and total
- User clicks either:
  - "Pay Booking Fee" button
  - "Pay Security Deposit" button

### 2. Payment Processing
Location: `src/components/PaymentButton.tsx` & `src/components/BookingModal.tsx`

**Steps:**
1. Validate user is authenticated
2. Check date availability (prevent double bookings)
3. Generate unique booking ID: `bk_{timestamp}_{random}`
4. Create booking record with status 'pending'
5. Call `create-payment` edge function with:
   - Property ID
   - Payment type ('booking_fee' or 'security_deposit')
   - Amount (in property currency)
   - Currency code
   - Booking data (dates, guests, etc.)
6. Receive Stripe Checkout session URL
7. Open Stripe Checkout in new tab
8. User completes payment on Stripe
9. Stripe redirects to success/cancel page
10. Success page calls `verify-payment` to update booking status to 'confirmed'

### 3. Currency Conversion (DZD to EUR)
Since Stripe doesn't support DZD directly, all DZD amounts are converted to EUR for payment processing.

**Exchange Rate Management:**
- Stored in `platform_settings` table under key `currency_exchange_rates`
- Default rate: 1 DZD = 0.0069 EUR (approximately 145 DZD = 1 EUR)
- Admin can update rate in Admin Settings → Currency tab
- **Important:** Rate should be updated daily to reflect current exchange rates

**Conversion Formula:**
```
EUR_amount = DZD_amount × exchange_rate
```

## Maintenance Mode

### Configuration
Location: `src/pages/admin/AdminSettings.tsx`

**Settings:**
- Toggle: Admin Settings → General → Maintenance Mode switch
- Stored in `platform_settings` table under `general_settings.maintenance_mode`

### Behavior
Location: `src/components/MaintenanceMode.tsx`

**Exempt Routes:**
- `/login`
- `/register`
- `/maintenance.html`

**Implementation:**
1. Component checks maintenance mode setting on mount
2. If enabled and user not admin/owner:
   - Redirect to `/maintenance.html`
3. If disabled:
   - Render children (normal app)

## Payment Flow Verification

### Edge Functions
1. **create-payment**: Creates Stripe checkout session
   - Validates user authentication
   - Creates/retrieves Stripe customer
   - Generates checkout session URL
   
2. **verify-payment**: Confirms payment completion
   - Checks Stripe checkout session status
   - Updates booking status from 'pending' to 'confirmed'
   
3. **cancel-booking**: Handles booking cancellations
   - Updates booking status to 'cancelled'

### Database Tables
- `bookings`: Stores booking records
- `platform_settings`: Stores commission rates, exchange rates, maintenance mode
- `properties`: Stores property details including commission_rate

## Summary

**Booking Fee Structure:**
- 5% booking fee on subtotal
- 20% security deposit on subtotal
- Commission/taxes based on property's commission_rate (default 15%)

**Payment Processing:**
- All payments go through Stripe
- DZD converted to EUR for Stripe compatibility
- Minimum amounts enforced per currency
- Two-step payment: booking fee + security deposit (optional)

**Maintenance Mode:**
- Can be toggled by admin
- Restricts access to non-admin users
- Preserves login/register functionality
