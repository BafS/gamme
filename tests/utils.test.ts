import { it, expect } from 'vitest';
import * as utils from '../src/lib/utils';

const pitchClassNotes = {
  0: 'C',
  2: 'D',
  4: 'E',
  5: 'F',
  7: 'G',
  9: 'A',
  11: 'B',
};

it('Rotate array', () => {
  expect(utils.rotateArr([], 0)).toStrictEqual([]);
  expect(utils.rotateArr([], 3)).toStrictEqual([]);
  expect(utils.rotateArr([1], 3)).toStrictEqual([1]);
  expect(utils.rotateArr([1, 2, 3, 4], 0)).toStrictEqual([1, 2, 3, 4]);
  expect(utils.rotateArr([1, 2, 3, 4], 4)).toStrictEqual([1, 2, 3, 4]);
  expect(utils.rotateArr([1, 2, 3, 4], 1)).toStrictEqual([2, 3, 4, 1]);
  expect(utils.rotateArr([1, 2, 3, 4], 2)).toStrictEqual([3, 4, 1, 2]);
  expect(utils.rotateArr([1, 2, 3, 4], 6)).toStrictEqual([3, 4, 1, 2]);
  expect(utils.rotateArr(['A', 'B', 'C'], 0)).toStrictEqual(['A', 'B', 'C']);
  expect(utils.rotateArr(['A', 'B', 'C'], 3)).toStrictEqual(['A', 'B', 'C']);
  expect(utils.rotateArr(['A', 'B', 'C'], 9)).toStrictEqual(['A', 'B', 'C']);
  expect(utils.rotateArr(['A', 'B', 'C'], 2)).toStrictEqual(['C', 'A', 'B']);
});

it('Hex string to bin string', () => {
  expect(utils.hex2bin('3')).toBe('0011');
  expect(utils.hex2bin('E')).toBe('1110');
  expect(utils.hex2bin('EE')).toBe('11101110');
  expect(utils.hex2bin('EEE')).toBe('111011101110');
  expect(utils.hex2bin('0')).toBe('0000');
  expect(utils.hex2bin('0F')).toBe('00001111');
  expect(utils.hex2bin('00F')).toBe('000000001111');
});

it('Bin scale to list', () => {
  expect(utils.binaryScaleToList(0b0)).toStrictEqual([]);
  expect(utils.binaryScaleToList(0b1)).toStrictEqual([1]);
  expect(utils.binaryScaleToList(0b1000001)).toStrictEqual([1, 0, 0, 0, 0, 0, 1]);
  expect(utils.binaryScaleToList(0b1110)).toStrictEqual([1, 1, 1, 0]);
  expect(utils.binaryScaleToList(0b01110)).toStrictEqual([1, 1, 1, 0]);
  expect(utils.binaryScaleToList(0b00000001110)).toStrictEqual([1, 1, 1, 0]);
  expect(utils.binaryScaleToList(0b110010110101)).toStrictEqual([1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1]);
  expect(utils.binaryScaleToList(0b101)).toStrictEqual([1, 0, 1]);
});

it('Steps to intervals', () => {
  expect(utils.stepsToIntervals([])).toStrictEqual([]);

  expect(
    utils.stepsToIntervals([1,0,1,1,0,1,0,1,0,1,0,1]
  ).filter(Boolean)).toStrictEqual(['1', '2', '3-', '4', '5', '6', '7']);

  // Locrian
  expect(
    utils.stepsToIntervals([1,1,0,1,0,1,1,0,1,0,1,0]
  ).filter(Boolean)).toStrictEqual(['1', '2-', '3-', '4', '5-', '6-', '7-']);

  // Pentatonic Minor
  expect(
    utils.stepsToIntervals([1,0,0,1,0,1,0,1,0,0,1,0]
  ).filter(Boolean)).toStrictEqual(['1', '3-', '4', '5', '7-']);
});

it('intervalsToSteps', () => {
  expect(utils.intervalsToSteps('1,2,3,4+,5,6,7'))
    .toStrictEqual([1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1]);

  expect(utils.intervalsToSteps('1 2 3 4+ 5 6 7'))
    .toStrictEqual([1,0,1,0,1,0,1,1,0,1,0,1]);

  // expect(utils.intervalsToSteps('1 2 3 4# 5 6 7'))
    // .toStrictEqual([1,0,1,0,1,0,1,1,0,1,0,1]);
});

