import type { Faq } from "./formatTools";

/**
 * Extra, page-specific content for the most-searched unit converters.
 *
 * Every slug listed here is indexed by search engines and gets its own background paragraphs, a list
 * of common values and two extra questions. All other unit converter pages are marked noindex until
 * they get the same treatment. To index another converter, add an entry for its slug below.
 */
export interface UnitExtra {
  /** Background paragraphs added to "About this tool". */
  about: string[];
  /** Values (in the From unit) listed as extra examples; results are calculated with the exact factor. */
  common: number[];
  /** Extra questions placed before the privacy question. */
  faqs: Faq[];
}

export const unitExtras: Record<string, UnitExtra> = {
  "cm-to-inches": {
    about: [
      "Centimeters and inches meet most often in everyday measurements of people and screens. Heights, waist sizes and clothing measurements are given in centimeters in most of the world and in inches in the United States, while laptop, monitor and TV sizes are quoted in inches nearly everywhere.",
      "The inch has been defined as exactly 2.54 centimeters since the international yard and pound agreement of 1959, so this conversion has no rounding error in the factor. Only the display is rounded. For a height, convert to inches first and then split the result into feet and inches by dividing by 12.",
    ],
    common: [10, 30, 150, 160, 170, 175, 180, 190],
    faqs: [
      { q: "How do I convert centimeters to feet and inches?", a: "Divide the centimeters by 2.54 to get inches, then divide by 12 for whole feet. The remainder is the extra inches. For example, 175 cm is 68.9 inches, which is 5 feet 8.9 inches." },
      { q: "Is an inch exactly 2.54 cm?", a: "Yes. Since the international yard and pound agreement of 1959 one inch is defined as exactly 2.54 centimeters." },
    ],
  },
  "inches-to-cm": {
    about: [
      "Many products are sold in inches even in countries that use the metric system: screen sizes, tire and wheel widths, pipe diameters and picture frames. Converting to centimeters makes it easier to check whether an item will fit a space you measured with a metric tape.",
      "The factor is exact: one inch is 2.54 centimeters. A screen size is the diagonal, not the width, so a 15.6 inch laptop display is about 39.6 cm across the diagonal and noticeably smaller in width and height.",
    ],
    common: [1, 6, 12, 15.6, 24, 27, 32, 55],
    faqs: [
      { q: "How many cm is a 15.6 inch laptop screen?", a: "15.6 inches is 39.62 cm. Screen sizes are measured along the diagonal, so the width is smaller." },
      { q: "What is 12 inches in cm?", a: "12 inches is 30.48 cm, which is exactly one foot." },
    ],
  },
  "feet-to-cm": {
    about: [
      "Height is the most common reason to convert feet to centimeters. Passports, medical forms and clothing size guides in most countries ask for centimeters, while people in the United States, the United Kingdom and a few other countries often know their height in feet and inches.",
      "One foot is exactly 30.48 centimeters. If your height is in feet and inches, turn the inches into a fraction of a foot by dividing by 12, enter the total here, or convert the feet here and add 2.54 cm for every extra inch.",
    ],
    common: [1, 5, 5.5, 5.75, 6, 6.25, 6.5],
    faqs: [
      { q: "How tall is 5 feet 10 inches in cm?", a: "5 feet 10 inches is 177.8 cm. Enter 5.8333 feet, or add 10 × 2.54 cm to 152.4 cm." },
      { q: "How do I enter feet and inches together?", a: "Divide the inches by 12 and add them to the feet. For 5 feet 10 inches enter 5.8333." },
    ],
  },
  "cm-to-feet": {
    about: [
      "People usually search for this conversion to find out how tall a height in centimeters is in feet and inches, for example on a visa form, a sports profile or a clothing size chart. The converter gives decimal feet, which you can split into feet and inches in one more step.",
      "To turn the decimal part into inches, multiply it by 12. 175 cm is 5.74 feet, and 0.74 × 12 is about 8.9 inches, so 175 cm is roughly 5 feet 9 inches. One foot is exactly 30.48 cm, so the factor itself is exact.",
    ],
    common: [150, 160, 165, 170, 175, 180, 185, 190],
    faqs: [
      { q: "How tall is 175 cm in feet?", a: "175 cm is 5.74 feet, which is about 5 feet 9 inches (5 feet 8.9 inches)." },
      { q: "How do I turn decimal feet into feet and inches?", a: "Keep the whole number as the feet and multiply the decimal part by 12 for inches. For 5.74 feet that is 0.74 × 12 = 8.9 inches." },
    ],
  },
  "miles-to-km": {
    about: [
      "Miles are still used for road distances and speed limits in the United Kingdom and the United States, so drivers, runners and travelers often need kilometers. Race distances show how the two units mix: a marathon is 42.195 km, a half marathon 21.0975 km, and both are usually also quoted in miles.",
      "One mile is exactly 1.609344 kilometers. A good estimate in your head is miles times 1.6, and for a more careful one multiply by 8 and divide by 5. Distances on road signs are rounded, so a figure from a sign will not match the exact conversion.",
    ],
    common: [1, 3.1, 5, 10, 13.1, 26.2, 60, 100],
    faqs: [
      { q: "How many miles is a marathon in km?", a: "A marathon is 26.2 miles, which is 42.195 km (26 miles 385 yards exactly)." },
      { q: "How many km is 60 miles?", a: "60 miles is 96.56 km." },
    ],
  },
  "km-to-miles": {
    about: [
      "Kilometers are the standard road and running distance in most countries, but a trip in the United Kingdom or the United States will give distances in miles. Converting lets you compare a 10 km run with a 6 mile route, or check a car's range against distances on a map.",
      "One kilometer is about 0.621371 miles. For a quick estimate multiply by 5 and divide by 8, which gives 0.625 and stays within about 1% of the true value. Race names such as 5K and 10K are shorthand for exact distances, so a 5K is 3.107 miles, not 3.",
    ],
    common: [1, 5, 10, 21.0975, 42.195, 50, 100, 130],
    faqs: [
      { q: "How many miles is a 5K?", a: "A 5K is 5 kilometers, which is 3.107 miles." },
      { q: "What is a quick way to convert km to miles?", a: "Multiply by 5 and divide by 8. For 80 km that is 400 ÷ 8 = 50 miles, close to the exact 49.7." },
    ],
  },
  "kg-to-lbs": {
    about: [
      "Kilograms are the standard unit for body weight and luggage in most of the world, while the United States and, informally, the United Kingdom and Ireland still use pounds, and stone in the UK. Airlines, gyms and online shops often show both, which is when a quick conversion helps.",
      "One kilogram is about 2.20462 pounds. The abbreviation lb comes from the Latin libra. To express the result in pounds and ounces, multiply the decimal part of the pounds by 16, so 70 kg is 154.32 lb, or 154 pounds 5 ounces.",
    ],
    common: [1, 20, 50, 60, 70, 80, 90, 100],
    faqs: [
      { q: "How many pounds is 70 kg?", a: "70 kg is 154.32 pounds, or about 154 pounds 5 ounces." },
      { q: "How do I convert kg to pounds and ounces?", a: "Convert to pounds, keep the whole number, then multiply the decimal part by 16 to get the ounces." },
    ],
  },
  "lbs-to-kg": {
    about: [
      "Pounds appear on US body weight scales, food packaging, luggage allowances and gym weights. Converting to kilograms is needed for medical forms, international travel and most nutrition and fitness apps outside the United States.",
      "The pound is defined as exactly 0.45359237 kilograms, so the factor is exact. For a quick estimate divide pounds by 2.2. Barbell plates are often marked in both units, but a 45 lb plate is 20.4 kg, not 20 kg, which matters when you add up a lift.",
    ],
    common: [1, 45, 100, 120, 150, 180, 200, 250],
    faqs: [
      { q: "How many kg is 150 pounds?", a: "150 pounds is 68.04 kg." },
      { q: "Is a pound exactly 0.45359237 kg?", a: "Yes. The international yard and pound agreement of 1959 defined the pound as exactly 0.45359237 kilograms." },
    ],
  },
  "celsius-to-fahrenheit": {
    about: [
      "Celsius is used for weather, cooking and body temperature in most countries, while the United States uses Fahrenheit. The two scales differ in both the size of a degree and the zero point, so a Fahrenheit degree is smaller: 100 degrees Celsius spans the same range as 180 degrees Fahrenheit.",
      "Multiply by 1.8 and add 32. A shortcut for weather is to double the Celsius value and add 30, which is close for everyday temperatures. The scales cross at −40, where Celsius and Fahrenheit show the same number. Oven recipes are the most error prone case, so use the exact formula for cooking.",
    ],
    common: [-40, 0, 10, 20, 25, 30, 37, 100, 180, 200, 220],
    faqs: [
      { q: "What is 20 °C in Fahrenheit?", a: "20 °C is 68 °F." },
      { q: "At what temperature are Celsius and Fahrenheit equal?", a: "At −40. That is the only temperature where both scales show the same number." },
      { q: "What is 180 °C in Fahrenheit for baking?", a: "180 °C is 356 °F. Many American recipes round this to 350 °F." },
    ],
  },
  "fahrenheit-to-celsius": {
    about: [
      "Fahrenheit is still the everyday scale in the United States for weather, ovens and body temperature, so American recipes and forecasts need converting for readers who think in Celsius. The formula is to subtract 32 and divide by 1.8.",
      "A rough check for weather is to subtract 30 and halve the result: 70 °F gives about 20 °C, and the exact value is 21.1 °C. For cooking use the exact formula, because 350 °F is 176.7 °C and 400 °F is 204.4 °C, which many ovens round to 175 and 200.",
    ],
    common: [0, 32, 50, 68, 72, 86, 98.6, 100.4, 350, 375, 400, 425],
    faqs: [
      { q: "What is 350 °F in Celsius?", a: "350 °F is 176.7 °C. Many recipes round this to 175 °C or 180 °C." },
      { q: "What is 72 °F in Celsius?", a: "72 °F is 22.2 °C, a typical comfortable room temperature." },
    ],
  },
  "meters-to-feet": {
    about: [
      "Meters and feet meet in construction plans, room sizes, building and mountain heights, swimming pool lengths and sports fields. Countries that use feet for property and aviation, such as the United States, often publish metric figures for the same objects too.",
      "One meter is 3.28084 feet, so a rough estimate is meters times 3.3. Remember that a result such as 5.9 feet is decimal feet, not 5 feet 9 inches. Multiply the decimal part by 12 to get inches: 1.8 m is 5.906 feet, which is about 5 feet 10.9 inches.",
    ],
    common: [1, 1.5, 1.8, 2, 10, 50, 100, 1000],
    faqs: [
      { q: "How many feet is 100 meters?", a: "100 meters is 328.08 feet." },
      { q: "What is 1.8 m in feet and inches?", a: "1.8 m is 5.906 feet, which is about 5 feet 10.9 inches." },
    ],
  },
  "mb-to-gb": {
    about: [
      "Phone storage, data plans, file sizes and downloads are often listed in megabytes and gigabytes. This converter uses the decimal standard where 1 GB is 1,000 MB, which is what mobile networks and storage manufacturers use.",
      "Some operating systems count 1 GB as 1,024 MB instead. That binary unit is properly called a gibibyte (GiB), and it is why a drive sold as 500 GB shows about 465 GB in Windows: the drive holds 500 billion bytes, and 500 billion divided by 1,024³ is 465.66.",
    ],
    common: [100, 500, 1000, 1500, 2048, 4096, 8000, 16000],
    faqs: [
      { q: "Why does my 1 TB drive show less space?", a: "A 1 TB drive holds 1,000,000,000,000 bytes. Windows divides by 1,024³ and shows about 931 GB, even though no space is missing." },
      { q: "How many GB is 2048 MB?", a: "2048 MB is 2.048 GB in the decimal standard, or exactly 2 GiB in the binary standard." },
    ],
  },
  "gb-to-mb": {
    about: [
      "Mobile data plans, photo and video sizes, app downloads and cloud storage limits are all quoted in gigabytes, while individual files and messaging apps show megabytes. Converting helps you judge how many files fit in a plan or how much a download costs against your allowance.",
      "The decimal standard used here counts 1 GB as 1,000 MB. Computers sometimes count 1,024 MB per gibibyte (GiB), which is about 7% larger, so the same file can show slightly different sizes in different programs. Network providers normally bill with the decimal figure.",
    ],
    common: [0.5, 1, 2, 5, 10, 16, 64, 128],
    faqs: [
      { q: "How many MB is a 5 GB data plan?", a: "A 5 GB plan is 5,000 MB in the decimal standard that mobile carriers normally use." },
      { q: "What is the difference between GB and GiB?", a: "A gigabyte is 1,000,000,000 bytes. A gibibyte (GiB) is 1,073,741,824 bytes, about 7.4% larger." },
    ],
  },
  "oz-to-grams": {
    about: [
      "Ounces appear in US and UK recipes, on food labels, in postal rates and on kitchen scales. Converting to grams is the usual fix when a recipe from another country is written in ounces, because baking is more reliable by weight than by volume.",
      "One ounce is 28.3495 grams. This is the avoirdupois ounce used for food and mail. Gold, silver and other precious metals use the troy ounce of 31.1035 grams, which is about 10% heavier. Fluid ounces measure volume, not weight, so they cannot be converted with this page.",
    ],
    common: [1, 2, 4, 8, 12, 16, 32],
    faqs: [
      { q: "How many grams is a troy ounce?", a: "A troy ounce is 31.1035 grams, used for gold and silver. This page converts the ordinary ounce of 28.3495 grams." },
      { q: "How many grams is 8 oz?", a: "8 oz is 226.8 grams, which is half a pound." },
    ],
  },
  "ml-to-oz": {
    about: [
      "Drinks, sauces and liquid ingredients are measured in milliliters in most countries and in fluid ounces in the United States. This converter gives US fluid ounces, where one is 29.5735 ml. Beverage cans show it clearly: a US 12 oz can holds 355 ml.",
      "The UK fluid ounce is smaller, at 28.4131 ml, so a UK recipe in fluid ounces gives a slightly different result. For travel, the common limit on liquids in hand luggage is 100 ml, which is 3.38 US fluid ounces, so a 3.4 oz bottle fits the limit.",
    ],
    common: [30, 100, 250, 330, 355, 500, 750, 1000],
    faqs: [
      { q: "How many ounces are in a 500 ml bottle?", a: "A 500 ml bottle holds 16.91 US fluid ounces." },
      { q: "Why is a US can 12 oz and 355 ml?", a: "Twelve US fluid ounces is 354.9 ml, which is rounded to 355 ml on labels." },
    ],
  },
  "cups-to-ml": {
    about: [
      "Cup measures are the standard in US cooking and also appear in recipes from Canada, Australia and the United Kingdom, but a cup is not the same size everywhere. This page uses the US customary cup of 236.588 ml, which is 8 US fluid ounces.",
      "The US nutrition label cup is rounded to 240 ml, and the metric cup used in Australia, New Zealand and many UK recipes is 250 ml. The difference is about 6% between a US and a metric cup, which matters in baking, so check which cup your recipe uses.",
    ],
    common: [0.25, 0.333, 0.5, 0.75, 1, 2, 4],
    faqs: [
      { q: "Is a cup 240 ml or 250 ml?", a: "A US customary cup is 236.6 ml, a US nutrition label cup is 240 ml and a metric cup is 250 ml. This page uses the US customary cup." },
      { q: "How many ml is half a cup?", a: "Half a US cup is 118.3 ml." },
    ],
  },
  "mph-to-kmh": {
    about: [
      "Road signs and speedometers in the United Kingdom and the United States use miles per hour, while most other countries use kilometers per hour. Drivers renting a car abroad, cyclists, and anyone reading speed limits or car specifications need to switch between them.",
      "One mile per hour is exactly 1.609344 km/h. A rough estimate is mph times 1.6, so 50 mph is about 80 km/h. Typical UK limits translate as 30 mph = 48 km/h, 60 mph = 97 km/h and 70 mph = 113 km/h, and these are the figures to expect on signs when crossing a border.",
    ],
    common: [10, 20, 30, 40, 50, 60, 70, 80],
    faqs: [
      { q: "How fast is 70 mph in km/h?", a: "70 mph is 112.65 km/h, which is the UK motorway limit." },
      { q: "Which countries use mph?", a: "The United Kingdom and the United States use miles per hour on roads, along with a few territories and smaller countries." },
    ],
  },
  "kmh-to-mph": {
    about: [
      "Kilometers per hour is the speed unit on roads, in weather reports and in sports in most of the world. Visitors driving in the United Kingdom or the United States need the figure in miles per hour, and the reverse is needed when reading international car, bike and train specifications.",
      "One km/h is 0.621371 mph. A rough estimate is km/h times 0.6, with a little extra, or multiply by 5 and divide by 8. Common limits convert to about 31 mph for 50 km/h, 50 mph for 80 km/h, 62 mph for 100 km/h and 81 mph for 130 km/h.",
    ],
    common: [30, 50, 80, 100, 110, 120, 130],
    faqs: [
      { q: "How fast is 100 km/h in mph?", a: "100 km/h is 62.14 mph." },
      { q: "What is 130 km/h in mph?", a: "130 km/h is 80.78 mph, which is a common motorway limit in Europe." },
    ],
  },
  "liters-to-gallons": {
    about: [
      "Liters are used for fuel, milk, water and tanks in most countries, while gallons are used for fuel in the United States and, in a different size, in the United Kingdom. This page gives the US gallon of 3.78541 liters.",
      "The UK imperial gallon is 4.54609 liters, about 20% larger, so fuel economy in miles per gallon differs between the two countries for the same car. To convert fuel use, 235.215 divided by the US miles per gallon gives liters per 100 km.",
    ],
    common: [1, 5, 10, 20, 40, 50, 100],
    faqs: [
      { q: "How many US gallons is a 50 liter tank?", a: "A 50 liter tank holds 13.21 US gallons." },
      { q: "What is the difference between a US and a UK gallon?", a: "A US gallon is 3.785 liters and a UK imperial gallon is 4.546 liters, about 20% larger." },
    ],
  },
  "square-feet-to-square-meters": {
    about: [
      "Home sizes are quoted in square feet in the United States, India and a few other countries, and in square meters in most of the rest of the world. Anyone comparing apartments abroad, planning a renovation or buying flooring or paint needs to convert between the two.",
      "One square foot is 0.092903 square meters, so a quick estimate is to divide by 10.8. Room area is length times width, so a 12 ft by 15 ft room is 180 sq ft, or 16.7 sq m. Do not convert each side with the area factor: convert only the final area, or convert each side at 0.3048 m per foot.",
    ],
    common: [100, 180, 500, 800, 1000, 1500, 2000, 2500],
    faqs: [
      { q: "How many square meters is a 1,000 sq ft apartment?", a: "1,000 square feet is 92.9 square meters." },
      { q: "How do I convert room dimensions?", a: "Multiply length by width in feet to get square feet, then multiply by 0.092903. A 12 ft by 15 ft room is 180 sq ft, which is 16.7 sq m." },
    ],
  },
};

export const INDEXED_UNIT_SLUGS = new Set(Object.keys(unitExtras));
