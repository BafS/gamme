const intervalTypes = [
  ['1'],
  ['2-'],
  ['2'],
  ['3-', '2+'],
  ['3'],
  ['4'],
  ['4+', '5-'],
  ['5'],
  ['5+', '6-'],
  ['6'],
  ['7-', '6+'],
  ['7'],
];

type BinaryArray = (0 | 1)[]

const getKeyFromValue = (object: object, value: any): any => Object.keys(object).find(key => object[key] === value);

const findTonesFromInterval = (interval: string): number => {
  let intervalFound = -1;
  intervalTypes.find((l, t) => {
    l.find(i => {
      if (i === interval) {
        intervalFound = t;

        return true;
      }
    });

    return intervalFound !== -1;
  });

 return intervalFound;
}

const intervalsSymbolToIntervals = (intervals: string|string[]): number[] => {
  if (!Array.isArray(intervals)) {
    intervals = intervals.replace(/ *[,\|]+ */g, ' ').split(' ');
  }

  // TODO fn to "clean" string (b2 => b+ etc.)
  // intervals.map(i => i.replace('b', '-'));
  
  return intervals.map(findTonesFromInterval)
}

/**
 * Convert intervals to steps.
 * Eg. "1 2 b3 6 7" to [1, 0, 1, ...]
 */
export const intervalsToSteps = (intervals: string|string[]): BinaryArray => {
  const intervalList = intervalsSymbolToIntervals(intervals);

  const steps = (new Array(intervalTypes.length)).fill(0);
  intervalList.forEach(i => steps[i] = 1);

  return steps;
}

/**
 * @param {Object<string|number, Object>} obj
 * @return {Object<string|number, string|number|Object>}
 */
export const selectColumn = (obj: object, column: string|number): object =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k,  v[column]]));

export const intervalBetweenNoteSymbol = (notes: {[classPitch: number]: string}, noteA: string, noteB: string): number => (
  (fromNoteSymbolToInterval(noteB, notes) - fromNoteSymbolToInterval(noteA, notes) + 12) % 12
);

/**
 * Hex string to binary representation string.
 */
export const hex2bin = (hex: string): string => hex.split('').map(i => parseInt(i, 16).toString(2).padStart(4, '0')).join('');

/**
 * Integer string to binary representation string.
 */
export const int2bin = (int: string): string => (parseInt(int, 10).toString(2)).padStart(8, '0');

export const rotateArr = <T>(arr: T[], n: number): T[] => {
  const len = arr.length;

  // rotated array
  return arr.slice(n % len, len).concat(arr.slice(0, n % len));
};

export const stringNotationToStringSteps = (str: string): string => str
  .replace(/[-, \t]+/g, ' ')
  .replaceAll('5H', '1 0 0 0 0')
  .replaceAll('2T', '1 0 0 0 ')
  .replaceAll('2W', '1 0 0 0 ')
  .replaceAll('T1/2', '1 0 0 ')
  .replaceAll('W1/2', '1 0 0 ')
  .replaceAll('3W2', '1 0 0 ')
  .replaceAll('3H', '1 0 0 ')
  .replaceAll('T', '1 0 ')
  .replaceAll('W', '1 0 ')
  .replaceAll('S', '1 ')
  .replaceAll('H', '1 ')
  .trim()
;

export const binaryScaleToList = (binaryScale: number): BinaryArray => {
  const acc = [];
  const len = (Math.log2(binaryScale) + 1) | 0;
  for (let i = 0; i < len; ++i) {
    acc[len - i - 1] = binaryScale & 1;
    binaryScale = binaryScale >> 1;
  }

  // @ts-ignore
  return acc;
};

export const stringNotationToBinarySteps = (str: string): number[] => stringNotationToStringSteps(str)
  .split(/ +/)
  .map(n => +n)
  .filter(n => n === 0 || n === 1)
;

/**
 * Return a list of intervals (in halfsteps).
 */
export const binaryStepsToIntervals = (binarySteps: BinaryArray): BinaryArray => {
  let prevInterval = 0;
  let acc = [];
  binarySteps.forEach((a, i) => {
    if (a === 1 && i !== 0) {
      acc.push(prevInterval);
      prevInterval = 0;
    }
    prevInterval++;
  });
  acc.push(prevInterval);

  // @ts-ignore
  return acc;
};

export const humanizeIntervals = (intervals: number[], format: string[] = ['H', 'W', '3H', '2W', '5H', '3W', '7H', '4W', '9H', '5W']) =>
  intervals.map(i => format[i - 1]);

const trimAccidentals = (note: string): string => (note ?? '').replace(/[\+\-]*/g, '');

