import type { ToolArticle } from "./toolArticles";

/** Tool articles, part B: photo-for-forms, text, calculator and unit tools. */
export const toolArticlesB: ToolArticle[] = [
  {
    route: "/passport-photo-resizer/",
    title: "Preparing a photo before you crop it",
    sections: [
      {
        heading: "What a resizer can and cannot fix",
        html: `<p>This tool crops a portrait to the shape of the size you choose and exports it at that exact pixel size. A size such as 35 by 45 mm at 300 DPI works out to 413 by 531 pixels, and the page shows that calculation for each preset. What it cannot do is change the photo itself. If the background is cluttered, the lighting is uneven or the face is too small in the frame, the resized photo will have the same problems at a different size.</p>`,
      },
      {
        heading: "Take a better photo first",
        html: `<ul>
<li>Stand in front of a plain, light background, with soft light coming from the front and no shadow behind you.</li>
<li>Hold the camera at eye level and look straight into it, with a neutral expression.</li>
<li>Take the picture from about arm's length or further, and crop later. A very close photo can distort the face.</li>
<li>Keep the full head and shoulders in view so the crop box has room to move.</li>
</ul>
<p>A photo with more pixels crops better. If the area you select has fewer pixels than the output, the tool enlarges it and warns you, because an enlarged photo looks soft.</p>`,
      },
      {
        heading: "Size, file size and the official rules",
        html: `<p>The sizes in the list are commonly published sizes, not an official rulebook, and requirements change by country and by application type. Always compare the result with the issuer's current instructions: they usually also set head size and position, background colour, glasses and file type. For a file-size limit, enter the maximum in KB and use JPG or WebP; the tool lowers quality in steps and reports the real size, or says if it could not fit.</p>
<p>Related tools: <a href="/uk-passport-photo-digital/">UK passport photo (digital)</a>, <a href="/signature-resizer/">Signature Resizer</a> and the guide on <a href="/guides/photo-and-signature-size-for-online-forms/">photo and signature sizes for online forms</a>.</p>`,
      },
    ],
    faqs: [
      { q: "Should I use JPG or PNG?", a: "Use the format the application asks for. JPG is common for photos and lets the tool tune the file size. PNG is lossless, so its size cannot be tuned." },
      { q: "Can I enter a size in centimetres?", a: "Choose Custom size and enter pixels. Work out pixels as centimetres divided by 2.54, times the DPI. A size in millimetres works the same way after dividing by 25.4." },
      { q: "Why does the tool warn that my photo was enlarged?", a: "The area inside the crop box has fewer pixels than the size you chose. Use a larger original if you can, since enlarged photos look soft." },
    ],
  },
  {
    route: "/signature-resizer/",
    title: "Getting a clean signature image for a form",
    sections: [
      {
        heading: "Capture it well",
        html: `<p>The best signature images start on paper. Sign with a dark pen, preferably black or dark blue, on plain white paper with no lines. Take the photo in even daylight or scan it, holding the phone parallel to the page so the signature is not skewed. Shadows and creases are the most common reasons a signature looks dirty after resizing, and this tool does not remove backgrounds or shadows, so it is worth a second attempt at the photo.</p>`,
      },
      {
        heading: "Crop, rotate and size",
        html: `<p>Use Rotate if the photo is sideways, then crop tightly to the signature, leaving a small margin so no stroke is clipped. The crop box is locked to the shape of the output, so the signature is never stretched. The sizes in the list are examples that appear on some forms. They are not official requirements, so choose Custom size and enter exactly what your form states.</p>
<p>For a small file limit, use JPG with a maximum in KB; the tool lowers quality in steps and shows the real size. Use PNG when you want crisp edges and the file size does not matter.</p>`,
      },
      {
        heading: "Before you upload",
        html: `<ol>
<li>Zoom into the result and check that thin strokes are still visible.</li>
<li>Compare the pixel size and file size with the form's instructions.</li>
<li>Keep the original photo in case you need to try again.</li>
</ol>
<p>If your exam or job notice gives exact limits, the <a href="/government-job-photo-signature-resizer/">Government Job Photo and Signature Resizer</a> lets you set both a minimum and a maximum. For more on this topic read the guide on <a href="/guides/photo-and-signature-size-for-online-forms/">photo and signature sizes for online forms</a>, and use <a href="/image-compressor/">Image Compressor</a> if the file is still too large.</p>`,
      },
    ],
    faqs: [
      { q: "Can I use a digital signature drawn on a screen?", a: "You can, if you save it as an image. Export it with a plain background and then resize it here to the size the form asks for." },
      { q: "Why does my signature look blurry after resizing?", a: "The original may have too few pixels. Take a sharper photo or scan, and avoid enlarging a small signature." },
      { q: "Does the tool remove the paper background?", a: "No. It crops, rotates and resizes. A clean white sheet gives the best result." },
    ],
  },
  {
    route: "/government-job-photo-signature-resizer/",
    title: "Using a notice to set the right limits",
    sections: [
      {
        heading: "Read the notice, then type the numbers",
        html: `<p>Every recruitment body and every notification can set its own pixel size, file-size range and file type, and these change between cycles. That is why this page has no built-in presets: it asks you to copy the figures from the notice that applies to you. Look for the photo and signature section of the instructions, and write down the width and height in pixels, the minimum and maximum size in KB, and the allowed format.</p>
<p>Always use the current notice rather than an earlier year or a third-party website. For SSC and UPSC, separate pages open with the figures from the official notices, shown with the notice name and date: <a href="/ssc-photo-resizer/">SSC photo resizer</a> and <a href="/upsc-photo-resizer/">UPSC photo resizer</a>.</p>`,
      },
      {
        heading: "How minimum and maximum limits work",
        html: `<p>If you set only a maximum, the tool lowers the JPG or WebP quality in steps until the file fits. If you set a minimum, it raises quality in steps while the file stays under the maximum. The size shown at the end is the real size of the file you download. A very small or simple picture can stay below a minimum even at full quality, while a detailed one can stay above a maximum at the lowest quality tried. In that case change the pixel size if the notice allows it, or start from a better original.</p>`,
      },
      {
        heading: "What the tool does not check",
        html: `<p>It changes pixel size and file size only. It does not check background colour, face position, ink colour, dates printed on the photo or whether a particular portal will accept the file. Resizing never guarantees acceptance, so read the portal's own messages after uploading.</p>
<ul>
<li>Use a plain background and even light for the photo.</li>
<li>Sign with dark ink on plain white paper.</li>
<li>Keep the original files, because the tool always creates a new one.</li>
</ul>
<p>Need only a smaller file? Use <a href="/image-compressor/">Image Compressor</a>. Need the form attachments in one file? See <a href="/jpg-to-pdf/">JPG to PDF</a>.</p>`,
      },
    ],
    faqs: [
      { q: "Can I enter only a maximum size?", a: "Yes. Leave the minimum empty if your notice does not state one." },
      { q: "What if the file is still outside my limits?", a: "The result panel shows a warning with the real size. Change the pixel size or use a different original and try again." },
      { q: "Is my photo sent to a server?", a: "No. The picture is processed in your browser and never leaves your device." },
    ],
  },
  {
    route: "/word-counter/",
    title: "Using a word count for essays and articles",
    sections: [
      {
        heading: "Word limits and how counts can differ",
        html: `<p>Essays, applications and articles are often set to a word limit, and the count is the number that matters. This counter treats any run of letters or digits between spaces and line breaks as one word, so a hyphenated word such as well-known is one word and a number such as 2026 is one word. Other programs may handle hyphens, numbers or symbols slightly differently, so counts can vary by a few words. When a limit is strict, leave a small margin instead of aiming for the exact number.</p>`,
      },
      {
        heading: "Reading the other numbers",
        html: `<ul>
<li><strong>Unique words</strong> counts each different word once, ignoring capital letters. A low figure compared with the total can mean repetition.</li>
<li><strong>Sentences and paragraphs</strong> help you check structure. Very long sentences are easier to cut once you can see them.</li>
<li><strong>Most-used words</strong> leaves out common words like the and and, so the interesting repeats show. If one ordinary word appears many times, find a different way to say it.</li>
</ul>`,
      },
      {
        heading: "Trimming a text that is too long",
        html: `<ol>
<li>Cut sentences that repeat a point already made.</li>
<li>Replace phrases with single words where the meaning stays the same.</li>
<li>Remove unneeded adverbs and filler openings.</li>
<li>Count again after each pass, and stop when you are a little under the limit.</li>
</ol>
<p>For limits set in characters rather than words, use the <a href="/character-counter/">Character Counter</a>. To estimate how long a piece takes to read, try the <a href="/reading-time-calculator/">Reading Time Calculator</a>. Bangla text has its own <a href="/bangla-word-counter/">Bangla Word Counter</a>.</p>`,
      },
    ],
    faqs: [
      { q: "Why is my count different from Word or Google Docs?", a: "Programs treat hyphens, symbols and numbers in slightly different ways. Leave a small margin if the limit is strict." },
      { q: "Does it work for languages other than English?", a: "Yes, for languages that put spaces between words, such as Spanish, French, Hindi and Bangla." },
      { q: "Is the text I paste stored anywhere?", a: "No. The counting happens in your browser and the text is not sent to a server." },
    ],
  },
  {
    route: "/character-counter/",
    title: "Character limits: what counts and what does not",
    sections: [
      {
        heading: "What this counter includes",
        html: `<p>The main count includes letters, numbers, punctuation, spaces and line breaks. A second figure shows the characters without spaces, which some forms and rules use instead. Line breaks count as characters, so pasted text can be a little longer than it looks. An emoji or an accented letter written as one symbol counts as one character here, although some platforms and text messages count it as more.</p>`,
      },
      {
        heading: "Common limits",
        html: `<p>The limits list compares your text with 280 characters for an X post, 2,200 for an Instagram caption, 100 for a YouTube title, and the usual 60 and 160 suggested for a search result title and description. Platforms change their rules and may treat links or emoji differently, so use the list as a guide and check the platform when the limit is critical.</p>
<p>For a search title, the length is only a guide too. Search engines cut titles by display width, not by a fixed number of characters, so a title with wide letters can be cut off earlier than one with narrow letters.</p>`,
      },
      {
        heading: "Writing to fit",
        html: `<ul>
<li>Put the important words first, so a cut does not remove the point.</li>
<li>Replace long phrases with short ones before you drop meaning.</li>
<li>Check the count after you add links, hashtags or emoji.</li>
</ul>
<p>Text messages follow different rules, because special characters can change how a message is split. Use the <a href="/sms-character-counter/">SMS Character Counter</a> for that, the <a href="/word-counter/">Word Counter</a> when a limit is in words, and the <a href="/case-converter/">Case Converter</a> when a heading is in the wrong case.</p>`,
      },
    ],
    faqs: [
      { q: "Do spaces count as characters?", a: "Yes in the main count. The counts line also shows the total without spaces." },
      { q: "Why does my post count differently on the platform?", a: "Platforms may count links, emoji or some symbols differently from a plain character count." },
      { q: "Does the counter keep my text?", a: "No. Counting runs in your browser and nothing is sent anywhere." },
    ],
  },
  {
    route: "/case-converter/",
    title: "Choosing the right text case",
    sections: [
      {
        heading: "Everyday cases",
        html: `<p><strong>Sentence case</strong> capitalises only the first letter of each sentence, and it is the easiest to read in body text and in many headings. <strong>Title Case</strong> capitalises the main words and keeps short words like of and the in lower case unless they start or end the title. <strong>Capitalized Case</strong> capitalises every word. <strong>UPPER CASE</strong> is best kept for short labels, since long passages in capitals are hard to read.</p>`,
      },
      {
        heading: "Cases used in code",
        html: `<ul>
<li><strong>camelCase</strong> joins words and capitalises each later word, as in firstName.</li>
<li><strong>PascalCase</strong> capitalises every word, as in FirstName.</li>
<li><strong>snake_case</strong> and <strong>kebab-case</strong> join words with underscores or hyphens. Kebab-case is also a good shape for page addresses.</li>
<li><strong>CONSTANT_CASE</strong> uses capitals with underscores and is common for fixed values.</li>
</ul>`,
      },
      {
        heading: "What a converter cannot know",
        html: `<p>The converter follows simple rules. It does not recognise proper nouns, so sentence case turns London into london unless it begins a sentence, and brand names with unusual capitals, such as ones with a capital in the middle, need to be checked by hand. Title Case rules also differ between style guides, so a heading may need a small edit to match yours.</p>
<p>Scripts without capital letters, such as Bangla and Hindi, are not changed by case conversion. If text was pasted with stray spaces, clean it first with <a href="/remove-extra-spaces/">Remove Extra Spaces</a>, and check its length with the <a href="/character-counter/">Character Counter</a>.</p>`,
      },
    ],
    faqs: [
      { q: "How do I change uppercase text to lowercase?", a: "Paste the text, choose lower case and copy the result." },
      { q: "Will it fix names and acronyms?", a: "No. It cannot tell a name or acronym from an ordinary word, so check those yourself after converting." },
      { q: "Does it work with other alphabets?", a: "Yes for scripts that have upper and lower case, such as Latin, Greek and Cyrillic." },
    ],
  },
  {
    route: "/loan-calculator/",
    title: "Reading a loan payment properly",
    sections: [
      {
        heading: "A short worked example",
        html: `<p>Take a loan of 15,000 at 8% a year. Over 3 years the monthly payment is about 470.05, so you pay about 16,922 in total and about 1,922 of it is interest. Stretch it to 5 years and the payment drops to about 304.15, but the total paid rises to about 18,249, with about 3,249 in interest. The lower payment is real, yet it costs more overall, because the balance is outstanding for longer.</p>
<p>In the first month of the 3-year loan, the interest is 15,000 times 8% divided by 12, which is 100. The rest of the payment, about 370, reduces the balance. Each month the balance is a little lower, so the interest share shrinks and the principal share grows.</p>`,
      },
      {
        heading: "Compare offers fairly",
        html: `<ul>
<li>Compare total interest, not only the monthly payment.</li>
<li>Use the same term when comparing rates, or the same rate when comparing terms.</li>
<li>Ask for the annual percentage rate (APR), which includes fees that this calculator leaves out.</li>
<li>Check whether the lender charges for paying early.</li>
</ul>`,
      },
      {
        heading: "What the result does not include",
        html: `<p>The calculator covers principal and interest at a fixed rate with equal payments. It leaves out arrangement fees, insurance, taxes and rate changes, and a lender's own schedule can round a little differently. Treat the result as a close estimate and check the exact figures with the lender.</p>
<p>To see what an extra monthly payment saves, use the <a href="/amortization-calculator/">Amortization Calculator</a>. For a home loan try the <a href="/mortgage-calculator/">Mortgage Calculator</a> or the <a href="/emi-calculator/">EMI Calculator</a>, and read <a href="/guides/loan-emi-explained/">how loan EMIs work</a> for the formula in plain language. This page gives general information and is not financial advice.</p>`,
      },
    ],
    faqs: [
      { q: "Is a longer loan always cheaper per month?", a: "The payment is lower, but you pay interest for longer, so the total cost is usually higher." },
      { q: "Does paying extra early save more?", a: "Yes. Early on the balance is highest, so an extra payment removes the most future interest." },
      { q: "Can I use it for a variable-rate loan?", a: "Only as an estimate at today's rate, because the payment will change when the rate does." },
    ],
  },
  {
    route: "/compound-interest-calculator/",
    title: "Why time matters more than the rate",
    sections: [
      {
        heading: "Compounding frequency in numbers",
        html: `<p>The same stated rate grows a little faster when interest is added more often. Put 10,000 at 7% for 10 years: compounded yearly it reaches about 19,672, and compounded monthly it reaches about 20,097. The gap of roughly 425 comes only from interest being added twelve times a year instead of once. Past monthly, extra frequency makes very little further difference, so use whichever frequency your account states.</p>`,
      },
      {
        heading: "A quick check with the rule of 72",
        html: `<p>To estimate how long money takes to double, divide 72 by the yearly rate. At 7% that is about 10.3 years, and the exact figure is close to 10.2 years. At 4% it is about 18 years. The rule is a rough guide for ordinary rates and is handy for checking that the calculator's answer is in the right range.</p>
<p>It also shows why starting early matters. Each doubling period adds as much growth as all the earlier ones together, so extra years at the end are worth far more than extra years at the start of a short plan.</p>`,
      },
      {
        heading: "Using the calculator sensibly",
        html: `<ul>
<li>Use one rate and one contribution as a baseline, then change a single input at a time.</li>
<li>Be careful with quoted rates. A rate described as APY already includes compounding, while a nominal rate does not.</li>
<li>Remember that real returns vary, and a higher assumed rate is not a safer assumption. This calculator also ignores tax and fees.</li>
</ul>
<p>Related tools: <a href="/future-value-calculator/">Future Value Calculator</a>, <a href="/roi-calculator/">ROI Calculator</a>, <a href="/fd-calculator/">FD Calculator</a> and <a href="/loan-calculator/">Loan Calculator</a> for the borrowing side. This page gives general information and is not financial advice.</p>`,
      },
    ],
    faqs: [
      { q: "What is the difference between APY and the stated rate?", a: "APY includes the effect of compounding over a year. The stated or nominal rate does not, so APY is slightly higher when interest is added more than once a year." },
      { q: "Does monthly contribution timing matter?", a: "Yes, a little. Contributions made earlier in the month earn slightly more. This calculator adds each one at the end of the month." },
      { q: "Can it predict my actual returns?", a: "No. It shows what would happen at a constant rate. Real investments rise and fall." },
    ],
  },
  {
    route: "/gpa-calculator/",
    title: "Planning a GPA, not only calculating one",
    sections: [
      {
        heading: "Cumulative GPA from several terms",
        html: `<p>For a cumulative GPA, either enter every course from every term, or combine terms by weight. A term GPA is weighted by its credits, so 3.2 over 60 credits and 3.8 over 15 credits give (3.2 times 60 plus 3.8 times 15) divided by 75, which is 3.32. The more credits a term has, the more it moves the total. Averaging two term GPAs without weighting them gives the wrong answer when the credit loads differ.</p>`,
      },
      {
        heading: "What grade do I need next term?",
        html: `<p>Work backwards from the target. Suppose you have 3.2 over 60 credits, you will take 15 more credits, and you want 3.3 overall. The total quality points you need are 3.3 times 75, which is 247.5. You already have 3.2 times 60, which is 192. The remaining 55.5 points over 15 credits means a term GPA of 3.7. If the number you need is above 4.0, the target cannot be reached in one term, and the calculator on this page can show how many terms it takes.</p>`,
      },
      {
        heading: "Scale differences to watch for",
        html: `<p>The calculator uses the common unweighted 4.0 scale: A is 4.0, A minus is 3.7, B plus is 3.3 and so on down to F at 0. Some schools give an A plus extra points, skip plus and minus grades, or weight honors courses higher. If yours does, enter numeric grade points instead of letters, and check your school's own rules for rounding.</p>
<p>If your grades are percentages, convert them to the school's scale first. The <a href="/grade-calculator/">Grade Calculator</a> works out a course grade from weighted assignments, the <a href="/average-calculator/">Average Calculator</a> is useful for plain averages, and the <a href="/percentage-calculator/">Percentage Calculator</a> converts scores to percentages.</p>`,
      },
    ],
    faqs: [
      { q: "Do all courses count the same?", a: "No. Courses with more credits have more weight. If you leave the credits out, every course counts equally." },
      { q: "Can I use numeric grade points?", a: "Yes. Type values such as 3.5 instead of a letter if your school uses its own scale." },
      { q: "Is this my official GPA?", a: "No. Your school sets the scale and rounding, so the official figure can differ slightly." },
    ],
  },
  {
    route: "/percentage-calculator/",
    title: "Percentage questions in everyday life",
    sections: [
      {
        heading: "Matching the question to the mode",
        html: `<ul>
<li><strong>A shop discount:</strong> decrease the price by the discount percentage. A 25% reduction on 200 gives 150.</li>
<li><strong>Tax or a service charge:</strong> increase the price by the percentage. 10% on 200 gives 220.</li>
<li><strong>Test marks:</strong> find what percent one number is of another. 45 out of 60 is 75%.</li>
<li><strong>Growth or decline:</strong> use percentage change between the old and the new value.</li>
</ul>`,
      },
      {
        heading: "Working back to the original price",
        html: `<p>A common trap is taking the discount off the sale price to find the original. If an item costs 80 after 20% off, you paid 80% of the original, so the original is 80 divided by 0.8, which is 100. Taking 20% of 80 and adding it back gives 96, which is wrong. Use the whole-from-a-part question for this: the part is 80 and the percentage is 80.</p>`,
      },
      {
        heading: "Percent and percentage points",
        html: `<p>A rate that rises from 4% to 5% has gone up by one percentage point, but by 25% in relative terms, because 1 is a quarter of 4. News and reports mix the two, so check which one is meant before you compare numbers. Two changes in a row are not added either: a 10% rise followed by a 10% fall leaves you at 99% of the start, not 100%.</p>
<p>Other tools that help: <a href="/discount-calculator/">Discount Calculator</a>, <a href="/sales-tax-calculator/">Sales Tax Calculator</a>, <a href="/tip-calculator/">Tip Calculator</a> and <a href="/percentage-change-calculator/">Percentage Change Calculator</a>. The guide on <a href="/guides/how-to-calculate-percentages/">how to calculate percentages</a> covers the methods by hand.</p>`,
      },
    ],
    faqs: [
      { q: "How do I work out a percentage in my head?", a: "Find 10% by moving the decimal point one place, then build up. For 15% of 80, 10% is 8 and 5% is 4, so the answer is 12." },
      { q: "Why does a rise and an equal fall not cancel out?", a: "The fall is taken from the higher value. 100 up 10% is 110, and 110 down 10% is 99." },
      { q: "Is a percentage point the same as a percent?", a: "No. A move from 4% to 5% is one percentage point, which is a 25% relative increase." },
    ],
  },
  {
    route: "/bmi-calculator/",
    title: "Using a BMI result sensibly",
    sections: [
      {
        heading: "What BMI is good for",
        html: `<p>BMI divides weight in kilograms by height in metres squared. It is a quick screening number that is easy to compare over time and across large groups of people, which is why it is widely used. For one person it is only a starting point. It cannot tell muscle from fat, it does not show where weight is carried, and the categories fit some people less well than others, for example very muscular people and older adults.</p>`,
      },
      {
        heading: "Limits to keep in mind",
        html: `<ul>
<li>The adult categories apply to people aged 20 and over. Children and teenagers are assessed with age and sex percentile charts, which this tool does not use.</li>
<li>Some health organisations use lower cut-off values for people of South or East Asian background, so ask a doctor which thresholds apply to you.</li>
<li>Pregnancy and certain medical conditions change what a healthy weight means.</li>
</ul>`,
      },
      {
        heading: "Getting steadier numbers",
        html: `<p>Measure height without shoes, standing straight against a wall, and weigh yourself at the same time of day, ideally before eating. Small changes of a kilogram or two from day to day are normal and do not change the picture. The weight range shown for your height uses the BMI limits of 18.5 and 24.9, so you can see the range rather than a single figure.</p>
<p>If you are concerned about your weight or health, speak to a doctor or another health professional who can consider your whole situation. This calculator gives general information and is not medical advice. To convert units before you enter them, use <a href="/kg-to-lbs/">kg to lbs</a>, <a href="/cm-to-feet/">cm to feet</a> or the <a href="/percentage-calculator/">Percentage Calculator</a> for changes over time.</p>`,
      },
    ],
    faqs: [
      { q: "Does BMI work for athletes?", a: "Often not. Muscle weighs more than fat, so a muscular person can have a high BMI without excess body fat." },
      { q: "Can I use the same categories for a teenager?", a: "No. Young people are compared with age and sex percentile charts, and a doctor can explain the result." },
      { q: "Is my weight or height stored?", a: "No. The calculation runs in your browser and nothing is sent anywhere." },
    ],
  },
  {
    route: "/cm-to-inches/",
    title: "Converting centimetres to inches in practice",
    sections: [
      {
        heading: "A quick method you can do in your head",
        html: `<p>One inch is exactly 2.54 centimetres, so inches equal centimetres divided by 2.54. For a quick check, divide by 2.5 and take a little off the answer, or multiply by 0.4. A height of 170 cm is 66.9 inches by the exact method and 68 by the mental one, close enough to know whether you are in the right range. Use the converter when the number matters, for a form or an order.</p>`,
      },
      {
        heading: "Common examples",
        html: `<ul>
<li><strong>Height:</strong> 175 cm is 68.9 inches, which is 5 feet 8.9 inches. Divide by 12 to get the feet and use the remainder as inches.</li>
<li><strong>Paper:</strong> an A4 sheet is 21 by 29.7 cm, which is about 8.27 by 11.69 inches.</li>
<li><strong>Screens:</strong> sizes are quoted as a diagonal in inches, so a 15.6 inch laptop is about 39.6 cm across the diagonal, not across the width.</li>
</ul>`,
      },
      {
        heading: "Avoiding mistakes",
        html: `<p>Rounding is the usual source of error. Keep two decimals while you calculate and round only at the end, and do not round the factor 2.54, which is exact. Check whether a form wants inches as a decimal, such as 66.93, or as feet and inches, such as 5 feet 6.9 inches. Do not mix up centimetres with millimetres: 25.4 mm is one inch.</p>
<p>Other converters: <a href="/inches-to-cm/">inches to cm</a>, <a href="/feet-to-cm/">feet to cm</a>, <a href="/cm-to-feet/">cm to feet</a> and <a href="/mm-to-inches/">mm to inches</a>. The <a href="/guides/metric-and-imperial-conversions-cheat-sheet/">metric and imperial cheat sheet</a> lists the most common conversions in one place.</p>`,
      },
    ],
    faqs: [
      { q: "Is 2.54 an exact number?", a: "Yes. Since 1959 an inch has been defined as exactly 2.54 centimetres, so the factor itself has no rounding error." },
      { q: "How do I convert cm to feet and inches?", a: "Divide by 2.54 to get inches, divide that by 12 for whole feet, and the remainder is the extra inches." },
      { q: "Why do screen sizes not match the width I measured?", a: "Screens are sized by the diagonal, which is longer than the width or height." },
    ],
  },
  {
    route: "/kg-to-lbs/",
    title: "Kilograms to pounds for travel, fitness and forms",
    sections: [
      {
        heading: "The exact factor and a fast estimate",
        html: `<p>One pound is defined as exactly 0.45359237 kilograms, so one kilogram is about 2.20462 pounds. A fast estimate is to double the kilograms and add 10% of the result. For 50 kg, double is 100 and 10% of that is 10, giving 110, while the exact figure is 110.2 pounds. The estimate is good for a rough idea. Use the converter when a limit or a record depends on the number.</p>`,
      },
      {
        heading: "Where the conversion comes up",
        html: `<ul>
<li><strong>Luggage:</strong> a limit of 23 kg is about 50.7 pounds. Check your airline's stated limit, because rules differ.</li>
<li><strong>Gym weights:</strong> a plate marked 20 kg is about 44.1 pounds, and a 45 pound plate is about 20.4 kg, so loads in the two units are not interchangeable.</li>
<li><strong>Health forms:</strong> 70 kg is 154.32 pounds, or 154 pounds 5 ounces.</li>
</ul>`,
      },
      {
        heading: "Pounds and ounces, and stone",
        html: `<p>For pounds and ounces, keep the whole pounds and multiply the decimal part by 16. For 70 kg, 0.32 times 16 is about 5 ounces. In the United Kingdom and Ireland body weight is often given in stone and pounds, where one stone is 14 pounds. Use <a href="/kg-to-stone/">kg to stone</a> for that.</p>
<p>To go back the other way, use <a href="/lbs-to-kg/">pounds to kg</a> or <a href="/stone-to-kg/">stone to kg</a>. For other everyday conversions, see the <a href="/guides/metric-and-imperial-conversions-cheat-sheet/">metric and imperial cheat sheet</a>.</p>`,
      },
    ],
    faqs: [
      { q: "How many pounds is 100 kg?", a: "100 kg is 220.46 pounds." },
      { q: "Is the pound factor exact?", a: "Yes. One pound is exactly 0.45359237 kg by definition, so only the display is rounded." },
      { q: "Is lb the same as lbs?", a: "Yes. Lb is the abbreviation, from the Latin libra, and lbs is the common plural form." },
    ],
  },
];
