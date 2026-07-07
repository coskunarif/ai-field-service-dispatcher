# Handoff Report: Milestone 2 Landing Page Analysis & Metadata Fixes

## 1. Observation

During read-only investigation, the following 14 HTML pages direct under the project root `/home/ubuntuadmin/projects/ai-field-service-dispatcher` were analyzed:
*   `garage-door-dispatch-software.html`
*   `roofing-dispatch-software.html`
*   `locksmith-dispatch-software.html`
*   `pool-service-dispatch-software.html`
*   `commercial-facilities-dispatch-software.html`
*   `septic-service-dispatch-software.html`
*   `restoration-job-management-software.html`
*   `handyman-dispatch-software.html`
*   `carpet-cleaning-dispatch-software.html`
*   `tree-service-dispatch-software.html`
*   `mobile-dispatch-board.html`
*   `index.html`
*   `pressure-washing-dispatch-software.html`
*   `junk-removal-dispatch-software.html`

A Python script `/tmp/inspect_pages.py` was written and run on the landing pages to parse their title tags, Facebook Open Graph titles (`og:title`), Twitter card titles (`twitter:title`), and to count the existing Q&As in the `FAQPage` JSON-LD schema blocks.

### Findings on Metadata Titles:
1.  **Index/Home Page (`index.html`)**: Has no Open Graph (`og:`) or Twitter card metadata tags under its `<head>` section.
    *   Line 6: `<title>Gainhelm | App-Less AI Dispatch Software for Field Services</title>`
    *   No `og:title` or `twitter:title` found.
2.  **HTML-escaped entities in meta titles**: 10 landing pages contain `&amp;` in their `og:title` and `twitter:title` content attributes, which does not match their main page `<title>` tag exactly (which contains literal `&`).
    *   `garage-door-dispatch-software.html`:
        *   Line 6: `<title>Garage Door Dispatch & Scheduling Software | Gainhelm</title>`
        *   Line 12: `<meta property="og:title" content="Garage Door Dispatch &amp; Scheduling Software | Gainhelm">`
        *   Line 15: `<meta name="twitter:title" content="Garage Door Dispatch &amp; Scheduling Software | Gainhelm">`
    *   The same mismatch pattern (literal `&` in `<title>` vs `&amp;` in `<meta>` content) was observed in:
        *   `roofing-dispatch-software.html` (Lines 6, 12, 15)
        *   `locksmith-dispatch-software.html` (Lines 6, 12, 15)
        *   `pool-service-dispatch-software.html` (Lines 6, 12, 15)
        *   `commercial-facilities-dispatch-software.html` (Lines 6, 12, 15)
        *   `septic-service-dispatch-software.html` (Lines 6, 12, 15)
        *   `restoration-job-management-software.html` (Lines 6, 12, 15)
        *   `handyman-dispatch-software.html` (Lines 6, 12, 15)
        *   `carpet-cleaning-dispatch-software.html` (Lines 6, 12, 15)
        *   `tree-service-dispatch-software.html` (Lines 6, 12, 15)
3.  **Correct metadata matches**:
    *   `mobile-dispatch-board.html`: Matches title tag exactly (literal `&` used everywhere).
    *   `pressure-washing-dispatch-software.html`: Matches title tag exactly (literal `&` used everywhere).
    *   `junk-removal-dispatch-software.html`: Matches title tag exactly (literal `&` used everywhere).

### Findings on JSON-LD FAQPage Blocks:
1.  **Missing FAQPage blocks**: The following 12 pages completely lack any `FAQPage` block inside their `application/ld+json` script:
    *   `garage-door-dispatch-software.html`
    *   `roofing-dispatch-software.html`
    *   `locksmith-dispatch-software.html`
    *   `pool-service-dispatch-software.html`
    *   `commercial-facilities-dispatch-software.html`
    *   `septic-service-dispatch-software.html`
    *   `restoration-job-management-software.html`
    *   `handyman-dispatch-software.html`
    *   `carpet-cleaning-dispatch-software.html`
    *   `tree-service-dispatch-software.html`
    *   `mobile-dispatch-board.html`
    *   `index.html`
