# AutoAdmissions
## Development Guide & Documentation

WhatsApp Automation Template — Landing Page Project

| Stack | Backend | Payments |
|---|---|---|
| HTML · CSS · JS | Vercel Serverless | Razorpay — ₹399 |

---

### 1. Directory Structure

The repository is a minimal, high-conversion static landing page built with raw HTML, CSS, and JavaScript, backed by a serverless Meta CAPI endpoint.

```
inquirybooster/
├── index.html            # Primary landing page (static, white-theme layout)
├── thankyou.html         # Payment success page (download links & pixel tracking)
├── styles.css            # Production stylesheet (static layout, zero animations)
├── styles-v1.css         # Version-controlled backup stylesheet
├── script.js             # Production frontend checkout & Razorpay orchestration
├── script-v3.js          # Version-controlled backup script
├── local-server.js       # Node.js local dev server (mocks Vercel CAPI routes)
├── vercel.json           # Vercel serverless routing configuration
├── google_sheets_script.md  # Instructions & code for Apps Script integration
└── api/
    └── capi.js           # Serverless handler for Meta Conversions API (CAPI)
```

---

### 2. Frontend Layout & UI Architecture

The page follows a minimalist, high-performance light theme using modern typography (Inter) and custom slate-gray CSS variables for visual hierarchy.

#### CSS Variables (`:root`)
Defined at the top of `styles.css`:

| Variable | Value / Description |
|---|---|
| `var(--bg-dark)` | `#ffffff` — Clean white canvas |
| `var(--text-main)` | `#0f172a` — Slate 900, high-contrast headers |
| `var(--text-muted)` | `#475569` — Slate 600, subtext and paragraphs |
| `var(--primary)` | `#25D366` — Classic WhatsApp green |
| `var(--primary-dark)` | `#128C7E` — Dark WhatsApp green for headings/accents |

#### Static Hero Redesign
Based on user feedback, the landing page is designed to be simple, fast, and static with no moving elements:

* **Background**: Clean solid white (`#ffffff`).
* **Text Highlights**: Orange-peach highlights (`#f97316`) draw eyes to critical copy.
* **Primary CTA Button**: Vibrant WhatsApp green with white text — `GET AUTOADMISSIONS FREE →`
* **WhatsApp Button**: Solid dark navy (`#0f172a`) with white text and WhatsApp message icon.
* **Animations Disabled**: `opacity: 1 !important` and `transform: none !important` — all `scroll-anim`, `fadeInUp`, and `pulse` overrides applied for immediate layout stability.

#### Greenwood Intl School — WhatsApp Mockup
A pure CSS mockup replicating a realistic WhatsApp chat in Light Mode:

**Chat UI Specs:**
* **Header**: Classic green (`#008069`), `GS` avatar circle, bold name, green dot `• Online` status.
* **Parent message (Left)**: White bubble, `received` class — *"Hi, how can I get admission for my child?"*
* **Bot response (Right)**: Green bubble, `sent` class — Welcome greeting, prospectus PDF card, blue double-check ticks `✓✓`.
* **Reply Badge**: Floating '2s average reply time' card anchored to the right of the phone header.

---

### 3. Checkout & Payment Flow

The checkout flow is a linear sequence that captures lead data before opening the payment modal — ensuring contact information is secured even on abandoned checkouts.

| Step 1 | Step 2 | Step 3 | Step 4 | Step 5 |
|---|---|---|---|---|
| **Click CTA** | **Modal Opens** | **Lead Captured** | **Razorpay** | **Success** |
| User clicks `GET AUTOADMISSIONS FREE` or nav button | Checkout modal with Name, Email, Phone, Designation | Google Sheets + Meta CAPI 'Lead' event triggered | Secure payment modal — ₹399 INR | Redirect to `thankyou.html` |

#### Razorpay Options Configuration
Orchestrated inside `script.js`:

