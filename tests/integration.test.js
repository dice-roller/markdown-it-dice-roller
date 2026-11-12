import MarkdownIt from 'markdown-it';
import { Roll, Roller } from '../index.js';

const renderPlugins = (source) =>
  new MarkdownIt({ html: true }).use(Roll).use(Roller).render(source);

test('renders a deterministic real dice result as readable text', () => {
  const markdown = new MarkdownIt().use(Roll);

  expect(markdown.render('::: roll 1d1 :::')).toContain('1d1: [1] = 1');
});

test('processes repeated roll fences without changing surrounding Markdown', () => {
  const html = renderPlugins('Before\n\n::: roll 1d1 :::\n\nBetween\n\n::: roll 1d1 :::\n\nAfter');

  expect(html).toContain('Before');
  expect(html).toContain('Between');
  expect(html).toContain('After');
  expect(html.match(/1d1: \[1\] = 1/g)).toHaveLength(2);
});

test('processes adjacent mixed fences independently', () => {
  const html = renderPlugins('::: roll 1d1 :::\n\n::: roller 1d20 :::');

  expect(html).toContain('1d1: [1] = 1');
  expect(html).toContain('<DiceRoller notation="1d20" />');
  expect(html).not.toContain('[object Object]');
});

test('trims notation and renders multiple interactive rollers', () => {
  const html = renderPlugins('::: roller  1d20  :::\n\n::: roller 2d6 :::');

  expect(html).toContain('<DiceRoller notation="1d20" />');
  expect(html).toContain('<DiceRoller notation="2d6" />');
});

test('leaves unclosed roll fences alone and still processes a later roller', () => {
  const html = renderPlugins('::: roll 1d1\n\n::: roller 1d20 :::\n\nKeep this paragraph.');

  expect(html).toContain('::: roll 1d1');
  expect(html).toContain('<DiceRoller notation="1d20" />');
  expect(html).toContain('Keep this paragraph.');
});