2.  **Insufficient/generic trade Q&As**:
    *   `pressure-washing-dispatch-software.html` and `junk-removal-dispatch-software.html` have 3 Q&As in their `FAQPage` block, but only 2 of those questions are specifically tailored to their respective trade. The second Q&A is generic regarding "app-less SMS updates for technicians" and lacks trade-specific mentions.

---

## 2. Logic Chain

1.  **Meta Tag Alignments**:
    *   The main `<title>` tag represents the canonical title. Search engines and crawlers expect `og:title` and `twitter:title` to match the `<title>` exactly to avoid indexing inconsistencies.
    *   We observed that 10 landing pages use `&amp;` in their metadata content while `<title>` has literal `&`.
    *   Additionally, `index.html` lacks these tags entirely.
    *   *Conclusion*: We must propose replacements for the 10 files using the literal `&` character, and propose adding the full tags to `index.html`.

2.  **FAQ Schema Enhancement**:
    *   To boost local SEO/schema optimization for the landing pages, we need at least 3 trade-specific or page-specific Q&As per page.
    *   We observed that 12 pages have 0 FAQs, and 2 pages have only 2 trade-specific Q&As.
    *   *Conclusion*: We must construct brand new `FAQPage` JSON-LD structures for the 12 files and update the `FAQPage` nodes for `pressure-washing-dispatch-software.html` and `junk-removal-dispatch-software.html` to guarantee 3 highly trade-specific questions.

---

## 3. Caveats

*   No source files in the project were modified. The analysis is read-only.
*   The page-specific URL IDs in the schema represent canonical paths (e.g. `https://gainhelm.com/garage-door-dispatch-software#faq`).

---

## 4. Conclusion & Proposed Changes

Below are the exact proposed code modifications for the implementer agent.

### A. Title Metadata Corrections

#### For the following 10 landing pages:
*   `garage-door-dispatch-software.html` (Lines 12 & 15)
*   `roofing-dispatch-software.html` (Lines 12 & 15)
*   `locksmith-dispatch-software.html` (Lines 12 & 15)
*   `pool-service-dispatch-software.html` (Lines 12 & 15)
*   `commercial-facilities-dispatch-software.html` (Lines 12 & 15)
*   `septic-service-dispatch-software.html` (Lines 12 & 15)
*   `restoration-job-management-software.html` (Lines 12 & 15)
*   `handyman-dispatch-software.html` (Lines 12 & 15)
*   `carpet-cleaning-dispatch-software.html` (Lines 12 & 15)
*   `tree-service-dispatch-software.html` (Lines 12 & 15)

**Change:**
```html
<!-- BEFORE -->
<meta property="og:title" content="[Page Title] &amp; [Suffix] | Gainhelm">
<meta name="twitter:title" content="[Page Title] &amp; [Suffix] | Gainhelm">

<!-- AFTER -->
<meta property="og:title" content="[Page Title] & [Suffix] | Gainhelm">
<meta name="twitter:title" content="[Page Title] & [Suffix] | Gainhelm">
```
*(Replace the `&amp;` with literal `&` inside the meta content attributes).*

#### For `index.html`:
Insert the following tags under the `<head>` section immediately after line 7 (`<meta name="description" ... />`):
```html
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://gainhelm.com/">
    <meta property="og:title" content="Gainhelm | App-Less AI Dispatch Software for Field Services">
    <meta property="og:description" content="Tired of complex field service apps techs hate using? Gainhelm offers 100% app-less SMS/WhatsApp AI dispatching integrated with Google Calendar. Join the waitlist today.">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Gainhelm | App-Less AI Dispatch Software for Field Services">
    <meta name="twitter:description" content="Tired of complex field service apps techs hate using? Gainhelm offers 100% app-less SMS/WhatsApp AI dispatching integrated with Google Calendar. Join the waitlist today.">
```

---

### B. FAQPage Schema Additions/Modifications

For all trade landing pages, the FAQPage node should be appended inside the `@graph` block array of the JSON-LD script (after the `SoftwareApplication` node).

