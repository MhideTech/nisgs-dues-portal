# Surveying & Geoinformatics — Class of 2030 Portal 📐
### Class Dues & Birthday Celebration System (2026/2027 Session)

---

## 🌟 Overview

A simple, streamlined web app created solely for the **Class of 2030 (Department of Surveying & Geoinformatics)** to handle two essentials without stress:
1. **Submit Profile & Dues (Default on page load)**: A clean form where coursemates input their biodata, birthday, photo, and upload their ₦2,000 class dues receipt.
2. **Paid List (Dashboard)**: The transparent public list of everyone who has paid, showing their name, birthday, and proof of payment.
3. **Admin Birthday Hub (PIN-Protected, default `0000`)**: Accessed from the top right "Admin" button. Displays today's celebrants, upcoming birthdays for the next 30 days, month filters, the high-res 1080×1350px birthday flyer generator, and human-written WhatsApp status caption generator with emojis.

---

## 🚀 Quick Run

```bash
cd nisgs-dues-portal

# Production start (Server + Built Frontend on http://localhost:5000):
npm start

# Or Development Mode:
npm run dev
```

---

## 📱 Mobile-First Features

- **Form Defaults**:
  - Matric placeholder: `250405000`
  - Alias/Nickname placeholder: `Gbeff`
  - Date of Birth Days: `1, 2, 3 ... 31` (no unnecessary prefixes)
  - Class Dues: `₦2,000` for `2026/2027 Session`
  - Photo & payment receipt upload
- **Dashboard**:
  - Columns: `#`, `NAMES`, `BIRTHDAY`, `PROOF` (View receipt)
  - Instant name/nickname search
- **Admin**:
  - Protected with PIN `0000`
  - Generates official Class of 2030 birthday flyers
  - Generates specialized, human-sounding birthday captions with emojis (banter, hype, prayers) tailored to each coursemate's nickname and interests!
