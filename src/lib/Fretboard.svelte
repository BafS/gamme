<script lang="ts">
  const svgWidth = 1000;
  const svgHeight = 280;
  const marginBottom = 30;

  export let scales;
  export let fretDecoration = (n: number) => [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 2][n % 12];
  export const defaultColors = {
    background: 'transparent',
    cord: 'rgba(0,0,0,.5)',
    fret: 'rgb(50,50,50)',
    key: {
      selected: `rgba(255, 70, 85, .85)`,
      root: `rgba(250, 140, 40, .85)`,
    },
  };

  export let colors = defaultColors;

  $: totalCords = scales.length;
  $: frets = (scales ?? [[]])[0].length - 1;

  $: width = svgWidth / (frets + .7);
  $: height = (svgHeight - marginBottom) / totalCords;

  $: fretboardMiddleY = (cordNumber: number) => svgHeight - marginBottom - height * cordNumber - height / 2;

  $: fretPosX = (n: number) => (width * n) - width / 3;

  $: fretMiddlePosX = (n: number) => {
    if (n === 0) {
      return fretPosX(n) + width / 1.5;
    }

    return fretPosX(n) + width / 2
  };

  const centerFretboardY = () => (svgHeight - marginBottom) / 2;
</script>

<svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
  <rect width="100%" height="100%" fill={colors.background}/>
  {#each Array(frets) as _, i}
    <rect
      x={fretPosX(i + 1)}
      y=0
      width={i === 0 ? 4 : 2}
      height={svgHeight - marginBottom}
      fill={colors.fret}
    ></rect>

    <text
      x={fretMiddlePosX(i + 1)}
      y={svgHeight - marginBottom / 2}
      dominant-baseline="middle"
      text-anchor="middle"
    >{i + 1}</text>

    {#if fretDecoration(i) !== 0}
      <circle
        cy={centerFretboardY() + (fretDecoration(i) === 2 ? centerFretboardY() / 3 : 0)}
        cx={fretMiddlePosX(i + 1)}
        r={8}
        fill='rgba(100, 100, 100, .5)'
      ></circle>
      {#if fretDecoration(i) === 2}
        <circle
          cy={centerFretboardY() - centerFretboardY() / 3}
          cx={fretMiddlePosX(i + 1)}
          r={8}
          fill='#aaa'
        ></circle>
      {/if}
    {/if}
  {/each}

  {#each scales as scaleCord, cordNumber}
    <rect
      x={fretPosX(1)}
      y={fretboardMiddleY(cordNumber)}
      width={svgWidth}
      height={1 + Math.round((2 / (cordNumber + 1)) * 100) / 100}
      fill={colors.cord}
    ></rect>
    {#each scaleCord as note, i}
      {#if note.active}
        <circle
          cx={fretMiddlePosX(i)}
          cy={fretboardMiddleY(cordNumber)}
          r={19}
          fill={([1, '1', 'I', 'T'].indexOf(note.interval) !== -1) ? colors.key.root : colors.key.selected}
          stroke="rgba(0, 0, 0, .9)"
          stroke-width="1"
        ></circle>
      {/if}

      <text
        x={fretMiddlePosX(i)}
        y={fretboardMiddleY(cordNumber) + 1}
        dominant-baseline="middle"
        text-anchor="middle"
        fill={`rgba(0, 0, 0, ${note.active ? '1' : '.6'})`}
      >{note.active ? `${note.interval}/${note.name}` : note.name}</text>
    {/each}
  {/each}
</svg>

<style>
  svg {
    width: 100%;
    height: auto;
  }

  svg text {
    font-size: 1rem;
  }
</style>
