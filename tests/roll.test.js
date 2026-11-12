import { jest } from '@jest/globals';
import MarkdownIt from 'markdown-it';

const mockRoll = jest.fn();
const mockUseDiceRoller = jest.fn();

jest.unstable_mockModule('@dice-roller/vue', () => ({
  useDiceRoller: mockUseDiceRoller,
}));

const { Roll, Roller } = await import('../index.js');

const formattedResult = '1d6: [4] = 4';

const render = (options = {}, markdown = '::: roll 1d6 :::') =>
  new MarkdownIt().use(Roll, options).render(markdown);

describe('Roll plugin', () => {
  beforeEach(() => {
    mockRoll.mockClear();
    mockUseDiceRoller.mockReset();
    mockUseDiceRoller.mockReturnValue({
      output: { value: { output: formattedResult } },
      roll: mockRoll,
    });
  });

  test('is exported alongside Roller', () => {
    expect(Roll).toEqual(expect.any(Function));
    expect(Roller).toEqual(expect.any(Function));
  });

  test.each([
    ['default', {}, `<p>${formattedResult}</p>\n`],
    ['blockquote', { as: 'blockquote' }, `<blockquote>\n<p>${formattedResult}</p>\n</blockquote>\n`],
    ['block-quote alias', { as: 'block-quote' }, `<blockquote>\n<p>${formattedResult}</p>\n</blockquote>\n`],
    ['blockquote symbol alias', { as: '>' }, `<blockquote>\n<p>${formattedResult}</p>\n</blockquote>\n`],
    ['code', { as: 'code' }, `<p><code>${formattedResult}</code></p>\n`],
    ['code symbol alias', { as: '`' }, `<p><code>${formattedResult}</code></p>\n`],
    ['codeblock', { as: 'codeblock' }, `<pre><code class="language-javascript">${formattedResult}\n</code></pre>\n`],
    ['code-block alias', { as: 'code-block' }, `<pre><code class="language-javascript">${formattedResult}\n</code></pre>\n`],
    ['codeblock symbol alias', { as: '```' }, `<pre><code class="language-javascript">${formattedResult}\n</code></pre>\n`],
  ])('renders the formatted result as %s', (_name, options, expected) => {
    expect(render(options)).toBe(expected);
    expect(mockRoll).toHaveBeenCalledTimes(1);
  });

  test('passes trimmed notation to the dice composable', () => {
    render({}, '::: roll   1d6   :::');

    const [{ notation }] = mockUseDiceRoller.mock.calls[0];
    expect(notation()).toBe('1d6');
  });

  test('passes the formatted result to renderRoll', () => {
    const renderRoll = jest.fn((result) => `[rolled: ${result}]`);

    expect(render({ renderRoll })).toContain(`[rolled: ${formattedResult}]`);
    expect(renderRoll).toHaveBeenCalledWith(formattedResult);
  });

  test('handles an empty notation without rolling', () => {
    const renderRoll = jest.fn((result) => `empty:${result}`);

    expect(render({ renderRoll }, '::: roll :::')).toContain('empty:');
    expect(renderRoll).toHaveBeenCalledWith('');
    expect(mockUseDiceRoller).not.toHaveBeenCalled();
  });
});
