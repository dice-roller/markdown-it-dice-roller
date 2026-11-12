import MarkdownIt from 'markdown-it';
import { Roller } from '../index.js';

const createMarkdown = () => new MarkdownIt({ html: true }).use(Roller);

describe('Roller plugin', () => {
  test('is exported as a MarkdownIt plugin', () => {
    expect(typeof Roller).toBe('function');
  });

  test('renders an interactive roller with its notation', () => {
    expect(createMarkdown().render('::: roller 1d20 :::')).toContain('<DiceRoller notation="1d20" />');
  });

  test('trims notation and handles multiple roller fences', () => {
    const html = createMarkdown().render('::: roller  1d20  :::\n\n::: roller 2d6 :::');

    expect(html).toContain('<DiceRoller notation="1d20" />');
    expect(html).toContain('<DiceRoller notation="2d6" />');
  });

  test('renders empty notation safely', () => {
    expect(createMarkdown().render('::: roller :::')).toContain('<DiceRoller notation="" />');
  });

  test('leaves unclosed fences and surrounding Markdown intact', () => {
    const html = createMarkdown().render('Before\n\n::: roller 1d20\n\nAfter');

    expect(html).toContain('Before');
    expect(html).toContain('::: roller 1d20');
    expect(html).toContain('After');
  });
});
