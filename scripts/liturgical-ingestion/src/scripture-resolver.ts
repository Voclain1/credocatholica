/**
 * Fail-Closed Psalm Versification Resolver for M0.8.
 * Restricts Psalm chapter resolution strictly to the explicit tested mappings
 * required by the 7-day ingestion package.
 */

const VERIFIED_PSALM_CHAPTER_MAP: Record<number, number> = {
  1: 1,     // Oct 6: St. Bruno Proper Lectionary 652 (Modern Ps 1 -> D-R Vulgate Ps 1)
  5: 5,     // Sept 7: Mon 22nd Wk (Modern Ps 5 -> D-R Vulgate Ps 5)
  13: 12,   // Sept 8: Nativity BVM (Modern Ps 13 -> D-R Vulgate Ps 12)
  16: 15,  // Sept 23: St. Pio Proper (Modern Ps 16 -> D-R Vulgate Ps 15)
  17: 16,  // Sept 18: Fri 24th Wk (Modern Ps 17 -> D-R Vulgate Ps 16)
  19: 18,  // Sept 21: St. Matthew (Modern Ps 19 -> D-R Vulgate Ps 18)
  22: 21,  // Nov 3: Tue 31st Wk OT (Modern Ps 22 -> D-R Vulgate Ps 21)
  23: 22,  // Oct 11 & Oct 16: 28th Sunday / St. Margaret Mary (Modern Ps 23 -> D-R Vulgate Ps 22)
  24: 23,   // Sept 3: St. Gregory (Modern Ps 24 -> D-R Vulgate Ps 23)
  25: 24,   // Sept 27: 26th Sunday Year A (Modern Ps 25 -> D-R Vulgate Ps 24)
  27: 26,   // Oct 1: St. Therese (Modern Ps 27 -> D-R Vulgate Ps 26)
  31: 30,   // Sept 15: Our Lady of Sorrows (Modern Ps 31 -> D-R Vulgate Ps 30)
  33: 32,   // Aug 28 & Sept 2 & Sept 16 (Modern Ps 33 -> D-R Vulgate Ps 32)
  34: 33,   // Nov 17: St. Elizabeth of Hungary (Modern Ps 34 -> D-R Vulgate Ps 33)
  37: 36,   // Sept 4: Fri 21st Wk (Modern Ps 37 -> D-R Vulgate Ps 36)
  40: 39,   // Oct 14: St. Callistus Proper (Modern Ps 40 -> D-R Vulgate Ps 39)
  45: 44,   // Sept 9: St. Peter Claver (Modern Ps 45 -> D-R Vulgate Ps 44)
  46: 45,   // Nov 9: Dedication Lateran Basilica (Modern Ps 46 -> D-R Vulgate Ps 45)
  56: 55,   // Sept 19: Sat 24th Wk (Modern Ps 56 -> D-R Vulgate Ps 55)
  63: 62,   // Aug 30: 22nd Sunday Year A (Modern Ps 63 -> D-R Vulgate Ps 62)
  71: 70,   // Aug 29: Beheading of St. John (Modern Ps 71 -> D-R Vulgate Ps 70)
  72: 71,   // Dec 1: Tue 1st Wk Advent (Modern Ps 72 -> D-R Vulgate Ps 71)
  78: 77,   // Sept 14: Exaltation of Holy Cross (Modern Ps 78 -> D-R Vulgate Ps 77)
  80: 79,   // Oct 4: 27th Sunday Year A (Modern Ps 80 -> D-R Vulgate Ps 79)
  84: 83,   // Sept 11: Fri 23rd Wk (Modern Ps 84 -> D-R Vulgate Ps 83)
  85: 84,   // Oct 20: Tue 29th Wk (Modern Ps 85 -> D-R Vulgate Ps 84)
  87: 86,   // Dec 10: Our Lady of Loreto (Modern Ps 87 -> D-R Vulgate Ps 86)
  88: 87,   // Sept 30: St. Jerome (Modern Ps 88 -> D-R Vulgate Ps 87)
  89: 88,   // Nov 4: St. Charles Borromeo (Modern Ps 89 -> D-R Vulgate Ps 88)
  90: 89,   // Sept 24: Thu 25th Wk (Modern Ps 90 -> D-R Vulgate Ps 89)
  91: 90,   // Oct 2: Guardian Angels Proper (Modern Ps 91 -> D-R Vulgate Ps 90)
  95: 94,   // Sept 6: 23rd Sunday Year A (Modern Ps 95 -> D-R Vulgate Ps 94)
  96: 95,   // Oct 18 & Oct 19 & Oct 22: 29th Sunday / St Paul of Cross / St JPII (Modern Ps 96 -> D-R Vulgate Ps 95)
  97: 96,   // Dec 25: Christmas Mass at Dawn (Modern Ps 97 -> D-R Vulgate Ps 96)
  98: 97,   // Oct 15: Thu 28th Wk (Modern Ps 98 -> D-R Vulgate Ps 97)
  100: 99,  // Sept 15: Our Lady of Sorrows Weekday Branch (Modern Ps 100 -> D-R Vulgate Ps 99)
  103: 102, // Sept 13: 24th Sunday Year A (Modern Ps 103 -> D-R Vulgate Ps 102)
  105: 104, // Oct 10: Sat 27th Wk (Modern Ps 105 -> D-R Vulgate Ps 104)
  111: 110, // Oct 5: Mon 27th Wk (Modern Ps 111 -> D-R Vulgate Ps 110)
  112: 111, // Oct 16: St. Hedwig Proper Lectionary 659 (Modern Ps 112 -> D-R Vulgate Ps 111)
  113: 112, // Oct 12: Mon 28th Wk (Modern Ps 113 -> D-R Vulgate Ps 112)
  116: 115, // Sept 12: Sat 23rd Wk (Modern Ps 116 -> D-R Vulgate Ps 115)
  117: 116, // Oct 7: Our Lady of Rosary Weekday (Modern Ps 117 -> D-R Vulgate Ps 116)
  118: 117, // Sept 17: Thu 24th Wk (Modern Ps 118 -> D-R Vulgate Ps 117)
  119: 118, // Aug 31: Mon 22nd Wk (Modern Ps 119 -> D-R Vulgate Ps 118)
  124: 123, // Dec 28: Holy Innocents (Modern Ps 124 -> D-R Vulgate Ps 123)
  126: 125, // Sept 16: Saints Cornelius & Cyprian Memorial (Modern Ps 126 -> D-R Vulgate Ps 125)
  128: 127, // Sept 23: St. Pio Proper Lectionary 643A (Modern Ps 128 -> D-R Vulgate Ps 127)
  130: 129, // Dec 11: St. Damasus (Modern Ps 130 -> D-R Vulgate Ps 129)
  131: 130, // Oct 1: St. Therese Proper (Modern Ps 131 -> D-R Vulgate Ps 130)
  138: 137, // Sept 29: Saints Michael, Gabriel, Raphael Proper (Modern Ps 138 -> D-R Vulgate Ps 137)
  139: 138, // Sept 10: Thu 22nd Wk (Modern Ps 139 -> D-R Vulgate Ps 138)
  144: 143, // Sept 25: Fri 25th Wk (Modern Ps 144 -> D-R Vulgate Ps 143)
  145: 144, // Sept 1 & Sept 5 & Sept 20 25th Sunday Year A (Modern Ps 145 -> D-R Vulgate Ps 144)
  146: 145, // Nov 8: 32nd Sunday OT (Modern Ps 146 -> D-R Vulgate Ps 145)
  147: 146, // Dec 5: Sat 1st Wk Advent (Modern Ps 147 -> D-R Vulgate Ps 146)
  149: 148, // Nov 19: Thu 33rd Wk OT (Modern Ps 149 -> D-R Vulgate Ps 148)
  150: 149, // Nov 18: Wed 33rd Wk OT (Modern Ps 150 -> D-R Vulgate Ps 149)
};

export function mapModernPsalmToDouayRheims(modernCitationRef: string): string {
  if (!modernCitationRef) return modernCitationRef;

  const match = modernCitationRef.match(/^Psalm\s+(\d+)(.*)$/i);
  if (!match) return modernCitationRef;

  const modernChapter = parseInt(match[1], 10);
  const versesPart = match[2];

  const drChapter = VERIFIED_PSALM_CHAPTER_MAP[modernChapter];
  if (drChapter === undefined) {
    throw new Error(
      `Unsupported Psalm chapter '${modernChapter}' in M0.8 fail-closed resolver. Explicit mapping required.`
    );
  }

  return `Psalm ${drChapter}${versesPart}`;
}