```javascript
var options = {
    "key":         "rzp_live_SqKJKhltZYuB9N",
    "amount":      "39900",  // paise — ₹399 = 39900
    "currency":    "INR",
    "name":        "AutoAdmissions",
    "description": "AutoAdmissions Template",
    "handler": function (response) {
        window.location.href = "thankyou.html";
    },
    "prefill": { "name": name, "email": email, "contact": phone },
    "theme": { "color": "#25D366" }
};
```

---

### 4. Google Sheets Lead Integration

Leads are captured immediately before opening the payment modal. This secures contact information even if a checkout is abandoned mid-flow.

#### Setup Instructions
1. Create a Google Apps Script project connected to your Google Sheet.
2. Deploy with **Execute as: Me** and **Who has access: Anyone**.
3. Copy the deployed Web App URL.
4. Paste it into `script.js` at line 121 (variable `googleWebAppUrl`).

#### Apps Script — doPost Handler
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  try {
    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();
    // Appends: Timestamp | Name | Email | Phone | Designation
    sheet.appendRow([timestamp, data.name, data.email, data.phone, data.designation]);
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### 5. Analytics & Pixel Tracking

Tracking uses a Hybrid Client + Server (CAPI) approach to bypass ad-blockers and maintain data reliability across the full funnel.

#### Client-Side Pixels
* **Meta Pixel — PageView**: Fired automatically on window load.
* **Meta Pixel — Purchase**: Fired on `thankyou.html` with value `399.00 INR`.
* **Microsoft Clarity**: Script tags load recording engine `wotnjoj5v0` for behaviour tracking.

#### Serverless Meta Conversions API (CAPI)
Located in `api/capi.js`. Executes in serverless environments (Vercel) to forward events securely to Meta's servers.

#### User Data Hashing — Security Compliance
Raw emails (`em`), phone numbers (`ph`), and first/last names (`fn`/`ln`) are hashed using SHA-256 before delivery to comply with Meta's security and privacy guidelines.

#### CAPI Serverless Handler — `api/capi.js`
```javascript
const crypto = require('crypto');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method Not Allowed' });

    const { event_name, event_url, user_data } = req.body;
    const PIXEL_ID     = '949207904646111';
    const ACCESS_TOKEN = 'EAANxZBmUZA9...';  // Long-lived access token

    const hash = (val) => val
        ? crypto.createHash('sha256').update(val.toLowerCase().trim()).digest('hex')
        : undefined;

    const formattedUserData = {
        client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        client_user_agent:  req.headers['user-agent'],
    };

    if (user_data) {
        if (user_data.email) formattedUserData.em = hash(user_data.email);
        if (user_data.phone) formattedUserData.ph = hash(user_data.phone.replace(/\D/g, ''));
        if (user_data.name) {
            const parts = user_data.name.split(' ');
            formattedUserData.fn = hash(parts[0]);
            if (parts.length > 1) formattedUserData.ln = hash(parts[parts.length - 1]);
        }
    }

    const payload = { data: [{
        event_name:       event_name || 'Lead',
        event_time:       Math.floor(Date.now() / 1000),
        event_source_url: event_url || req.headers.referer,
        action_source:    'web',
        user_data:        formattedUserData,
    }]};

    try {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload) }
        );
        const result = await response.json();
        return res.status(200).json({ success: true, result });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
```

---

### 6. Local Development Setup

To test the full capability including the Meta CAPI mock handler local routes, run a Node.js web server from the project root.

#### Option A — Node.js Mock Server (Recommended)
Serves static assets and processes `/api/capi` calls. Mirrors the Vercel production environment locally.

```bash
# Step 1: Ensure Node.js is installed
node -v

# Step 2: Run the local server from project root
node local-server.js

# Step 3: Open in browser
# http://localhost:3000
```

#### Option B — Python Server (Static Assets Only)
Use this if you only need static asset review without mock serverless backend processing.

```bash
# Serve static files only (no CAPI mock)
python -m http.server 8080

# Open in browser
# http://localhost:8080
```

> [!NOTE]
> Option B does not process `/api/capi` routes. Use Option A for full end-to-end local testing including Google Sheets and Meta CAPI event simulation.

---

AutoAdmissions Development Guide  |  inquirybooster  |  Confidential
