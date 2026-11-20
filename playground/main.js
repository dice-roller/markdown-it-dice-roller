import { createPlayground } from './preview.js';

const playground = createPlayground({
  markdownInput: document.querySelector('#markdown-input'),
  dataInput: document.querySelector('#data-input'),
  generatedHtml: document.querySelector('#generated-html'),
  preview: document.querySelector('#preview'),
  errorMessage: document.querySelector('#error-message'),
});

document.querySelector('#render-button').addEventListener('click', playground.render);
playground.render();
