import type { Faq } from "./formatTools";
import { convertCase, countStats, formatDuration, removeDuplicateLines, removeExtraSpaces, removeLineBreaks, repeatText, smsInfo } from "../lib/textTools.ts";
import type { TextMode } from "../components/tools/TextTool";

export interface TextPage {
  slug: string;
  mode: TextMode;
  lang: "en" | "bn";
  sample: string;
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  keywords: string[];
  steps: string[];
  explanation: string[];
  worked: () => string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

const PRIVACY: Faq = { q: "Is my text saved or sent anywhere?", a: "No. Everything happens in your browser on your own device. The text you type or paste is never sent to Paul Digital or any other server." };
const bd = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
const SAMPLE = "Paste your own text here. This sample has two short paragraphs.\n\nCounting happens as you type, so you can edit and watch the numbers change.";

export const textPages: TextPage[] = [
  {
    slug: "character-counter",
    mode: "counter",
    lang: "en",
    sample: SAMPLE,
    h1: "Character Counter",
    title: "Character Counter: Count Characters, Words and Limits",
    description: "Count characters with and without spaces, words, sentences and paragraphs, and see how much room is left for X, Instagram, YouTube and meta tags. Free, private.",
    summary: "Count characters, words and sentences, and check social media limits.",
    intro: "Type or paste your text to count characters, words, sentences and paragraphs, and see how much room you have left for common limits.",
    keywords: ["character counter", "character count", "count characters", "letter counter", "characters with spaces", "characters without spaces"],
    steps: ["Type or paste your text.", "Read the character count, with and without spaces, and the word count.", "Check the limits list to see how many characters are left for each platform."],
    explanation: [
      "The character count includes letters, numbers, punctuation, spaces and line breaks. The counts line also shows characters without spaces, which some forms and word-limit rules use. An emoji or an accented letter written as one symbol counts as one character here.",
      "The limits list compares your text with common limits: 280 for an X post, 2,200 for an Instagram caption, 100 for a YouTube title, and the usual 60 and 160 suggested for a search title and description. Platforms change their limits and may count some characters, such as links or emoji, differently, so treat the list as a guide.",
    ],
    worked: () => {
      const s = countStats("Hello, world! How are you?");
      return [`“Hello, world! How are you?” has ${s.characters} characters, ${s.charactersNoSpaces} without spaces, and ${s.words} words.`, `A 300-character text is 20 over the 280 limit for an X post.`];
    },
    tips: ["Line breaks count as characters, so a pasted text can be slightly longer than it looks.", "Use the most-used-words table to spot repeated words you may want to cut."],
    faqs: [
      { q: "Do spaces count as characters?", a: "Yes in the main count. The counts line also shows the total without spaces." },
      { q: "How many characters is a tweet?", a: "A standard X post allows 280 characters, but links and some symbols are counted differently by the platform." },
      { q: "Does an emoji count as one character?", a: "Here it counts as one character. Some platforms and SMS count it as more." },
      PRIVACY,
    ],
    related: ["word-counter", "sms-character-counter", "reading-time-calculator", "case-converter"],
  },
  {
    slug: "word-counter",
    mode: "words",
    lang: "en",
    sample: SAMPLE,
    h1: "Word Counter",
    title: "Word Counter: Count Words, Sentences and Paragraphs",
    description: "Count the words, characters, sentences and paragraphs in any text, with unique words and the most used words. Free, private, no sign-up.",
    summary: "Count words, sentences and paragraphs, and find the most used words.",
    intro: "Paste an essay, article or message to count its words, sentences and paragraphs, and see which words you use most.",
    keywords: ["word counter", "word count", "count words", "words counter online", "essay word count"],
    steps: ["Type or paste your text.", "Read the word count and the other counts.", "Look at the most-used-words table to spot repetition."],
    explanation: [
      "A word is any run of letters or digits separated by spaces or line breaks, so “well-known” is one word and “don’t” is one word. Sentences are counted at full stops, question marks and exclamation marks, and paragraphs at blank lines.",
      "The unique words figure counts each different word once, ignoring capital letters. The most-used-words table leaves out very common words like “the” and “and” so that the interesting repeats stand out.",
    ],
    worked: () => {
      const s = countStats("The cat sat. The cat ran!");
      return [`“The cat sat. The cat ran!” has ${s.words} words, ${s.uniqueWords} unique words and ${s.sentences} sentences.`];
    },
    tips: ["Check any word limit against the word count, not the character count.", "Numbers such as 2026 count as words."],
    faqs: [
      { q: "How are words counted?", a: "Anything between spaces or line breaks that contains a letter or digit is one word." },
      { q: "Does it count hyphenated words as one?", a: "Yes. “Well-known” counts as one word." },
      { q: "Can it count words in other languages?", a: "Yes, for languages that put spaces between words, such as Bangla, Hindi, Spanish and French." },
      PRIVACY,
    ],
    related: ["character-counter", "reading-time-calculator", "bangla-word-counter", "remove-duplicate-lines"],
  },
  {
    slug: "case-converter",
    mode: "case",
    lang: "en",
    sample: "the quick brown fox jumps over the lazy dog. it was a sunny day!",
    h1: "Case Converter",
    title: "Case Converter: UPPER, lower, Title and Sentence Case",
    description: "Change text to upper case, lower case, sentence case, title case, camelCase, snake_case and more in one click. Free, private, in your browser.",
    summary: "Change text to upper, lower, sentence, title, camel, snake and kebab case.",
    intro: "Paste your text, pick a case and copy the result. Works for headings, names, code identifiers and messages typed in the wrong case.",
    keywords: ["case converter", "text case converter", "uppercase to lowercase", "title case converter", "sentence case converter", "camelcase converter"],
    steps: ["Paste your text.", "Tap the case you want.", "Press Copy."],
    explanation: [
      "Sentence case capitalises the first letter of each sentence. Title Case capitalises the main words and leaves short words like “of” and “the” in lower case unless they start or end the title. Capitalized Case capitalises every word.",
      "The programming cases turn words into identifiers: camelCase joins words with each later word capitalised, PascalCase capitalises every word, snake_case and kebab-case join with underscores or hyphens, and CONSTANT_CASE uses capitals with underscores.",
    ],
    worked: () => [`“the lord of the rings” in Title Case is “${convertCase("the lord of the rings", "title")}”.`, `“hello big world” in camelCase is “${convertCase("hello big world", "camel")}” and in snake_case is “${convertCase("hello big world", "snake")}”.`],
    tips: ["Title Case follows a simple rule. Style guides differ, so check names and brand spellings yourself.", "Proper nouns are not detected, so sentence case turns “London” into “london” unless it starts a sentence."],
    faqs: [
      { q: "How do I change text from uppercase to lowercase?", a: "Paste the text and tap “lower case”." },
      { q: "What is the difference between sentence case and title case?", a: "Sentence case capitalises only the first word of each sentence. Title Case capitalises the main words." },
      { q: "Does it work with other languages?", a: "Yes for scripts that have upper and lower case, such as Latin, Greek and Cyrillic. Bangla and Hindi have no capital letters." },
      PRIVACY,
    ],
    related: ["character-counter", "word-counter", "remove-extra-spaces", "text-repeater"],
  },
  {
    slug: "remove-line-breaks",
    mode: "linebreaks",
    lang: "en",
    sample: "This text was copied\nfrom a PDF and every line\nends in a line break.\n\nA new paragraph starts here\nand also breaks early.",
    h1: "Remove Line Breaks",
    title: "Remove Line Breaks: Join Lines Into One Paragraph",
    description: "Remove line breaks and join lines from copied text, PDFs and emails, with the option to keep paragraphs. Free, private, in your browser.",
    summary: "Remove line breaks from pasted text and join the lines.",
    intro: "Paste text with unwanted line breaks, such as from a PDF or an email, and get one clean paragraph back.",
    keywords: ["remove line breaks", "remove line breaks online", "remove newlines", "join lines", "remove paragraph breaks", "delete line breaks"],
    steps: ["Paste your text.", "Choose what to put in place of each line break: a space, nothing, or a space while keeping paragraphs.", "Press Copy."],
    explanation: [
      "Text copied from a PDF, a scan or an email often has a line break at the end of every line. This tool joins the lines. A space is the usual choice, since it keeps words apart. “Nothing” joins lines directly, which suits lists of numbers or codes.",
      "The paragraph option replaces single line breaks with spaces but keeps blank lines, so paragraph breaks stay. Windows, Mac and Linux line breaks are all handled.",
    ],
    worked: () => [`“a↵b↵c” with a space becomes “${removeLineBreaks("a\nb\nc", "space")}”.`, `Two paragraphs with one break each keep their paragraph break: “${removeLineBreaks("a\nb\n\nc\nd", "paragraphs").replace("\n\n", " ¶ ")}”.`],
    tips: ["Use “keep paragraphs” for articles so the structure survives.", "A hyphen at the end of a line stays; remove it yourself if a word was split."],
    faqs: [
      { q: "How do I remove line breaks from text?", a: "Paste the text, choose a space as the replacement and copy the result." },
      { q: "Can I keep the paragraphs?", a: "Yes. Choose “A space, but keep paragraphs”." },
      { q: "Does it work for Windows and Mac text?", a: "Yes. All types of line break are handled." },
      PRIVACY,
    ],
    related: ["remove-extra-spaces", "remove-duplicate-lines", "word-counter", "case-converter"],
  },
  {
    slug: "text-repeater",
    mode: "repeat",
    lang: "en",
    sample: "Hello",
    h1: "Text Repeater",
    title: "Text Repeater: Repeat Text Many Times",
    description: "Repeat any word, line or text as many times as you want, with a new line, space or comma between copies. Free, private, in your browser.",
    summary: "Repeat any text many times, with your choice of separator.",
    intro: "Type some text, choose how many times to repeat it and what goes between copies, then copy the result.",
    keywords: ["text repeater", "repeat text", "repeat text online", "copy paste text multiple times", "word repeater"],
    steps: ["Type the text to repeat.", "Set the number of times and the separator.", "Press Copy."],
    explanation: [
      "The repeater writes your text again and again. Put a new line between copies for a list, a space for a line of text, or a comma for a list of values. It is handy for test data, filling templates and spreadsheet columns.",
      "To keep the page responsive the result is limited to one million characters. If you ask for more, the output is cut at that limit and a note tells you.",
    ],
    worked: () => [`“ab” repeated 3 times with a hyphen is “${repeatText("ab", 3, "-").text}”.`],
    tips: ["Use a comma separator to build a list for a spreadsheet or code.", "For bigger lists, repeat the result again."],
    faqs: [
      { q: "How do I repeat text multiple times?", a: "Type the text, set the number of repeats and copy the result." },
      { q: "Is there a limit?", a: "The result is limited to one million characters." },
      PRIVACY,
    ],
    related: ["character-counter", "case-converter", "remove-duplicate-lines", "remove-line-breaks"],
  },
  {
    slug: "reading-time-calculator",
    mode: "reading",
    lang: "en",
    sample: SAMPLE,
    h1: "Reading Time Calculator",
    title: "Reading Time Calculator: How Long Does Text Take to Read",
    description: "Find the reading time and speaking time of any text from its word count, at 238 words a minute for reading and 150 for speaking. Free and private.",
    summary: "Work out how long a text takes to read or speak aloud.",
    intro: "Paste an article, essay or speech to see how long it takes to read silently and to say out loud.",
    keywords: ["reading time calculator", "how long to read", "reading time estimator", "speaking time calculator", "speech length calculator"],
    steps: ["Paste your text.", "Read the reading time and the speaking time.", "Use the word count to plan length."],
    explanation: [
      "Reading time uses 238 words a minute, a commonly quoted average for silent reading of non-fiction by adults. Speaking time uses 150 words a minute, a comfortable pace for a speech or presentation.",
      "Real speeds vary a lot with the reader, the topic and the language, so the figures are estimates. Add time for pauses, slides or questions if you are planning a talk.",
    ],
    worked: () => {
      const words = Array(1000).fill("word").join(" ");
      const s = countStats(words);
      return [`1,000 words take about ${formatDuration(s.readingMinutes)} to read and ${formatDuration(s.speakingMinutes)} to speak.`];
    },
    tips: ["For a 5-minute talk, aim for about 750 words.", "Slow down for technical text; the estimate is for ordinary prose."],
    faqs: [
      { q: "How is reading time calculated?", a: "Reading time is the number of words divided by 238 words a minute." },
      { q: "How many words is a 5-minute speech?", a: "About 750 words at 150 words a minute." },
      { q: "Is reading time the same in every language?", a: "No. The 238 figure is an average for English. Other languages and scripts differ." },
      PRIVACY,
    ],
    related: ["word-counter", "character-counter", "bangla-word-counter", "sms-character-counter"],
  },
  {
    slug: "sms-character-counter",
    mode: "sms",
    lang: "en",
    sample: "Your order has shipped and will arrive tomorrow. Thank you for shopping with us!",
    h1: "SMS Character Counter",
    title: "SMS Character Counter: Message Length and Segments",
    description: "Count SMS characters and see how many message segments a text will use. Handles GSM-7 and Unicode, so Bangla, Hindi and emoji are counted correctly.",
    summary: "Count SMS characters and segments, for English, Bangla, Hindi and emoji.",
    intro: "Type your SMS to see how many characters it has and how many messages it will be split into.",
    keywords: ["sms character counter", "sms length", "sms character limit", "text message character count", "sms segments", "bangla sms character count"],
    steps: ["Type or paste your message.", "Read the number of messages and the characters left.", "Shorten the text if it spills into an extra message."],
    explanation: [
      "A single SMS in the basic GSM-7 alphabet holds 160 characters. If the text is longer it is split and each part holds 153 characters, because a few characters in each part are used to join the parts back together.",
      "If a message has any character outside GSM-7, such as a Bangla or Hindi letter, an emoji or some curly quotes, the whole message is sent as Unicode. That allows only 70 characters in one message, or 67 in each part of a longer one. A few symbols such as € and { } count as two characters even in GSM-7.",
    ],
    worked: () => {
      const a = smsInfo("a".repeat(161));
      const b = smsInfo("আ".repeat(71));
      return [`161 plain letters use ${a.segments} messages (${a.encoding}).`, `71 Bangla letters use ${b.segments} messages (${b.encoding}).`, `One emoji turns a message into Unicode, so only 70 characters fit in a single message.`];
    },
    tips: ["Avoid curly quotes and emoji in English messages to stay in GSM-7.", "Providers charge per segment, so a message that just spills over costs double."],
    faqs: [
      { q: "How many characters are in one SMS?", a: "160 in GSM-7, or 70 if the message contains Unicode characters such as Bangla letters or emoji." },
      { q: "Why does my message count as two SMS?", a: "It is over the single-message limit. Longer messages are split into parts of 153 characters in GSM-7, or 67 in Unicode." },
      { q: "How many characters is a Bangla SMS?", a: "70 characters in one message, and 67 per part when it is longer." },
      PRIVACY,
    ],
    related: ["character-counter", "bangla-word-counter", "word-counter", "reading-time-calculator"],
  },
  {
    slug: "remove-duplicate-lines",
    mode: "dedupe",
    lang: "en",
    sample: "apple\nbanana\nApple\ncherry\nbanana\n\ncherry",
    h1: "Remove Duplicate Lines",
    title: "Remove Duplicate Lines: Delete Repeated Lines From a List",
    description: "Remove duplicate lines from a list and keep the first of each. Choose to match case, trim spaces and drop empty lines. Free, private, in your browser.",
    summary: "Remove repeated lines from a list and keep the first of each.",
    intro: "Paste a list with one item per line and get the same list without the repeats.",
    keywords: ["remove duplicate lines", "remove duplicates from list", "delete duplicate lines", "unique lines", "dedupe list online"],
    steps: ["Paste your list, one item per line.", "Choose whether capital letters matter, and whether to trim spaces and drop empty lines.", "Press Copy."],
    explanation: [
      "The tool keeps the first time a line appears and removes later copies, so your list keeps its order. By default “Apple” and “apple” count as the same line. Turn on “Match case” to treat them as different.",
      "“Ignore spaces at the ends of lines” stops a stray space making two identical lines look different. A note shows how many lines were removed.",
    ],
    worked: () => {
      const r = removeDuplicateLines("a\nA\nb\na\n\nc", { caseSensitive: false, trim: true, dropEmpty: true });
      return [`The list a, A, b, a, empty, c becomes ${r.text.split("\n").join(", ")}, with ${r.removed} lines removed.`];
    },
    tips: ["Sort your list first in a spreadsheet if you also want it in alphabetical order.", "Turn off “Remove empty lines” to keep blank separators."],
    faqs: [
      { q: "How do I remove duplicate lines?", a: "Paste the list and copy the result. The first copy of every line stays." },
      { q: "Is it case sensitive?", a: "Not by default. Turn on “Match case” if you want it to be." },
      PRIVACY,
    ],
    related: ["remove-extra-spaces", "remove-line-breaks", "word-counter", "text-repeater"],
  },
  {
    slug: "remove-extra-spaces",
    mode: "spaces",
    lang: "en",
    sample: "  This   text has    too many    spaces.  \n\n\n\n   And too many   blank lines.   ",
    h1: "Remove Extra Spaces",
    title: "Remove Extra Spaces: Clean Up Spaces and Blank Lines",
    description: "Remove extra spaces, trim the ends of lines and reduce repeated blank lines in pasted text, with options for each. Free, private, in your browser.",
    summary: "Remove extra spaces and blank lines from pasted text.",
    intro: "Paste messy text and clean up repeated spaces, spaces at the ends of lines and extra blank lines.",
    keywords: ["remove extra spaces", "remove double spaces", "remove whitespace", "trim spaces online", "clean up text"],
    steps: ["Paste your text.", "Choose which clean-ups to apply.", "Press Copy."],
    explanation: [
      "Text copied from web pages, documents or OCR often has double spaces, spaces at the start and end of lines and long runs of blank lines. This tool fixes all three, and you can turn each one off.",
      "Line breaks are kept, so paragraphs stay as they are. To join lines instead, use the Remove Line Breaks tool.",
    ],
    worked: () => [`“${removeExtraSpaces("  a   b  \n\n\n\n c ", { trimLines: true, collapse: true, blankLines: true }).replace(/\n/g, "↵")}” is the clean version of “  a   b  ↵↵↵↵ c ”.`],
    tips: ["Tabs count as spaces for the repeated-space clean-up.", "Use Remove Duplicate Lines afterwards for lists."],
    faqs: [
      { q: "How do I remove double spaces?", a: "Paste the text and keep “Turn repeated spaces into one” on." },
      { q: "Does it remove line breaks?", a: "No. It keeps them. Use Remove Line Breaks for that." },
      PRIVACY,
    ],
    related: ["remove-line-breaks", "remove-duplicate-lines", "case-converter", "character-counter"],
  },
  {
    slug: "bangla-word-counter",
    mode: "bangla",
    lang: "bn",
    sample: "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। বাংলা ভাষা আমাদের গর্ব।\n\nএটি একটি নমুনা লেখা।",
    h1: "বাংলা শব্দ ও অক্ষর গণনা",
    title: "বাংলা শব্দ ও অক্ষর গণনা: Bangla Word Counter",
    description: "বাংলা লেখার শব্দ, অক্ষর, বাক্য ও অনুচ্ছেদ গণনা করুন। যুক্তাক্ষরসহ দৃশ্যমান অক্ষর গোনে। Bangla word counter and character counter, বিনামূল্যে।",
    summary: "বাংলা লেখার শব্দ, অক্ষর, বাক্য ও অনুচ্ছেদ গণনা।",
    intro: "বাংলা লেখা লিখুন বা পেস্ট করুন, শব্দ, অক্ষর, বাক্য ও অনুচ্ছেদের সংখ্যা সঙ্গে সঙ্গে দেখুন।",
    keywords: ["bangla word counter", "bangla character counter", "বাংলা শব্দ গণনা", "বাংলা অক্ষর গণনা", "bengali word count", "বাংলা ওয়ার্ড কাউন্টার"],
    steps: ["বাংলা লেখা লিখুন বা পেস্ট করুন।", "শব্দ, অক্ষর, বাক্য ও অনুচ্ছেদের সংখ্যা দেখুন।", "প্রয়োজনে লেখা কেটে বা বাড়িয়ে সীমার মধ্যে আনুন।"],
    explanation: [
      "শব্দ গোনা হয় ফাঁকা জায়গা বা নতুন লাইনের মাঝের প্রতিটি অংশ ধরে। বাক্য গোনা হয় দাঁড়ি (।), প্রশ্নচিহ্ন ও বিস্ময়চিহ্ন ধরে, আর অনুচ্ছেদ গোনা হয় ফাঁকা লাইন ধরে।",
      "বাংলায় একটি যুক্তাক্ষর বা কার-যুক্ত অক্ষর কম্পিউটারে একাধিক ইউনিকোড কোড পয়েন্ট দিয়ে লেখা হয়। তাই এখানে দৃশ্যমান অক্ষর, যা চোখে একটি অক্ষর মনে হয়, আর ইউনিকোড কোড পয়েন্ট আলাদা করে দেখানো আছে। কোনো ফর্ম বা সফটওয়্যার কোনটি গোনে তা নিয়ম দেখে মিলিয়ে নিন।",
    ],
    worked: () => {
      const s = countStats("আমি ভালো আছি। তুমি কেমন আছো?");
      return [`“আমি ভালো আছি। তুমি কেমন আছো?” লেখায় ${bd(s.words)}টি শব্দ ও ${bd(s.sentences)}টি বাক্য আছে।`, `একই লেখায় দৃশ্যমান অক্ষর ${bd(s.graphemes)}টি এবং ইউনিকোড কোড পয়েন্ট ${bd(s.characters)}টি।`];
    },
    tips: ["অক্ষর সীমার নিয়ম দেখে নিন: কোনো সিস্টেম কোড পয়েন্ট গোনে, কোনোটি দৃশ্যমান অক্ষর।", "এসএমএসের হিসাবের জন্য ‘SMS Character Counter’ ব্যবহার করুন।"],
    faqs: [
      { q: "বাংলা শব্দ কীভাবে গোনা হয়?", a: "ফাঁকা জায়গা বা নতুন লাইনের মাঝের প্রতিটি অংশ একটি শব্দ।" },
      { q: "দৃশ্যমান অক্ষর আর কোড পয়েন্টের তফাত কী?", a: "যুক্তাক্ষর বা কার-যুক্ত অক্ষর চোখে একটি, কিন্তু কম্পিউটারে একাধিক কোড পয়েন্ট। এখানে দুটোই দেখানো হয়।" },
      { q: "বাংলা এসএমএসে কত অক্ষর যায়?", a: "বাংলা লেখায় এক বার্তায় ৭০টি, আর লম্বা হলে প্রতি অংশে ৬৭টি। বিস্তারিত জানতে SMS Character Counter দেখুন।" },
      { q: "আমার লেখা কি কোথাও পাঠানো হয়?", a: "না। সব হিসাব আপনার ব্রাউজারেই হয়।" },
    ],
    related: ["sms-character-counter", "word-counter", "character-counter", "bangla-land-converter"],
  },
];

export const textPageBySlug = new Map(textPages.map((p) => [p.slug, p]));
