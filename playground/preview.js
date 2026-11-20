import { createApp } from 'vue';
import MarkdownIt from 'markdown-it';
import { DiceRoller } from '@dice-roller/vue';
import { Roll, Roller } from '../index.js';

const diceRollerTag = /<DiceRoller\b[^>]*\/>/g;

export const createPlayground = ({
  markdownInput,
  dataInput,
  generatedHtml,
  preview,
  errorMessage,
  diceRollerComponent = DiceRoller,
}) => {
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
    let previewHtml;
    const renderToken = renderId++;
    const rollers = [];
    try {
      const input = dataInput.value.trim();
      const data = input ? JSON.parse(input) : undefined;
      const markdown = new MarkdownIt({ html: true }).use(Roll).use(Roller, { data });
      html = markdown.render(markdownInput.value);

      const template = document.createElement('template');
      previewHtml = html.replace(diceRollerTag, (tag) => {
        template.innerHTML = tag;
        const component = template.content.firstElementChild;
        const notation = component.getAttribute('notation') ?? '';
        const dataAttribute = component.getAttribute(':data');
        const mountId = `markdown-it-dice-roller-${renderToken}-${rollers.length}`;
        rollers.push({
          mountId,
          notation,
          data: dataAttribute === null ? undefined : JSON.parse(dataAttribute),
        });
        return `<div data-md-dice-roller-mount="${mountId}"></div>`;
      });
    } catch (error) {
      showError(error);
      return;
    }

    unmountRollers();
    generatedHtml.textContent = html;
    preview.innerHTML = previewHtml;

    rollers.forEach(({ mountId, notation, data }) => {
      const mountPoint = preview.querySelector(`[data-md-dice-roller-mount="${mountId}"]`);
      if (!mountPoint) {
        return;
      }

      const app = createApp(diceRollerComponent, {
        notation,
        data,
      });
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
