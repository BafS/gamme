<script lang="ts">
  import Fretboard from './lib/Fretboard.svelte';
  import Piano from './lib/Piano.svelte';
  import {
    hex2bin,
    stringNotationToBinarySteps,
    binaryScaleToList,
    binaryStepsToIntervals,
    stepsToIntervals,
    humanizeIntervals,
    int2bin,
    selectColumn,
    intervalsToSteps,
    generateScaleInformation,
    rotateArr,
    intervalBetweenNoteSymbol,
  } from './lib/utils';
  import {getScalesExcluding, hasScale, namesFromScale} from './lib/scales';
  import translationResource from '../resource/translations';

  const totalTones = 12;

  // tone => note
  const notesMatrix: {[tone: number]: string} = {
    0: 'A',
    2: 'B',
    3: 'C',
    5: 'D',
    7: 'E',
    8: 'F',
    10: 'G',
  };

  const guitar = {
    show: true,
    frets: 16,
    tuningInput: 'E A D G B E',
  };

  const keyboard = {
    show: false,
    keys: 25,
  };

  const parsedHash = new URLSearchParams(window.location.hash.substring(1));

  const translationIndex = 'english';
  let selectedRootNote = parsedHash.get('root')?.toUpperCase() ?? notesMatrix[0];
  let selected = 0b101101010101;
  let selectedString = parsedHash.get('input') ?? '1 0 0 1 0 1 0 1 0 0 1 0';

  let inputType = '';
  const debug = parsedHash.get('debug') === 'true';

  const cleanInputBase = (input: string): string[] => input
    .trim()
    .replace(/ *[,\|]+ */g, ' ')
    .split(' ');

  const userInputToList = (input: string): string[] => cleanInputBase(
      input
        .replace(/[Bb♭–—]/g, '-')
        .replace(/[#♯]/g, '+')
    )
    .map(n => n.replace(/^([-+]{0,2})([^-+]*)([^-+]{0,2})$/, '$2$1$3'));

  const rootList = () => new Array(totalTones)
    .fill(0)
    .map((_, i) => notesMatrix[i] ?? null)
    .map((e, i, p) => e === null
      ? [p[(i + totalTones - 1) % totalTones] + '+', p[(i + 1) % totalTones] + '-']
      : e
    )
    .reduce((a, c) => [...a, ...(Array.isArray(c) ? c : [c])]);

  const transformInputStringToSteps = (selectedString: string): [string, number|null] => {
    if (selectedString === '') {
      return ['none', null];
    }

    inputType = 'unrecognized';

    const cleanInput = selectedString.replace(/[ ,\|\-]/g, '')

    if (cleanInput.match(/^[01]{4,}/)) {
      inputType = 'Binary';
      selected = Number.parseInt(cleanInput, 2);
    } else if (cleanInput.match(/^[0-9a-fA-F]{3}$/)) {
      inputType = 'Hexadecimal';
      steps = hex2bin(selectedString).split('').map(n => +n);
      selected = Number.parseInt(selectedString, 16);
    } else if (cleanInput.match(/^[1-5\/-TWSH]{3,}$/) && cleanInput.match(/[TWSH]/)) {
      inputType = 'Tone/Steps';
      const selectedSanit = selectedString.replaceAll('x', '1').replaceAll('-', '0');
      steps = stringNotationToBinarySteps(selectedSanit);
      selected = Number.parseInt(steps.join(''), 2); // TODO
    } else if (selectedString.length > 1) {
      // TODO: Function to change accidentals (b/#/etc) to -+ notation
      const selectedSanit = userInputToList(selectedString);
      steps = intervalsToSteps(selectedSanit);
      selected = Number.parseInt(steps.join(''), 2);

      inputType = 'Intervals (♭/♯)';
    }

    return [inputType, selected ?? null];
  };

  let steps: any[];
  $: steps = binaryScaleToList(selected ?? 0);

  $: notesTranslation = selectColumn(translationResource.chromaticVariants, translationIndex);
  $: intervalsTranslation = selectColumn(translationResource.interval, 'english');

  $: generatedIntervals = stepsToIntervals(steps);

  const rootNoteForGeneration = notesMatrix[0];
  $: scaleBaseInformation = generateScaleInformation(
    generatedIntervals,
    selectedRootNote,
    rootNoteForGeneration,
    totalTones,
    notesMatrix,
    {
      notes: notesTranslation,
      intervals: intervalsTranslation,
    },
  );

  $: getScaleLengthFromRoot = (rootNote: string, length: number) => {
    const interval = intervalBetweenNoteSymbol(notesMatrix, rootNoteForGeneration, rootNote);
    const rotatedScale = rotateArr(scaleBaseInformation, interval);

    return (new Array(Math.min(+length, 200)))
      .fill(null)
      .map((_, i) => rotatedScale[i % totalTones]);
  };

  $: scaleInformation = getScaleLengthFromRoot('A', keyboard.keys);

  $: scaleBoard = userInputToList(guitar.tuningInput.toUpperCase()).map((root) => getScaleLengthFromRoot(root, +guitar.frets + 1));

  $: [inputType, selected] = transformInputStringToSteps(selectedString);
</script>

<main>
  <div class="container">
    <h2>
      Gamme –
      {notesTranslation[selectedRootNote] ?? selectedRootNote}
      {hasScale(selected, totalTones) ? namesFromScale(selected, totalTones).join('/') : '(unknown)'} scale
      {#if generatedIntervals.length > 0}
        ({generatedIntervals.filter(Boolean).map((i) => intervalsTranslation[i] ?? i)})
      {/if}
    </h2>

    <div class="info">
      Intervals: {humanizeIntervals(binaryStepsToIntervals(steps)).join('-')}
      {#if steps.length !== totalTones}
        <span class="warning">
          Scale is too {steps.length < totalTones ? 'short' : ''}
          {steps.length > totalTones ? 'long' : ''}
        </span>
      {/if}
      {#if debug}
        <br>
        <small><code>steps: {steps}</code></small>
      {/if}
    </div>
  </div>

  {#if keyboard.show}
    <div id="keyboard">
      <Piano scale={scaleInformation} />
    </div>
  {/if}

  {#if guitar.show}
    <div id="fretboard">
      <Fretboard scales={scaleBoard} />
    </div>
  {/if}

  <div id="inputs" class="container">
    <div class="main-input">
      <select bind:value={selectedRootNote}>
        {#each rootList() as root}
          <option value={root}>
            {notesTranslation[root] ?? root}
          </option>
        {/each}
      </select>

      <div style="position: relative">
        <input class="input-l" bind:value={selectedString} placeholder="scale">
        <span class="input-top">Input type: {inputType}</span>
      </div>

      <select bind:value={selectedString}>
        {#each Object.entries(getScalesExcluding([], totalTones)) as [scaleBin, infos]}
          <option value={int2bin(scaleBin).split('').join(' ')}>
            {infos.map(({name}) => name).join('/')}
          </option>
        {/each}
      </select>
    </div>

    <!--
    <p>
      Scale input is flexible and can handle many notations:
    </p>
    <ul>
      <li>Using degrees: 1,2,3♭,4,5,6,7</li>
      <li>Using intervals: W-H-W-W-W-H-W (W for a whole step, H half step)</li>
      <li>Using active tones: 1 0 1 1 0 1 0 1 0 1 0 1</li>
      <li>Using active tones with hexadecimal representation: B55 (represents 101101010101)</li>
    </ul>
    -->

    <h3>Options</h3>

    <div id="options" class="container">
      <div class="box">
        <h4>Guitar</h4>
        Show fretboard: <input type=checkbox bind:checked={guitar.show}>
        <br>
        Guitar tuning: <input class="input-m" bind:value={guitar.tuningInput} placeholder="E A D G B E" maxlength="30">
        <br>
        Number of frets: <input class="input-s" bind:value={guitar.frets} placeholder="16" type="number" min="5" max="36">
      </div>

      <div class="box">
        <h4>Keyboard</h4>
        Show keyboard: <input type=checkbox bind:checked={keyboard.show}>
        <br>
        Number of keys: <input class="input-s" bind:value={keyboard.keys} placeholder="25" type="number" min="5" max="200">
      </div>
    </div>
  </div>
</main>

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
  }

  #inputs {
    /* text-align: left; */
    /* background-color: #faf; */
  }

  .info {
    margin: 10px 0;
  }

  .main-input {
    display: flex;
    margin-bottom: 35px;
    /* justify-content: flex-end; */
    /* flex-wrap: wrap; */
    align-items: center;
    /* position: relative; */
  }

  .main-input select, .main-input input {
    margin: 0 2px;
  }

  .input-top {
    color: #555;
    font-size: .75rem;
    position: absolute;
    left: 3px;
    top: 36px;
  }

  select {
    line-height: 24px;
    display: inline-block;
    padding: .25rem 1.8rem .25rem .5rem;
    font-size: .875rem;
    background-color: #fff;
    border: var(--input-border);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right .5rem center;
    background-size: 16px 12px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    font-family: var(--font-monospace) !important;
  }

  input {
    line-height: 24px;
    display: inline-block;
    font-size: .875rem;
    padding: .25rem .5rem;
    box-sizing: border-box;
    /* border-radius: 0; */
    border: var(--input-border);
    font-weight: 400;
    font-family: var(--bs-font-monospace) !important;
  }

  input[type="number"] {
    /* font-size: 1rem; */
    min-width: 52px;
    padding-right: 0;
  }

  #options {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    /* border: 1px solid red; */
  }

  #options input {
    /* padding: .175rem .5rem; */
  }

  .box {
    flex: 1;
    /* border: 2px solid blue; */
    /* max-width: 350px; */
    text-align: left;
    /* flex: 0 1 150px; */
    margin: 5px 0;
  }

  #fretboard, #keyboard {
    max-width: 1200px;
    margin: 20px auto;
  }

  h2 {
    font-size: 1.25rem;
    margin: .4rem 0;
  }

  h3, h4 {
    margin: .5rem 0;
  }

  .warning {
    color: rgb(68, 40, 2);
    background: #ebcb8b;
  }

  input {
    width: 50px;
    font-family: 'Courier New', Courier, monospace;
  }

  input.input-s {
    width: 50px;
  }

  input.input-m {
    width: 140px;
  }

  input.input-l {
    width: 250px;
  }

  main {
    text-align: left;
    padding: 1em;
    margin: 0 auto;
  }

  p {
    margin: 1rem auto;
    line-height: 1.3;
  }

  @media (min-width: 480px) {
  }
</style>
