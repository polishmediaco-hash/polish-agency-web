# POLISH Media Co. — Luxury Invoicing Suite Standards (v2.2)

**Entity**: POLISH Media Co. (`polishmediaco.com`)  
**Version**: 2.2 (Haute Atelier Evolution)  
**System URL**: `/invoice` (`public/invoice.html`)  
**Updated**: September 2026

---

## 1. Overview & Rebranding Evolution

POLISH Media Co. commercial invoicing has transitioned from legacy ad-hoc templates into a dedicated, print-perfect, multi-currency luxury invoice engine.

Every invoice generated reflects the **Haute Atelier Champagne Gold** brand standards:
1. **Haute Alabaster (`#FAF7F2`) Paper Mode**: Official print & corporate accounting standard with high-contrast obsidian typography and official dark vector logo (`polish-logo-horizontal-dark.svg`).
2. **Haute Obsidian (`#080706`) VIP Dark Mode**: Screen-optimized presentation with champagne gold accents (`logo-gold.svg`) for VIP digital delivery via WhatsApp or email.
3. **Branded Serial Architecture**: Sequential code formatting adhering to `POL-YYYY-XXX` (e.g. `POL-2026-094`), with automatic code adjustment when serial numbers are entered and a one-click `+1 Next` incrementer.
4. **Dynamic Live Date**: Automatically synchronizes to the current day (`DD/MM/YYYY`) with a one-click `Today` date refresher.
5. **Card Symmetry**: Exact structural balance between `PAYABLE TO` (agency) and `CLIENT DETAILS` (client) cards.
6. **Tabular Numeral Precision**: Strict enforcement of `font-variant-numeric: tabular-nums lining-nums` across all prices, bank account numbers, dates, and metric totals.

---

## 2. Standard Client & Payment Profile (Verified Defaults)

### A. Agency Credentials
* **Payable To**: `Polish Media Co`
* **Contact Person**: `Faycal Chouli`
* **Contacts**: `+213 662 41 77 61` • `Contact@polishmediaco.com` • `polishmediaco.com`

### B. Settlement & Banking Rails
* **Beneficiary**: **FAYCAL CHOULI**
* **Algerian Dinar (DZD / DA)**:
  * **CCP**: `0044643623 cle 49`
  * **RIP**: `00799999004464362350` (BaridiMob & SATIM compatible)
  * **Bank**: Banque Nationale d'Algérie (BNA)
* **International Wire (USD / EUR)**:
  * Wire details, IBAN & Swift settlement available in preset loader.
* **UAE Corporate Expensing (AED)**:
  * Hardened corporate expensing line items compliant with UAE procurement standards.

---

## 3. How to Use the Invoicing Studio (`/invoice`)

1. **Enter Client & Service Details**:
   - Use the left sidebar to enter the client company name, contact person, phone/WhatsApp, and address.
   - Set the invoice number and currency (`DA`, `USD`, `EUR`, `AED`).
   - Add/remove service line items (Description, Duration, Platform, Price).
2. **Interactive Preview & Direct In-Place Edit**:
   - The right side renders an exact A4 sheet in real time.
   - Click the **"Direct Edit"** button in the top toolbar to enable click-to-edit directly on the sheet itself. Any adjustments update both the canvas and the sidebar form.
3. **One-Click PDF Export**:
   - Click **"Download PDF / Print (⌘P)"**.
   - In the browser print dialog:
     - Destination: **Save as PDF**
     - Paper Size: **A4**
     - Margins: **None** (margins are built into the CSS)
     - Options: Check **Background graphics** to preserve the luxury Warm Alabaster or Obsidian background.
4. **Quick Presets Vault**:
   - **Celestia Cosmetics**: Meta Intensive Ads Campaign (180 000 DA)
   - **Picked Makeup**: Omnichannel Performance Retainer (300 000 DA)
   - **Haute DTC Retainer**: International Beauty Accelerator (8 500 €)
   - **Gulf Corporate Advisory**: DIFC Private Office Retainer (45 000 AED)