#### 1. `garage-door-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/garage-door-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for garage door service teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for small garage door service and repair teams to coordinate technician schedules and dispatch jobs via SMS or WhatsApp without complex apps."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use Gainhelm to dispatch emergency garage door repair calls?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Since Gainhelm sends direct text dispatches to technicians, dispatchers can immediately assign urgent service calls—like broken springs or stuck commercial doors—and update the schedule in real time."
          }
        },
        {
          "@type": "Question",
          "name": "How does the SMS simulator help my garage door technicians?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The interactive simulator lets you test how office dispatchers send work orders and how garage door techs respond with status updates (e.g., job started, completed, or needing parts) via text messaging."
          }
        }
      ]
    }
```

#### 2. `roofing-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/roofing-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for roofing contractors?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for small roofing crews to schedule repair calls, assign estimators, and coordinate field technicians using standard SMS or WhatsApp text messages."
          }
        },
        {
          "@type": "Question",
          "name": "Does Gainhelm support roofing crew and team scheduling?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Gainhelm helps dispatchers schedule roof inspections, leak repairs, and estimator visits, assigning them directly to field crews via text messages that sync with a shared Google Calendar."
          }
        },
        {
          "@type": "Question",
          "name": "How does Gainhelm improve field-to-office communication for roofing repairs?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Roofing technicians can confirm receipt of work orders, report job starts, and submit notes back to the office simply by replying to their automated SMS dispatch notifications."
          }
        }
      ]
    }
```

#### 3. `locksmith-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/locksmith-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for locksmith service teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for locksmith teams to manage service calls, schedule jobs, and send dispatches to technicians via standard SMS text messaging."
          }
        },
        {
          "@type": "Question",
          "name": "How does Gainhelm handle emergency lockout dispatches?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dispatchers can create a job on the visual board, assign it to a locksmith, and trigger an automated SMS message containing client info and job address. The technician can immediately reply to accept the job, keeping response times short."
          }
        },
        {
          "@type": "Question",
          "name": "Can locksmiths update the status of lock installation or key cutting jobs via SMS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Technicians can send simple code or text replies (like 'start' or 'done') to update the dispatch board automatically, allowing office staff to see real-time progress without phone calls."
          }
        }
      ]
    }
```

#### 4. `pool-service-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/pool-service-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for pool service teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for pool cleaning and maintenance teams to coordinate schedules and send job dispatches to pool techs via SMS or WhatsApp text messages."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use Gainhelm to dispatch recurring pool maintenance routes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Gainhelm helps dispatchers schedule weekly or bi-weekly pool cleanings, repair visits, and chemical checks, assigning them on the visual board and sending automated SMS details to pool technicians."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Google Calendar integration benefit pool service technicians?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Scheduled pool jobs appear instantly on the team's Google Calendar. As pool techs send SMS status updates (e.g., job completed, chemical readings noted), the updates sync back in real time."
          }
        }
      ]
    }
```

#### 5. `commercial-facilities-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/commercial-facilities-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for commercial facilities maintenance teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for facility maintenance managers and technicians to assign, receive, and update work orders via standard SMS text messages."
          }
        },
        {
          "@type": "Question",
          "name": "How does Gainhelm simplify dispatcher-to-technician handoffs for commercial properties?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dispatchers enter facility work orders on a central scheduling board, which instantly triggers an SMS notification to the assigned technician with the location, task details, and emergency instructions."
          }
        },
        {
          "@type": "Question",
          "name": "Can facility technicians report job completion or request follow-ups via text?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Technicians can text status updates directly from their mobile phones. These updates automatically update the dispatch board and sync with your Google Calendar, eliminating phone tag."
          }
        }
      ]
    }
```

#### 6. `septic-service-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/septic-service-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for septic service teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for septic tank pumping and repair teams to coordinate daily jobs and dispatch technicians via standard SMS text messaging."
          }
        },
        {
          "@type": "Question",
          "name": "How does Gainhelm coordinate septic tank pumpings and emergencies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dispatchers plot residential and commercial septic pumpings on a visual board. Urgent backups can be scheduled instantly, automatically sending client details and property addresses to pump truck operators via text."
          }
        },
        {
          "@type": "Question",
          "name": "Can septic pump operators log disposal notes or job statuses via text?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Field operators can send short SMS replies to log arrival, completion, or notes like gallon counts. These updates automatically populate on the office dispatch board."
          }
        }
      ]
    }
