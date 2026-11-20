const FENCE = ':::';

const defaultOptions = {};

const includePlugin = (md, options = {}) => {
  const rollOptions = { ...defaultOptions, ...options };
  const { data } = rollOptions;
  const dataAttribute = data === undefined
    ? ''
    : ` :data="${md.utils.escapeHtml(JSON.stringify(data))}"`;

  const fenceRegex = new RegExp(`${FENCE}\\s*roller\\b((?:(?!${FENCE})[\\s\\S])*)${FENCE}(?![ \\t]*(?:roll|roller)\\b)`, 'g');

  const includeRoller = (state) => {
    state.src = state.src.replace(fenceRegex, (_fence, notation) => {
      const escapedNotation = md.utils.escapeHtml(notation.trim());
      return `\n<DiceRoller notation="${escapedNotation}"${dataAttribute} />\n`;
    });
  };

  md.core.ruler.before('normalize', 'roller', includeRoller);
};

export default includePlugin;
