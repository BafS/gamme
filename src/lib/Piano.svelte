<script lang="ts">
  export const defaultColors = {
    background: '#000',
    key: {
      black: '#222',
      white: '#fff',
      root: `rgba(250, 140, 80, .85)`,
      default: `rgba(255, 80, 80, .85)`,
    },
  };

  type Scale = {
    interval: any;
    tone: boolean;
    name: any;
    active: string|boolean;
  };

  export let scale: Scale[] = [];
  export let colors = defaultColors;

  // let allNotes = [];
  // $: allNotes = (new Array(keys)).fill(null).map((_, i) => scale[i % 12]);

  $: tones = scale.filter(n => n.tone);
  // $: keys = scale.length;

  const svgWidth = 1000;
  const svgHeight = 240;
  const margin = {
    top: 2,
    bottom: 2,
    left: 2,
    right: 2,
  };
  const spaceBetweenTones = 2;
  $: width = (svgWidth + spaceBetweenTones - margin.left - margin.right) / tones.length;
  const height = svgHeight - margin.bottom - margin.top;

  let cachedPosition: number[] = [];
  let lastWidth = 0;

  const keyPosX = (n: number, width: number): number => {
    if (n === 0 || n === 1) {
      return margin.left;
    }

    if (width !== lastWidth) {
      cachedPosition = [];
    }

    if (cachedPosition[n]) {
      return cachedPosition[n];
    }

    const positionPrevious = keyPosX(n - 1, width);

    // Black key
    cachedPosition[n] = positionPrevious;

    if (scale[n] && scale[n].tone) {
      // White key
      cachedPosition[n] += width;
    }

    lastWidth = width;
    return cachedPosition[n];
  };
</script>

<svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
  <rect width="100%" height="100%" fill={colors.background}/>
  {#each scale as note, i}
    {#if note.tone}
      <g class="key" transform={`translate(${keyPosX(i, width)})`}>
        <rect
          x={0}
          y={margin.top}
          width={width - spaceBetweenTones}
          height={height}
          fill={note.active ? '#f4b4b4' : '#f4f4f4'}
        ></rect>
        <!-- colors.keys.white : colors.keys.black -->
        <text
          x={width / 2}
          y={(svgHeight - margin.bottom) * .95}
          fill="#000"
          dominant-baseline="middle"
          text-anchor="middle"
        >{i + 1}</text>

        <text
          x={width / 2}
          y={svgHeight * .75}
          dominant-baseline="middle"
          text-anchor="middle"
          fill={`rgba(0, 0, 0, 1)`}
        >{note.active ? `${note.interval}/${note.name}` : note.name}</text>
      </g>
    {/if}
  {/each}

  {#each scale as note, i}
    {#if !note.tone}
      <g class="key" transform={`translate(${keyPosX(i, width) + width})`}>
        <rect
          x={(-width * .9) / 2}
          y={margin.top}
          width={width * .9}
          height={svgHeight * .55}
          fill={note.active ? '#912' : '#000'}
        ></rect>

        <text
          y={20}
          fill="#fff"
          dominant-baseline="middle"
          text-anchor="middle"
        >{i + 1}</text>

        <text
          y={svgHeight * .25}
          dominant-baseline="middle"
          text-anchor="middle"
          fill="#fff"
        >{note.active ? `${note.interval}/${note.name}` : note.name}</text>
      </g>
    {/if}
  {/each}
</svg>

<style>
  svg {
    width: 100%;
    height: auto;
  }

  svg text {
    font-size: 1.2rem;
  }
</style>