```

#### 7. `restoration-job-management-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/restoration-job-management-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for restoration teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for water, fire, and mold restoration crews to manage emergency job dispatches and coordinate technician assignments using standard SMS text messages."
          }
        },
        {
          "@type": "Question",
          "name": "How does Gainhelm assist with emergency restoration dispatch?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For urgent disaster calls, dispatchers can immediately schedule crews and send automated text messages with critical job information and restoration instructions. Technicians can instantly reply to confirm they are en route."
          }
        },
        {
          "@type": "Question",
          "name": "Can restoration technicians submit notes and job status updates via text?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Technicians can text back simple commands (like 'start' or 'done') and add job notes, which sync immediately with the office dispatch board and Google Calendar to keep stakeholders informed."
          }
        }
      ]
    }
```

#### 8. `handyman-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/handyman-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for handyman businesses?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for handyman teams and independent contractors to schedule jobs and send dispatches to techs via SMS text messages."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use Gainhelm to dispatch same-day handyman work orders?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Dispatchers can easily reschedule and assign urgent work orders on the visual board, automatically texting job details and client info to handyman technicians instantly."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Google Calendar integration assist handyman teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "All scheduled repair jobs and estimates appear on your shared Google Calendar, and technicians' status updates sent via text messages sync automatically in real time to keep everyone aligned."
          }
        }
      ]
    }
```

#### 9. `carpet-cleaning-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/carpet-cleaning-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for carpet cleaning teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for carpet and upholstery cleaning crews to manage service calls and send dispatches to technicians via standard SMS text messaging."
          }
        },
        {
          "@type": "Question",
          "name": "How does Gainhelm organize carpet cleaning appointments?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dispatchers plan visits on the visual board and assign technicians. Automated SMS dispatches are sent directly to the carpet cleaners' phones with details on room counts and cleaning types."
          }
        },
        {
          "@type": "Question",
          "name": "Can carpet cleaning crews update job statuses directly from customer locations?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Technicians can text back simple updates (e.g., job started, completed, or notes on extra services). These status updates automatically sync with the shared Google Calendar and the office dispatch board."
          }
        }
      ]
    }
```

#### 10. `tree-service-dispatch-software.html` (Insert after line 78, add comma on line 78)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/tree-service-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for tree service crews?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for tree care and tree removal teams to coordinate arborist schedules and send job dispatches via standard SMS text messaging."
          }
        },
        {
          "@type": "Question",
          "name": "Can I dispatch same-day emergency tree service visits?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. In the event of storm damage or fallen trees, dispatchers can immediately assign urgent service calls on the visual board, sending automated text dispatches to crews in the field without any app lag."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Google Calendar integration assist tree service dispatchers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Scheduled tree service jobs populate directly on Google Calendar. Status updates and job completion notes sent via SMS from the field operators sync back in real time to the office."
          }
        }
      ]
    }
```

#### 11. `mobile-dispatch-board.html` (Insert after line 95, add comma on line 95)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/mobile-dispatch-board#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm's mobile dispatch board?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm's mobile dispatch board is a lightweight, responsive interface optimized for iPad and tablet screens that allows field service managers and dispatchers to schedule calls, assign technicians, and track jobs on the go."
          }
        },
        {
          "@type": "Question",
          "name": "Does the mobile dispatch board require an iPad app download?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Gainhelm runs in any standard mobile browser, making it 100% app-less. You get a full visual dispatch board on your iPad or tablet without downloading or updating App Store software."
          }
        },
        {
          "@type": "Question",
          "name": "How does the mobile board send dispatch updates to technicians?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "When you schedule or update a job on the iPad board, Gainhelm automatically triggers an SMS or WhatsApp message directly to the technician's mobile phone with all relevant details."
          }
        }
      ]
    }
