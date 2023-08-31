const tags = {
  common: 'common',
  indian: 'indian',
  carnatic: 'carnatic',
  hindustani: 'hindustani',
};

type ScaleInfo = {name: string, tags: string[]};

const scaleName = (name: string, tag: string|string[] = []): ScaleInfo => (
  {name, tags: Array.isArray(tag) ? tag : [tag]}
);

const scales = {
  12: {
    0b101011010101: [
      scaleName('Major'),
      scaleName('Ionian'),
      scaleName('Ionian'),
      scaleName('Dheerasankarabharanam', tags.carnatic),
      scaleName('Bilaval', tags.hindustani),
    ],
    0b111001011100: [scaleName('Kanakangi', tags.carnatic)],
    0b111001011010: [scaleName('Ratnangi', tags.carnatic)],
    0b111001011001: [scaleName('Ganamurti', tags.carnatic)],
    0b111001010110: [scaleName('Vanaspati', tags.carnatic)],
    0b111001010101: [scaleName('Manavati', tags.carnatic)],
    0b111001010011: [scaleName('Tanarupi', tags.carnatic)],
    0b110101011100: [scaleName('Senavati', tags.carnatic)],
    0b110101011001: [scaleName('Dhenuka', tags.carnatic)],
    0b110101010110: [scaleName('Natakapriya', tags.carnatic)],
    0b110101010101: [scaleName('Kokilapriya', tags.carnatic)],
    0b110101010011: [scaleName('Rupavati', tags.carnatic)],
    0b110011011100: [scaleName('Gayakapriya', tags.carnatic)],
    0b110011011010: [scaleName('Vakulabharanam', tags.carnatic)],
    0b110011011001: [
      {name: 'Byzantine'},
      scaleName('Mayamalavagowla', tags.carnatic),
      scaleName('Bhairav', tags.hindustani),
    ],
    0b110011010110: [scaleName('Chakravakam', tags.carnatic)],
    0b110011010101: [scaleName('Suryakantam', tags.carnatic)],
    0b110011010011: [scaleName('Hatakambari', tags.carnatic)],
    0b101101011100: [scaleName('Jhankaradhvani', tags.carnatic)],
    0b101101011010: [
      scaleName('Minor'),
      scaleName('Aeolian'),
      scaleName('Natabhairavi', tags.carnatic),
    ],
    0b101101011001: [
      scaleName('Harmonic Minor'),
      scaleName('Keeravani', tags.carnatic),
    ],

    0b101101010101: [{name: 'Melodic Minor'}],

    0b101101010110: [{name: 'Dorian'}],
    0b110101011010: [{name: 'Phrygian'}, scaleName('Hanumatodi', tags.carnatic)],
    0b101010110101: [{name: 'Lydian'}],
    0b101011010110: [{name: 'Mixolydian'}],
    0b110101101010: [{name: 'Locrian'}],

    0b101010101010: [{name: 'Whole-tone'}],
    0b111111111111: [{name: 'Chromatic'}],

    0b100101010010: [{name: 'Pentatonic Minor'}],

    // 0b110010110101: [scaleName('Marva (thaat)', tags.indian)],
  },
};

export default scales;

export const getScales = (tones: number = 12): {[binaryScale: number]: ScaleInfo[]} =>
  scales[tones] ?? {};

/**
 * TODO: Exclude list.
 */
export const getScalesExcluding = (exclude: string[], tones: number = 12): {[binaryScale: number]: ScaleInfo[]} => {
  const res = Object.entries(getScales(tones))
    .map(([key, infos]): [number, ScaleInfo[]] => ([
      +key,
      infos.filter(({tags}) => tags ? tags.includes(exclude[0]) : true),
    ]))
    .filter(([, infos]) => infos.length !== 0);

  return Object.fromEntries(res);
};

export const findBinaryScaleFromName = (scaleName: string, tones: number = 12): number => {
  const scalesList: {[tones: number]: ScaleInfo[]} = scales[tones];
  const cleanedScaleName = scaleName.toLowerCase();

  return +Object.entries(scalesList)
    .find(([, names]) => 
      names.find(({name}) => name.toLowerCase() === cleanedScaleName)
    )[0] ?? 0;
}

export const namesFromScale = (selected: number, tones: number = 12): string[] =>
  Object.values(scales[tones][+selected] ?? []).map((i: ScaleInfo) => i.name ?? '');

  // TODO ? To remove not selected names (like indian ones)
// export const namesFromScale = (scales, tones = 12) =>
//   Object.values(scales[tones][+selected] ?? []).map(i => i.name ?? '');

export const hasScale = (selected: number, tones: number = 12): boolean => scales[tones] && scales[tones][+(selected ?? 0)];
