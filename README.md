# শেরপুর ভ্রমণ গাইড | Sherpur Travel Guide

A production-oriented full-stack digital tourism directory and content platform for Sherpur District, Bangladesh. Built with React, TypeScript, Tailwind CSS, Google Cloud Firestore, Firebase Authentication, and Google Cloud Run.

---

## 🌟 Features Overview

- **Mobile-First Responsive Design**: Nature-inspired color palette (forest green `#143E27`, warm neutrals `#FBFBFA`, earthy amber accents) with clean typography (`Hind Siliguri` & `Plus Jakarta Sans`).
- **Interactive Tourism Directory**:
  - Filterable by all 5 Upazilas:
    - শেরপুর সদর (Sherpur Sadar)
    - নালিতাবাড়ী (Nalitabari)
    - ঝিনাইগাতী (Jhinaigati)
    - শ্রীবরদী (Sreebardi)
    - নকলা (Nakla)
  - Thematic Categories: পাহাড় ও গারো পাহাড় অঞ্চল, বন ও ইকো পার্ক, নদী ও জলাশয়, ঐতিহাসিক ও প্রত্নতাত্ত্বিক স্থান, ধর্মীয় ও সাংস্কৃতিক স্থান, পিকনিক স্পট।
  - Multi-criteria real-time search and sorting (Featured first, Alphabetical Bengali, Newest).
  - Grid & List view toggles.
- **Dedicated Destination Details**:
  - Stable URLs (`#places/madhutila-eco-park`, `#places/gajni-abakash-kendra`, etc.)
  - High-res cover photography, interactive gallery modal
  - Travel instructions (যাতায়াত ব্যবস্থা) from Dhaka via Mohakhali and local transport
  - Verified opening hours, entry fees, and seasonal recommendations (missing fields safely omitted)
  - Safety & border advisory for proximity to Meghalaya international boundary
  - Google Maps direct directions link
  - Social sharing (Copy link, WhatsApp, Facebook)
- **Secure Administrator Panel (`#admin`)**:
  - Firebase Authentication with Google Sign-in
  - Allowlist authorization (`wpsabbir688@gmail.com`, `wpsabbir44@gmail.com` and `/admins` collection)
  - Hardened ABAC Firestore Security Rules deployed to Cloud Firestore
  - Destination manager: Add, Edit, Toggle Publish/Draft, Duplicate as Draft, Delete with double confirmation
  - Dynamic Category Manager with dependency check
  - Visitor Contact messages inbox
  - 1-Click Database Seeding button to populate verified Sherpur places into Firestore
- **Travel Articles & Safety Guides**:
  - Researched Dhaka to Sherpur transit guide
  - Garo Hills & Meghalaya border security advisory for tourists
  - 1-day itinerary for Sherpur's top attractions
- **SEO & Discoverability**:
  - Dynamic meta tags, OpenGraph tags, canonical tags
  - Auto-generated `public/sitemap.xml` and `public/robots.txt`
  - Bengali structured content

---

## 🗂 Researched Initial Destinations Catalog

1. **মধুটিলা ইকো পার্ক** (নালিতাবাড়ী) – শালবন, কৃত্রিম হ্রদ, ওয়াচ টাওয়ার, গারো পাহাড়ের নৈসর্গিক রূপ
2. **গজনী অবকাশ কেন্দ্র** (ঝিনাইগাতী) – পাতালপুরী, কৃত্রিম জলপ্রপাত, ঝুলন্ত সেতু, ক্রিসেন্ট লেক ও মেঘালয় ভিউ
3. **নাকুগাঁও স্থলবন্দর ও সীমান্ত** (নালিতাবাড়ী) – আন্তর্জাতিক স্থলবন্দর ও সীমান্তবর্তী মহাসড়ক
4. **রাজার পাহাড় ও বালিজুড়ি রেঞ্জ** (শ্রীবরদী) – উঁচু পাহাড়ি টিলা, শালবন ও নির্জন ট্রেইল
5. **মাইসাহেবা জামে মসজিদ** (শেরপুর সদর) – শতবর্ষী ঐতিহ্যবাহী আধ্যাত্মিক মসজিদ
6. **পৌনে তিন আনি জমিদার বাড়ি ও রংমহল** (শেরপুর সদর) – ঔপনিবেশিক আমলের জমিদারি ঐতিহ্য
7. **বানেশ্বর্দী প্রাচীন জামে মসজিদ** (নকলা) – মুঘল আমলের তিন গম্বুজ বিশিষ্ট সংরক্ষিত ঐতিহাসিক নিদর্শন
8. **কর্নঝোড়া রাবার বাগান ও নদী** (শ্রীবরদী) – সবুজ রাবার বাগান ও পাহাড়ি শীতল জলধারা
9. **পানিহাটা-তারানি পাহাড় ও সাধু যোসেফের ধর্মপল্লী** (নালিতাবাড়ী) – গারো পাহাড়ের গির্জা ও ভোগাই নদী
10. **রাংটিয়া শালবন ও ফরেস্ট রেঞ্জ** (ঝিনাইগাতী) – শতবর্ষী বিশাল শালবৃক্ষের নিবিড় অরণ্য

---

## 🔐 Admin Provisioning

1. Initial allowlist includes:
   - `wpsabbir688@gmail.com`
   - `wpsabbir44@gmail.com`
2. When the user signs in with Google, `AuthContext` verifies that the authenticated email matches the allowlist or exists in `/databases/{database}/documents/admins/{uid}`.
3. Server-side security rules in `firestore.rules` verify `request.auth.token.email_verified == true` and email membership.
4. Additional administrators can be provisioned by adding a document to `/admins/{uid}` with `{ email: "user@example.com", role: "admin" }`.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 📞 Business & Contact Information

- **Brand Name**: শেরপুর ভ্রমণ গাইড | Sherpur Travel Guide
- **Phone**: [+8801944460344](tel:+8801944460344)
- **Email**: [wpsabbir44@gmail.com](mailto:wpsabbir44@gmail.com)
- **Location**: শেরপুর জেলা, ময়মনসিংহ বিভাগ, বাংলাদেশ
