# Security Specification: Sherpur Travel Guide

## 1. Data Invariants
1. Destinations can only be created, modified, or deleted by verified administrators.
2. Unauthenticated visitors and non-admins can only read published destinations (`status == 'published'`) and public categories. Draft destinations are strictly confidential to admins.
3. Destination document IDs must conform to `isValidId` (`^[a-zA-Z0-9_\-]+$`) with length <= 128 characters.
4. Admins are validated server-side by checking the `/admins/{uid}` collection or verified administrator email list (`wpsabbir688@gmail.com`, `wpsabbir44@gmail.com`) with `request.auth.token.email_verified == true`.
5. Contact submissions can be created by anyone, but must have valid string lengths and cannot be read or deleted by the public (admin only).
6. Categories can only be created, updated, or deleted by administrators.
7. Admin collection is strictly read-only to existing admins and cannot be modified by ordinary users.

## 2. The "Dirty Dozen" Payloads (Attacks that MUST return PERMISSION_DENIED)
1. **Unauthenticated Destination Creation**: An unauthenticated user attempts to create a fake destination in `/destinations/fake-spot`.
2. **Non-Admin Destination Write**: A regular logged-in user attempts to insert or update `/destinations/madhutila`.
3. **Public Reading of Draft Destinations**: A public user attempts to query or read a destination where `status == 'draft'`.
4. **Id Poisoning Injection**: An attacker attempts to create `/destinations/<junk-1500-bytes-payload>`.
5. **Admin Self-Promotion**: A regular logged-in user writes a document to `/admins/{their_uid}` claiming `{ role: "admin" }`.
6. **Email Spoofing Attack**: An attacker sends a write request using an unverified token claiming admin email (`email_verified: false`).
7. **Contact Submission PII Harvesting**: An unauthenticated or regular user tries to list `/contacts` to harvest visitor phone numbers.
8. **Malicious Oversized Payload**: An attacker submits a destination with a 50MB description string to exhaust database limits.
9. **Category Tampering**: A visitor tries to delete the 'eco-parks' category `/categories/eco-parks`.
10. **State Corruption (Illegal Status)**: Updating status to an invalid value outside `['draft', 'published']`.
11. **Catch-All Probe Attack**: Reading arbitrary collections like `/system/keys` or `/{document=**}`.
12. **Bypassing Affected Keys**: Non-admin attempting partial update on destination status.

## 3. Test Runner
Defined in `test/firestore.rules.test.ts` testing the 12 scenarios against Firestore emulator or test runner.
