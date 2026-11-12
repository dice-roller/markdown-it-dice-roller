import { createApp } from 'vue';
import MarkdownIt from 'markdown-it';
import { DiceRoller } from '@dice-roller/vue';
import { Roll, Roller } from '../index.js';

const diceRollerTag = /<DiceRoller\b([^>]*)\/>/g;

export const createPlayground = ({
  markdownInput,
  generatedHtml,
  preview,
  errorMessage,
  diceRollerComponent = DiceRoller,
}) => {
  const markdown = new MarkdownIt({ html: true }).use(Roll).use(Roller);
  let mountedApps = [];
  let renderId = 0;

  const unmountRollers = () => {
    mountedApps.forEach((app) => app.unmount());
    mountedApps = [];
  };

  const showError = (error) => {
    errorMessage.textContent = error instanceof Error ? error.message : String(error);
    errorMessage.hidden = false;
  };

  const render = () => {
    errorMessage.textContent = '';
    errorMessage.hidden = true;

    let html;
    try {
      html = markdown.render(markdownInput.value);
    } catch (error) {
      showError(error);
      return;
    }

    unmountRollers();
    generatedHtml.textContent = html;

    const renderToken = renderId++;
    const notations = [];

    preview.innerHTML = html.replace(diceRollerTag, (_tag, attributes) => {
      const notation = attributes.match(/\bnotation="([^"]*)"/)?.[1] ?? '';
      const mountId = `markdown-it-dice-roller-${renderToken}-${notations.length}`;
      notations.push({ mountId, notation });
      return `<div data-md-dice-roller-mount="${mountId}"></div>`;
    });

    notations.forEach(({ mountId, notation }) => {
      const mountPoint = preview.querySelector(`[data-md-dice-roller-mount="${mountId}"]`);
      if (!mountPoint) {
        return;
      }

      const app = createApp(diceRollerComponent, { notation });
      app.config.errorHandler = showError;
      mountedApps.push(app);

      try {
        app.mount(mountPoint);
      } catch (error) {
        showError(error);
      }
    });

    return html;
  };

  const destroy = () => {
    unmountRollers();
    preview.replaceChildren();
  };

  return { render, destroy };
};
