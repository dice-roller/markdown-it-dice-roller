/** @jest-environment jsdom */

import { defineComponent, h, nextTick, onMounted, onUnmounted } from 'vue';
import { createPlayground } from '../playground/preview.js';

globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;
globalThis.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

const createFixture = (diceRollerComponent) => {
  document.body.innerHTML = `
    <textarea id="markdown-input"></textarea>
    <pre><code id="generated-html"></code></pre>
    <div id="preview"></div>
    <p id="error-message" role="alert" hidden></p>
  `;

  return createPlayground({
    markdownInput: document.querySelector('#markdown-input'),
    generatedHtml: document.querySelector('#generated-html'),
    preview: document.querySelector('#preview'),
    errorMessage: document.querySelector('#error-message'),
    diceRollerComponent,
  });
};

describe('Markdown playground preview', () => {
  let playground;

  afterEach(() => {
    playground?.destroy();
    document.body.replaceChildren();
  });

  test('shows exact generated HTML and mounts rollers with their notation', () => {
    const mountedNotations = [];
    const TestRoller = defineComponent({
      props: ['notation'],
      setup(props) {
        onMounted(() => mountedNotations.push(props.notation));
        return () => h('button', { 'data-notation': props.notation }, `Roll ${props.notation}`);
      },
    });
    playground = createFixture(TestRoller);

    const markdownInput = document.querySelector('#markdown-input');
    const generatedHtml = document.querySelector('#generated-html');
    const preview = document.querySelector('#preview');
    markdownInput.value = '<strong>Raw HTML</strong>\n\n::: roller 1d20 :::\n\nAfter the roller.';

    const html = playground.render();

    expect(generatedHtml.textContent).toBe(html);
    expect(html).toContain('<strong>Raw HTML</strong>');
    expect(preview.querySelector('strong').textContent).toBe('Raw HTML');
    expect(preview.querySelector('button').getAttribute('data-notation')).toBe('1d20');
    expect(preview.textContent).toContain('After the roller.');
    expect(mountedNotations).toEqual(['1d20']);
  });

  test('unmounts previous rollers before mounting the next preview', () => {
    const mountedNotations = [];
    const unmountedNotations = [];
    const TestRoller = defineComponent({
      props: ['notation'],
      setup(props) {
        onMounted(() => mountedNotations.push(props.notation));
        onUnmounted(() => unmountedNotations.push(props.notation));
        return () => h('button', { 'data-notation': props.notation }, props.notation);
      },
    });
    playground = createFixture(TestRoller);

    const markdownInput = document.querySelector('#markdown-input');
    const preview = document.querySelector('#preview');
    markdownInput.value = '::: roller 1d20 :::';
    playground.render();
    markdownInput.value = '::: roller 2d6 :::';
    playground.render();

    expect(mountedNotations).toEqual(['1d20', '2d6']);
    expect(unmountedNotations).toEqual(['1d20']);
    expect(preview.querySelectorAll('button')).toHaveLength(1);
    expect(preview.querySelector('button').getAttribute('data-notation')).toBe('2d6');
  });

  test('handles unsuccessful static rolls without hanging', () => {
    playground = createFixture();
    const markdownInput = document.querySelector('#markdown-input');
    const generatedHtml = document.querySelector('#generated-html');
    const errorMessage = document.querySelector('#error-message');
    markdownInput.value = '::: roll invalid-notation :::';
    expect(() => playground.render()).not.toThrow();

    expect(generatedHtml.textContent).not.toContain('[object Object]');
    expect(markdownInput.value).toBe('::: roll invalid-notation :::');
    expect(errorMessage.hidden).toBe(true);
  });

  test('shows interactive roller validation and keeps editor content', async () => {
    playground = createFixture();
    const markdownInput = document.querySelector('#markdown-input');
    const preview = document.querySelector('#preview');
    markdownInput.value = '::: roller invalid-notation :::';
    playground.render();

    preview.querySelector('button').click();
    await nextTick();

    expect(markdownInput.value).toBe('::: roller invalid-notation :::');
    expect(preview.querySelector('[role="alert"]').textContent).toMatch(/invalid notation/i);
  });

  test('rolls a mounted interactive roller when its button is clicked', async () => {
    playground = createFixture();
    const markdownInput = document.querySelector('#markdown-input');
    const preview = document.querySelector('#preview');
    markdownInput.value = '::: roller 1d1 :::';
    playground.render();

    preview.querySelector('button').click();
    await nextTick();

    expect(preview.querySelector('output').textContent).toContain('1d1: [1] = 1');
  });

  test('shows Vue component errors in the playground error message', () => {
    const FailingRoller = defineComponent({
      setup() {
        throw new Error('Roller component failed');
      },
      render() {
        return h('div');
      },
    });
    playground = createFixture(FailingRoller);

    const markdownInput = document.querySelector('#markdown-input');
    const errorMessage = document.querySelector('#error-message');
    markdownInput.value = '::: roller 1d20 :::';
    playground.render();

    expect(markdownInput.value).toBe('::: roller 1d20 :::');
    expect(errorMessage.hidden).toBe(false);
    expect(errorMessage.textContent).toContain('Roller component failed');
  });
});