const splitNoteSymbol = (note: string): [noteBase: string, accidental :string] => (note === '' ? ['', ''] : [
  note.slice(0, 1),
  note.slice(1, note.length),
]);

const accidentalSymbolToNumber = (accidental: string): number => {
  const sign = accidental && accidental[0] === '-' ? -1 : 1;
  return (sign * accidental.length) | 0;
}

const getNoteSymbolInformation = (note: string): [noteBase: string, accidentalTone: number] => {
  const [noteBase, accidentals] = splitNoteSymbol(note);

  return [noteBase, accidentalSymbolToNumber(accidentals)];
}

/**
 * @param {string} note (like "C", "A+", etc.)
 */
const fromNoteSymbolToInterval = (note: string, notesMatrix: {[pitchNumber: string]: string}): number => {
  const [noteBase, accidentals] = getNoteSymbolInformation(note);
  const keyBase = +getKeyFromValue(notesMatrix, noteBase);

  return keyBase + accidentals;
};

export const stepsToIntervals = (steps: BinaryArray): string[] => {
  const intervalSet = {};

  return steps.map((s, i) => {
    if (s !== 1) {
      return null;
    }

    i = i % (intervalTypes.length);

    let [currType] = intervalTypes[i];
    let baseNote = trimAccidentals(currType);
    if (intervalSet[baseNote] === true) {
      currType = intervalTypes[i][1] ?? intervalTypes[i][0];
      baseNote = trimAccidentals(currType);
    }
    intervalSet[baseNote] = true;

    return currType;
  });
}

/**
 * Create note symbol using not and accidental, for example ('G', -1) will be `G-`.
 * @return {string} C, A+, etc.
 */
const createNoteSymbol = (noteSymbol: string, accidental: number): string => {
  const accidentalStr = accidental < 0 ? '-'.repeat(-accidental) : '+'.repeat(accidental);

  return `${noteSymbol}${accidentalStr}`;
}

/**
 * @returns {string} C, A+, etc.
 */
const getNoteSymbolFromNoteDegree = (noteRoot: string, noteWanted: string, degree: number, notesMatrix: {[classPitch: number]: string}): string => {
  const diff = intervalBetweenNoteSymbol(notesMatrix, noteRoot, noteWanted);
  const accidental = degree - diff;

  return createNoteSymbol(noteWanted, accidental);
};

/**
 * @param {-1 | 1} accidentals (-1 => -, 1 => +)
 */
export const fromIntervalToScale = (intervalSymbols: (string|null)[], rootNote: string, notesMatrix: {[key: number]: string}, accidentals: (-1 | 1) = 1): string[] => {
  // const notesSet = {};
  const notes = Object.values(notesMatrix);
  const notesLen = notes.length;
  const [baseRootNote, acc] = getNoteSymbolInformation(rootNote);
  const rootNoteInterval = notes.indexOf(baseRootNote);

  return intervalSymbols.map((symbol, degree) => {
    if (symbol === null) {
      return null;
    }

    const [degreeBaseStr] = splitNoteSymbol(symbol);

    const noteIdx = (+degreeBaseStr - 1 + rootNoteInterval) % notesLen;

    let currNote = notes[noteIdx];
    let baseNote = trimAccidentals(currNote);

    // if (notesSet[baseNote] === true) {
    //   console.info("DUPLICATE NOTE"); // TODO ?
    // }

    let noteWithAccidental = getNoteSymbolFromNoteDegree(baseRootNote, baseNote, degree + acc, notesMatrix);
    
    // notesSet[baseNote] = true;

    return noteWithAccidental;
  });
};

export const generateScaleInformation = (
  generatedIntervals: string[],
  rootNote: string,
  startingNote: string,
  nKeys: number,
  notes: {[tones: number]: string},
  translation: {notes?: any, intervals?: any} = {},
  tones: number = 12,
) => {
  const startingNoteIndex = fromNoteSymbolToInterval(startingNote, notes);
  const generatedNotes = fromIntervalToScale(generatedIntervals, rootNote, notes);
  const intervalsInt = intervalBetweenNoteSymbol(notes, startingNote, rootNote);

  return [...Array(nKeys)].map((_, i) => {
    const relativeInt = (i - intervalsInt + tones) % tones;
    const intervalNumber = generatedIntervals[relativeInt];
    const noteName = generatedNotes[relativeInt] || notes[(startingNoteIndex + i) % tones]  || (notes[(startingNoteIndex + i - 1) % tones] + '+');
    return {
      interval: translation.intervals[intervalNumber] || intervalNumber,
      // TODO: Choose to generate + or - accidentals
      tone: !!notes[(startingNoteIndex + i) % tones],
      name: translation.notes ? translation.notes[noteName] ?? noteName : noteName,
      active: generatedNotes[relativeInt] || false,
    };
  });
};
