import { useDiceRoller } from '@dice-roller/vue';

const FENCE = ':::';

const defaultOptions = {};

const roll = (notation, options) => {
  const {output, roll} = useDiceRoller({
    ...options,
    notation: () => notation.trim(),
  });

  roll();

  return `${output.value ?? ''}`;
};

const includePlugin = (md, options = {}) => {
  const rollOptions = { ...defaultOptions, ...options };

  const fenceRegex = new RegExp(`${FENCE}\\s*roll\\b((?:(?!${FENCE})[\\s\\S])*)${FENCE}(?![ \\t]*(?:roll|roller)\\b)`);

  const renderRoll = (notation) => {
    const output = notation ? roll(notation, rollOptions) : '';

    if (typeof rollOptions.renderRoll === 'function') {
      return rollOptions.renderRoll(output);
    }

    switch (rollOptions.as) {
      case 'blockquote':
      case 'block-quote':
      case '>':
        return `> ${output}`;
      case 'code':
      case '`':
        return `\`${output}\``;
      case 'codeblock':
      case 'code-block':
      case '```':
        return '```javascript\n' + output + '\n```';
      default:
        return `${output}`;
    }
  };

  const includeRoll = (state) => {
    let cap;
    while ((cap = fenceRegex.exec(state.src))) {
      const notation = (cap[1] || '').trim();

      state.src = state.src.slice(0, cap.index) +
        renderRoll(notation) +
        state.src.slice(cap.index + cap[0].length, state.src.length);
    }
  };

  md.core.ruler.before('normalize', 'roll', includeRoll);
};

export default includePlugin;
