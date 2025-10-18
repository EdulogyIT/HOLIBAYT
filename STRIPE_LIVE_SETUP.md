# Stripe Live Account Setup Guide

This guide will help you activate your Stripe account for live payments and integrate it with your Holibayt platform.

## Current Status
✅ Your platform currently uses Stripe in **test mode**  
🎯 Goal: Activate **live mode** to accept real payments

---

## Step 1: Create Your Stripe Account

**Link to Create Account:** https://dashboard.stripe.com/register

### What You'll Need:
- Business email address
- Business legal name
- Business registration details
- Tax ID (NIF in Algeria)
- Bank account information for payouts

### Registration Process:
1. Go to https://dashboard.stripe.com/register
2. Enter your business email
3. Verify your email address
4. Fill in business details

---

## Step 2: Complete Business Verification

Stripe requires verification before activating live payments. This process typically takes 1-3 business days.

### Required Documents:
1. **Business Registration Certificate**
   - Official document proving your business is registered

2. **Tax Identification Number (TIN/NIF)**
   - Your business tax ID from Algerian tax authorities

3. **Identity Verification**
   - Government-issued ID (passport, national ID card, or driver's license)
   - Must match the business owner or authorized representative

4. **Bank Account Details**
   - Bank account for receiving payouts
   - IBAN and SWIFT/BIC code
   - Bank statement (may be required)

### How to Submit Documents:
1. Log in to your Stripe Dashboard
2. Go to **Settings** → **Business Details**
3. Follow the prompts to upload required documents
4. Wait for Stripe's verification team to review

**Documentation Guide:** https://docs.stripe.com/connect/identity-verification

---

## Step 3: Add Bank Account for Payouts

You'll need to connect a bank account to receive funds from customer payments.

### Required Information:
- Bank name
- Account holder name
- IBAN
- SWIFT/BIC code
- Bank statement (optional, may be requested)

### How to Add Bank Account:
1. Go to **Settings** → **Payouts**
2. Click **Add bank account**
3. Enter your bank details
4. Stripe will verify the account (may take 1-2 business days)

**Bank Account Setup Guide:** https://docs.stripe.com/payouts/bank-accounts

---

## Step 4: Activate Live Payments

Once your business is verified, Stripe will enable live mode.

### How to Activate:
1. Log in to Stripe Dashboard
2. Toggle from **Test Mode** to **Live Mode** (top left corner)
3. Go to **Developers** → **API Keys**
4. You should now see:
   - **Live Publishable Key** (starts with `pk_live_`)
   - **Live Secret Key** (starts with `sk_live_`)

⚠️ **IMPORTANT:** Keep your **Secret Key** confidential. Never share it publicly or commit it to code repositories.

---

## Step 5: Provide Keys to Your Developer

Once you have your live keys:

### What to Share:
✅ **Live Secret Key** (starts with `sk_live_`)  
✅ **Live Publishable Key** (starts with `pk_live_`)

### How to Share Securely:
1. **DO NOT** send keys via email or public chat
2. Use encrypted communication (Signal, WhatsApp, secure password manager)
3. Or provide them directly through Lovable's secrets management

### What Your Developer Will Do:
- Add the live secret key to Supabase Edge Functions
- Update frontend configuration with the live publishable key
- Test a small live transaction (recommend testing with 1 DZD first)

---

## Step 6: Configure Stripe Settings

Before going live, ensure these settings are configured:

### Payment Methods
1. Go to **Settings** → **Payment Methods**
2. Enable the payment methods you want to accept:
   - ✅ Cards (Visa, Mastercard)
   - ✅ Local payment methods (if applicable for Algeria)

### Customer Portal (Optional but Recommended)
For subscription management:
1. Go to **Settings** → **Billing** → **Customer Portal**
2. Click **Activate**
3. Configure what customers can manage (subscriptions, payment methods, etc.)

**Customer Portal Setup:** https://docs.stripe.com/customer-management/activate-no-code-customer-portal

### Webhooks (If Needed)
If your developer requires webhooks:
1. Go to **Developers** → **Webhooks**
2. Add your webhook endpoint URL
3. Select events to listen for

---

## Step 7: Test Live Payments

Before accepting real customer payments, test with a small amount:

1. **Create a Test Transaction**
   - Use a real card (your own)
   - Process a small payment (1 DZD or equivalent)
   
2. **Verify the Payment**
   - Check Stripe Dashboard for successful payment
   - Confirm funds appear in **Balance** (may take a few days)

3. **Test Refunds**
   - Issue a refund for the test payment
   - Verify refund appears in Stripe Dashboard

---

## Important Notes

### Timeline:
- **Account Creation:** Immediate
- **Verification:** 1-3 business days
- **Bank Account Verification:** 1-2 business days
- **First Payout:** 7-14 days after first payment (standard)

### Fees:
Stripe charges a fee per transaction. Standard rates in Algeria:
- **2.9% + €0.25** per successful card charge (may vary by region)
- Check your specific rates in **Settings** → **Pricing**

### Support:
If you encounter issues:
- **Stripe Support:** https://support.stripe.com/
- **Email:** support@stripe.com
- **Live Chat:** Available in Stripe Dashboard (bottom right)

### Security Best Practices:
1. Never share your **Secret Key** publicly
2. Use strong passwords for your Stripe account
3. Enable two-factor authentication (2FA)
4. Regularly review your transaction history

---

## Resources

### Official Stripe Documentation:
- **Getting Started:** https://docs.stripe.com/account/create
- **Identity Verification:** https://docs.stripe.com/connect/identity-verification
- **Bank Accounts:** https://docs.stripe.com/payouts/bank-accounts
- **Going Live Checklist:** https://docs.stripe.com/payments/checkout/fulfill-orders
- **Dashboard Overview:** https://dashboard.stripe.com/

### Holibayt Integration:
Once your live keys are ready, your developer will:
1. Update the Supabase Edge Functions with your live secret key
2. Test the payment flow on the platform
3. Monitor initial transactions for any issues

---

## Questions?

If you have any questions during setup:
1. Contact Stripe Support: https://support.stripe.com/
2. Reach out to your Holibayt developer for integration-specific questions

**Remember:** Never share your Stripe **Secret Key** publicly or via unsecured channels!

---

Last Updated: 2025-01-18
