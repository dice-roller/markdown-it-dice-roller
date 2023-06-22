import { DiceRoll } from '@dice-roller/rpg-dice-roller';

const FENCE = ':::';

const defaultOptions = {};

const roll = (notation) => new DiceRoll(notation.trim());

const includePlugin = (md, options = {}) => {
  options = { ...defaultOptions, ...options };

  const fenceRegex = new RegExp(`${FENCE}\\s*roll(\\s+.+(?!:::))?(\\s*${FENCE})`);

  const renderRoll = (notation) => {
    const output = notation ? roll(notation) : '';

    if (typeof options.renderRoll === 'function') {
      return options.renderRoll(output);
    }

    switch (options.as) {
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

