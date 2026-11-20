/**
 * Landing pages for the Receipt Scanner & Tax Expenses app (US and UK self-employed).
 * Section bodies are trusted HTML written in this file and are rendered by
 * src/components/ReceiptLandingPage.astro. Keep claims in line with the Google Play listing.
 */

export interface ReceiptSection {
  heading: string;
  html: string;
}

export interface ReceiptPage {
  slug: string;
  /** <title> text. */
  metaTitle: string;
  description: string;
  h1: string;
  intro: string;
  sections: ReceiptSection[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
  published: string;
}

const PACKAGE = "com.pauldigital.receiptscanner";

/** Play Store link with a per-page referrer so Play Console shows which page produced installs. */
export const receiptPlayUrl = (campaign: string) =>
  `https://play.google.com/store/apps/details?id=${PACKAGE}&referrer=${encodeURIComponent(
    `utm_source=pauldigital.dev&utm_medium=web&utm_campaign=${campaign}`,
  )}`;

const disclaimer =
  "Receipt Scanner & Tax Expenses helps you organise records. It does not give tax advice, so check your figures with an accountant or the official tax authority guidance for your country.";

export const receiptPages: ReceiptPage[] = [
  {
    slug: "receipt-scanner",
    metaTitle: "Receipt Scanner & Tax Expenses App for Self-Employed (US & UK)",
    description:
      "Scan receipts, log mileage and export tax-ready records. Private, offline, no account and no subscription. Free on Android for US and UK self-employed people.",
    h1: "Receipt Scanner & Tax Expenses: simple records for the self-employed",
    intro:
      "Keep your receipts, expenses and mileage ready for tax time. Scan a receipt, let the app read it, and export clean records for your accountant. Private, offline, no account and no subscription.",
    published: "2026-11-19",
    sections: [
      {
        heading: "What the app does",
        html: `<ul>
<li><strong>Scan receipts</strong> with the camera, or import photos and PDFs. Auto-capture, auto-crop and a torch help in dim light.</li>
<li><strong>Reads the details</strong> on your phone: total, date, vendor and tip.</li>
<li><strong>Organise</strong> with categories, folders and search. Swipe cards to sort business from personal quickly.</li>
<li><strong>Track income</strong> as well as expenses, with budgets and monthly summaries and a duplicate finder.</li>
<li><strong>Mileage log</strong> using IRS rates (US) or HMRC rates (UK). You enter trips yourself; the app never tracks your location.</li>
<li><strong>Export</strong> to CSV for free, or to a PDF summary, a PDF report with receipt photos, Excel or a ZIP.</li>
</ul>`,
      },
      {
        heading: "Made for the US and the UK",
        html: `<h3>United States</h3>
<ul>
<li>Calendar-year reports for your tax return.</li>
<li>Mileage deduction using the IRS rate.</li>
<li>Suits freelancers, contractors, gig workers and landlords.</li>
</ul>
<h3>United Kingdom</h3>
<ul>
<li>Reports by UK tax year, which starts on 6 April.</li>
<li>Mileage using HMRC rates.</li>
<li>Suits sole traders, contractors and small business owners.</li>
</ul>
<p>You can also keep records for more than one business in the same app.</p>`,
      },
      {
        heading: "Private by design",
        html: `<p>There is no account, no cloud and no bank or email linking. Your receipts stay on your phone. You can back up to a folder, Google Drive or email whenever you choose. See the <a href="/privacy/">Paul Digital privacy policy</a> and the app's Google Play listing for the full detail of what the app processes.</p>`,
      },
      {
        heading: "Pricing: one payment, not a subscription",
        html: `<p>Scanning, receipts, search, folders, categories, CSV export and backup are free forever. You can try everything free for 14 days. After that, Premium is a single payment, not a subscription. It unlocks batch scan, PDF, Excel and ZIP export, extra trips and businesses, and custom file names. Your first PDF, Excel or ZIP export is free.</p>
<p>For a longer look at what that means for a small business, read <a href="/expense-tracker-no-subscription/">expense tracker with no subscription</a>.</p>`,
      },
      {
        heading: "Related guides",
        html: `<ul>
<li><a href="/mileage-log-app/">Mileage log app for self-employed (IRS and HMRC)</a></li>
<li><a href="/self-employed-receipts-guide/">Which receipts should a self-employed person keep?</a></li>
<li><a href="/apps/receipt-scanner/">App details and package information</a></li>
</ul>`,
      },
    ],
    faqs: [
      { q: "Do I need to create an account?", a: "No. Everything works without signing up." },
      { q: "Does it work offline?", a: "Yes. Text recognition runs on your device, so scanning does not need a data connection." },
      { q: "Is it a monthly subscription?", a: "No. Premium is a one-time payment. The core features stay free." },
      { q: "Does it track my location for mileage?", a: "No. You enter trips yourself. The app never tracks your location." },
      { q: "How accurate is the text recognition?", a: "It is good but not perfect. Check the amount and date before you export." },
      { q: "Does the app give tax advice?", a: disclaimer },
      { q: "Which phones does it work on?", a: "Android phones, through Google Play." },
    ],
    related: [
      { href: "/apps/receipt-scanner/", label: "Receipt Scanner app details" },
      { href: "/guides/", label: "All guides" },
    ],
  },
  {
    slug: "mileage-log-app",
    metaTitle: "Mileage Log App for Self-Employed: IRS and HMRC Rates",
    description:
      "How to keep a simple business mileage log for US (IRS) or UK (HMRC) tax, what to record for each trip, and a private Android app that does it without tracking your location.",
    h1: "Mileage log app for the self-employed (IRS and HMRC)",
    intro:
      "If you drive for work, a good mileage log can turn into a real deduction. Here is what to record, how the US and UK approaches differ, and how to keep the log without handing over your location.",
    published: "2026-11-19",
    sections: [
      {
        heading: "Why keep a mileage log at all",
        html: `<p>Self-employed people in both the US and the UK can usually claim a deduction for business driving. The tax authorities expect you to back the claim with a record made at the time, not a rough guess at the end of the year. A simple log of dates, destinations, purposes and miles is what makes the claim defensible if you are ever asked.</p>
<p>It also helps you. A running total tells you how much business driving you are really doing, which is useful when you set your prices.</p>`,
      },
      {
        heading: "What to record for every trip",
        html: `<ul>
<li><strong>Date</strong> of the trip.</li>
<li><strong>Where from and where to</strong>, or a short description of the route.</li>
<li><strong>Business purpose</strong>, such as "client meeting" or "supplier pickup".</li>
<li><strong>Miles driven</strong> for the trip, taken from your odometer or a map.</li>
<li><strong>Odometer readings</strong> at the start and end of the year, so total and business miles can be compared.</li>
</ul>
<p>Commuting between home and a regular workplace is generally not treated as business mileage, so keep it out of the log unless the official guidance for your situation says otherwise.</p>`,
      },
      {
        heading: "US (IRS) and UK (HMRC) at a glance",
        html: `<h3>United States</h3>
<p>Many self-employed people use the IRS standard mileage rate, a per-mile amount that the IRS sets and can change each year. You multiply your business miles by the current rate instead of tracking every fuel and repair receipt. The records you keep (dates, mileage and purpose) support the figure on your return. Check the current rate and the rules for your situation with the IRS or a tax professional.</p>
<h3>United Kingdom</h3>
<p>Sole traders can usually use HMRC's simplified expenses, which pay a set rate per business mile for cars and vans, with different rates for other vehicles. Reporting follows the UK tax year, which starts on 6 April. Check the current HMRC rates and your eligibility with HMRC or an accountant.</p>
<p>In both countries the exact rate changes over time, so the app applies the IRS or HMRC rates for you instead of leaving you to remember them.</p>`,
      },
      {
        heading: "Keeping the log with Receipt Scanner & Tax Expenses",
        html: `<p>The app includes a mileage log next to your receipts and expenses. You log trips yourself and get the deduction using IRS rates for the US or HMRC rates for the UK. It never tracks your location: you enter the trip, so there is no background GPS and nothing to switch on.</p>
<p>Because it also stores your receipts, categories and reports, the mileage deduction ends up in the same export you send your accountant. Extra trips beyond the free limit are part of Premium, which is a single payment rather than a subscription.</p>
<p><em>${disclaimer}</em></p>`,
      },
    ],
    faqs: [
      { q: "Does the app track my location to log mileage?", a: "No. You enter each trip yourself, and the app never tracks your location." },
      { q: "Does it support both IRS and HMRC mileage rates?", a: "Yes. It uses IRS rates for the US and HMRC rates for the UK." },
      { q: "Can I keep a US calendar year or a UK tax year?", a: "Yes. You can report by US calendar year or by the UK tax year, which starts on 6 April." },
      { q: "Is the mileage log free?", a: "Logging trips is included, and extra trips beyond the free limit are part of the one-time Premium payment." },
      { q: "Is this tax advice?", a: disclaimer },
    ],
    related: [
      { href: "/receipt-scanner/", label: "Receipt Scanner & Tax Expenses" },
      { href: "/self-employed-receipts-guide/", label: "Which receipts should a self-employed person keep?" },
    ],
  },
  {
    slug: "self-employed-receipts-guide",
    metaTitle: "Which Receipts Should a Self-Employed Person Keep? (US & UK)",
    description:
      "A plain guide to the receipts and records freelancers, contractors and sole traders should keep, how long to keep them, and an easy way to store them.",
    h1: "Which receipts should a self-employed person keep?",
    intro:
      "A shoebox of faded receipts is a poor record. This guide covers what to keep, what to write down at the time, and how long records are usually held in the US and the UK.",
    published: "2026-11-19",
    sections: [
      {
        heading: "The basic rule",
        html: `<p>Keep a record for every business expense you plan to deduct. A receipt, invoice or bank statement entry shows that the spending happened, how much it was and what it was for. If you cannot show that, an expense you claimed can be disallowed.</p>
<p>Keep records of your <strong>income</strong> as well: invoices you issued, payment confirmations and any statements from platforms that pay you.</p>`,
      },
      {
        heading: "Common receipts worth keeping",
        html: `<ul>
<li>Equipment and tools, including phones, laptops and software.</li>
<li>Supplies and materials used for your work.</li>
<li>Travel for work, such as fares, parking and tolls (alongside your <a href="/mileage-log-app/">mileage log</a> for your own vehicle).</li>
<li>Professional fees, subscriptions and insurance.</li>
<li>Marketing, such as a website, advertising and business cards.</li>
<li>Part of your home costs if you work from home, where the rules in your country allow it.</li>
</ul>
<p>Rules about what counts as deductible differ between the US and the UK and depend on your situation, so treat this list as a prompt for what to collect, not a ruling on what you can claim.</p>`,
      },
      {
        heading: "What to note when you scan a receipt",
        html: `<ul>
<li>The <strong>date</strong>, <strong>vendor</strong> and <strong>total</strong>, including any tip or tax shown.</li>
<li>The <strong>business purpose</strong>, in a few words, especially for meals and travel.</li>
<li>Whether it was <strong>business or personal</strong>, if the receipt mixes both.</li>
</ul>
<p>Thermal paper receipts fade, sometimes within months. Scanning them soon after you receive them keeps a readable copy.</p>`,
      },
      {
        heading: "How long to keep records",
        html: `<p>Retention periods are set by each tax authority and can depend on your circumstances. As a general idea, US guidance commonly points to keeping records for several years after you file, and HMRC asks self-employed people to keep records for several years after the relevant filing deadline. Because the exact period can vary, check the current guidance from the IRS or HMRC, or ask your accountant, before you discard anything.</p>`,
      },
      {
        heading: "An easy way to keep them",
        html: `<p>Receipt Scanner &amp; Tax Expenses lets you scan a receipt with your phone camera or import a photo or PDF, reads the total, date and vendor on the device, and files it in a category or folder. You can sort business from personal with a swipe, search later, and export a CSV, PDF, Excel or ZIP with the receipt photos when your accountant asks. It works offline with no account, and your receipts stay on your phone.</p>
<p><em>${disclaimer}</em></p>`,
      },
    ],
    faqs: [
      { q: "Do I need the paper receipt if I have a photo?", a: "Rules differ by country and by situation, so check the guidance from your tax authority. A clear scan stored safely is a common way to keep records, and it avoids faded paper." },
      { q: "Should I keep receipts for personal purchases?", a: "Only business expenses need to be tracked for deductions. If a receipt mixes business and personal items, note which part was for business." },
      { q: "What if the receipt is lost?", a: "A bank or card statement and a note of what the expense was for can help, but it is weaker evidence than the receipt. Ask your accountant how to handle it." },
      { q: "Is this tax advice?", a: disclaimer },
    ],
    related: [
      { href: "/receipt-scanner/", label: "Receipt Scanner & Tax Expenses" },
      { href: "/mileage-log-app/", label: "Mileage log app (IRS and HMRC)" },
      { href: "/guides/scan-documents-with-your-phone/", label: "Guide: scanning documents with your phone" },
    ],
  },
  {
    slug: "expense-tracker-no-subscription",
    metaTitle: "Expense Tracker With No Subscription: One-Time Payment, Private",
    description:
      "Looking for an expense tracker without a monthly fee? Here is what to check, what a one-time payment covers, and how Receipt Scanner & Tax Expenses works with no account.",
    h1: "An expense tracker with no subscription",
    intro:
      "Many expense apps charge every month for something you only need a few times a year. Here is what to look for in a simple tracker, and how a one-time payment compares.",
    published: "2026-11-19",
    sections: [
      {
        heading: "Why people look for an app without a subscription",
        html: `<p>Expense tracking is steady, low-volume work: scan a receipt now and then, and pull a report at tax time. A monthly fee for that can add up to more than the app is worth, especially for a freelancer or a side business with a small number of expenses.</p>
<p>Many people also prefer not to link a bank account or email, or to create yet another account just to keep their own records.</p>`,
      },
      {
        heading: "What to check before you choose",
        html: `<ul>
<li><strong>What is free?</strong> Can you scan, search and export your data without paying?</li>
<li><strong>What does the paid plan unlock?</strong> Look for it to be features you may genuinely need, not the basics.</li>
<li><strong>Is it a subscription or a single payment?</strong> Check the Google Play listing for in-app purchases.</li>
<li><strong>Where is your data stored?</strong> On your phone, or on someone else's servers?</li>
<li><strong>Can you get your data out?</strong> Export to CSV, PDF or Excel means you are never locked in.</li>
<li><strong>Does it match your tax year?</strong> US calendar year and the UK tax year starting 6 April are different.</li>
</ul>`,
      },
      {
        heading: "How Receipt Scanner & Tax Expenses is priced",
        html: `<p>Scanning, receipts, search, folders, categories, CSV export and backup are free forever. You can try everything free for 14 days. After that, Premium is a single payment, not a subscription. It unlocks batch scan, PDF, Excel and ZIP export, extra trips and businesses, and custom file names. Your first PDF, Excel or ZIP export is free, so you can see the result before deciding.</p>
<p>The app works offline with no account, and it does not link to your bank or email. Receipts stay on your phone, and you can back up to a folder, Google Drive or email when you choose.</p>`,
      },
      {
        heading: "Who it suits, and who it may not",
        html: `<p>It suits freelancers, contractors, gig workers, sole traders, small business owners and landlords in the US and UK who want simple, private records without a monthly fee.</p>
<p>It may not suit a team that needs shared access, automatic bank feeds or full accounting software. It organises records for you and your accountant; it is not an accounting package.</p>
<p><em>${disclaimer}</em></p>`,
      },
    ],
    faqs: [
      { q: "Is there really no monthly fee?", a: "Correct. Premium is a single payment, not a subscription, and the core features are free." },
      { q: "What do I get for free?", a: "Scanning, receipts, search, folders, categories, CSV export and backup are free forever." },
      { q: "Can I try Premium first?", a: "Yes. You can try everything free for 14 days, and your first PDF, Excel or ZIP export is free." },
      { q: "Does it link to my bank account?", a: "No. There is no account, no cloud, and no bank or email linking." },
      { q: "Is this tax advice?", a: disclaimer },
    ],
    related: [
      { href: "/receipt-scanner/", label: "Receipt Scanner & Tax Expenses" },
      { href: "/self-employed-receipts-guide/", label: "Which receipts should a self-employed person keep?" },
    ],
  },
];

export const receiptPageBySlug = (slug: string): ReceiptPage => {
  const page = receiptPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown receipt page: ${slug}`);
  return page;
};