```

#### 12. `index.html` (Insert after line 67, add comma on line 67)
```json
    ,
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less AI dispatch and scheduling software designed for small field service teams to coordinate jobs, assign technicians, and reduce phone tag via automated SMS text messaging."
          }
        },
        {
          "@type": "Question",
          "name": "How does the app-less SMS dispatching work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Instead of requiring technicians to install a mobile app, Gainhelm dispatches job details directly to their phones via standard SMS or WhatsApp messages. Technicians can reply with simple texts to update their status."
          }
        },
        {
          "@type": "Question",
          "name": "Does Gainhelm integrate with Google Calendar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Gainhelm syncs directly with Google Calendar, allowing office dispatchers to manage scheduling from their calendar while automatically sending and updating dispatches to technicians in the field."
          }
        },
        {
          "@type": "Question",
          "name": "Who is Gainhelm designed for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is built for small field service crews—such as HVAC, plumbing, locksmiths, and appliance repair teams—who want a cleaner, faster scheduling board than spreadsheets or text threads."
          }
        }
      ]
    }
```

#### 13. `pressure-washing-dispatch-software.html`
Replace the entire existing FAQPage block (lines 79–108) with the updated version that has 3 highly trade-specific Q&As:
```json
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/pressure-washing-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for pressure washing crews?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for small pressure washing and exterior cleaning teams to schedule jobs and manage technician assignments via SMS."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use Gainhelm to dispatch residential and commercial pressure washing jobs?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Gainhelm helps dispatchers schedule residential house washings, roof washings, or commercial concrete cleanings on the visual board, sending automated text details directly to crews in the field."
          }
        },
        {
          "@type": "Question",
          "name": "How does Google Calendar integration work for pressure washing teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Once configured, scheduled pressure washing jobs appear automatically on your Google Calendar, and status updates sent by technicians via text messages sync back in real time."
          }
        }
      ]
    }
```

#### 14. `junk-removal-dispatch-software.html`
Replace the entire existing FAQPage block (lines 79–108) with the updated version that has 3 highly trade-specific Q&As:
```json
    {
      "@type": "FAQPage",
      "@id": "https://gainhelm.com/junk-removal-dispatch-software#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Gainhelm for junk removal teams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gainhelm is a lightweight, app-less dispatch and scheduling tool designed for small junk removal and hauling teams to schedule pickups and manage truck crew assignments via SMS."
          }
        },
        {
          "@type": "Question",
          "name": "Can truck crews update junk removal job statuses via SMS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Truck crews can send simple SMS replies (like 'done' or 'loaded') to update their pickup progress, automatically updating the office dispatch board and syncing notes in real time."
          }
        },
        {
          "@type": "Question",
          "name": "How does Google Calendar integration work for junk removal pickups?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Once configured, scheduled junk removal pickups appear automatically on your Google Calendar, and status updates sync in real time."
          }
        }
      ]
    }
```

---

## 5. Verification Method

To verify the modifications:
1.  **Syntax Verification**: Ensure all HTML tags close correctly and that JSON blocks parse successfully as valid JSON after insertion.
2.  **SEO/JSON-LD Validation**:
    *   Run the command: `npm run audit:seo-geo` (runs `scripts/gainhelm-seo-geo-audit.mjs`) to verify that the SEO optimization status resolves correctly.
3.  **Visual Title Match Verification**:
    *   Inspect each file head section or use the following command to check that titles match exactly:
    ```bash
    python3 -c "
import re
for filename in ['garage-door-dispatch-software.html', 'roofing-dispatch-software.html', 'locksmith-dispatch-software.html', 'pool-service-dispatch-software.html', 'commercial-facilities-dispatch-software.html', 'septic-service-dispatch-software.html', 'restoration-job-management-software.html', 'handyman-dispatch-software.html', 'carpet-cleaning-dispatch-software.html', 'tree-service-dispatch-software.html', 'mobile-dispatch-board.html', 'index.html', 'pressure-washing-dispatch-software.html', 'junk-removal-dispatch-software.html']:
    with open(filename) as f:
        c = f.read()
    title = re.search(r'<title>(.*?)</title>', c).group(1)
    og = re.search(r'<meta property=\"og:title\" content=\"(.*?)\"', c).group(1)
    tw = re.search(r'<meta name=\"twitter:title\" content=\"(.*?)\"', c).group(1)
    print(filename, 'Match:', title == og == tw)
    "
    ```
4.  **Invalidation Conditions**: If any JSON syntax errors are introduced, or if `og:title` contains escaped HTML entities (like `&amp;`) while `<title>` has literal characters (like `&`), verification fails.
