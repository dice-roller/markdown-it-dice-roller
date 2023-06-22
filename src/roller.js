const FENCE = ':::';

const defaultOptions = {};

const includePlugin = (md, options = {}) => {
  options = { ...defaultOptions, ...options };

  const fenceRegex = new RegExp(`${FENCE}\\s*roller(\\s+.*?(?!:::))?(\\s*${FENCE})`);

  const includeRoller = (state) => {
    let cap;
    while ((cap = fenceRegex.exec(state.src))) {
      const [, notation] = cap;

      state.src = `${state.src.slice(0, cap.index)}
<DiceRoller notation="${notation.trim()}" />
${state.src.slice(cap.index + cap[0].length, state.src.length)}`;
    }
  };

  md.core.ruler.before('normalize', 'roller', includeRoller);
};

export default includePlugin;