it('Steps to key signature', () => {
  expect(
    utils.stepsToIntervals([1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1])
  ).toStrictEqual(["1", null, "2", null, "3", "4", null, "5", null, "6", null, "7"]);

  expect(utils.stepsToIntervals([1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1]))
    .toStrictEqual(['1', '2-', null, null, '3', '4', null, '5', '6-', null, null, '7']);

  expect(
    utils.stepsToIntervals([1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]).filter(Boolean)
  ).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);

  // Major blues
  expect(
    utils.stepsToIntervals([1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0]).filter(Boolean)
  ).toStrictEqual(["1", "2", "3-", "3", "5", "6"]);

  // Phrygian Dominant
  // 1, b2, 3, 4, 5, b6, b7 on all-guitar-chords (Phrygian Major)
  // 1, b2, 3, 4, 5, b6, b7 on https://www.fretflip.com/
  expect(
    utils.stepsToIntervals([1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0]).filter(Boolean)
  ).toStrictEqual(["1", "2-", "3", "4", "5", "6-", "7-"]);

  // Melodic Minor
  // 1, 2, b3, 4, 5, 6, 7 on all-guitar-chords (Phrygian Major)
  // 1, 2, b3, 4, 5, 6, 7 on https://www.fretflip.com/
  expect(
    utils.stepsToIntervals([1,0,1,1,0,1,0,1,0,1,0,1]).filter(Boolean)
  ).toStrictEqual(["1", '2', "3-", "4", "5", '6', "7"]);

  // Pentatonic Minor scale
  // 1, b3, 4, 5, b7 on all-guitar-chords (Phrygian Major)
  // 1, b3, 4, 5, b7 on https://www.fretflip.com/
  expect(
    utils.stepsToIntervals([1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0]).filter(Boolean)
  ).toStrictEqual(["1", "3-", "4", "5", "7-"]);

  expect(utils.stepsToIntervals([1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0]).filter(Boolean))
    .toStrictEqual(['1', '2', '3-', '4', '5', '6', '7-']);

  // Whole-tone (could be different)
  // 1, 2, 3, #4, #5, b7 on all-guitar-chords
  // 1, 2, 4, #4, #5, #6 on https://www.fretflip.com/
  expect(utils.stepsToIntervals([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]).filter(Boolean))
    .toStrictEqual(['1', '2', '3', '4+', '5+', '7-']);

  // Chromatic
  // 1, b2, 2, b3, 3, 4, b5, 5, #5, 6, b7, 7 all-guitar-chords
  expect(
    utils.stepsToIntervals([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]).filter(Boolean)
  ).toStrictEqual(['1', '2-', '2', '3-', '3', '4', '5-', '5', '6-', '6', '7-', '7']);
});

it('fromIntervstepsToIntervalsalToScale', () => {
  // Lydian
  expect(
    utils.stepsToIntervals([1,0,1,0,1,0,1,1,0,1,0,1])
  ).toStrictEqual(['1', null, '2', null, '3', null, '4+', '5', null, '6', null, '7']);
});

it('fromIntervalToScale', () => {
  // Lydian
  expect(
    utils.fromIntervalToScale(['1', null, '2', null, '3', null, '4+', '5', null, '6', null, '7'], 'C', pitchClassNotes)
  ).toStrictEqual(['C', null, 'D', null, 'E', null, 'F+', 'G', null, 'A', null, 'B']);

  // Lydian
  expect(
    utils.fromIntervalToScale(['1', null, '2', null, '3', null, '4+', '5', null, '6', null, '7'], 'C', pitchClassNotes).filter(Boolean)
  ).toStrictEqual(['C', 'D', 'E', 'F+', 'G', 'A', 'B']);

  // Lydian
  expect(
    utils.fromIntervalToScale(['1', null, '2', null, '3', null, '4+', '5', null, '6', null, '7'], 'G+', pitchClassNotes).filter(Boolean)
  ).toStrictEqual(['G+', 'A+', 'B+', 'C++', 'D+', 'E+', 'F++']);

  // Pentatonic Minor
  expect(
    utils.fromIntervalToScale(['1', null, null, '3-', null, '4', null, '5', null, null, '7-', null], 'G-', pitchClassNotes).filter(Boolean)
  ).toStrictEqual(['G-', 'B--', 'C-', 'D-', 'F-']);
});
