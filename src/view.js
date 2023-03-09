/* eslint-disable import/no-extraneous-dependencies */
import onChange from 'on-change';

const render = (watchedState, elements, i18nInstance) => {
  const buildPosts = () => {
    elements.innerHTML = '';
    const buttons = state.companies.map();

    elements.append(...buttons);
  };

  const buildForm = () => i18nInstance.t('required'); // dorabotat

  // dodelat view sloy -- textContent
  switch (state.mode) {
    case 'posts': {
      const posts = buildPosts();
      element.append(posts);
      break;
    }
    case 'form': {
      const { form, input } = buildForm();
      element.append(form);
      input.select();
      break;
    }
    default:
      // https://ru.hexlet.io/blog/posts/sovershennyy-kod-defolty-v-svitchah
      throw new Error(`Unknown mode: ${state.mode}`);
  }

  const watchState = onChange(initialState, (path, value, previousValue) => {
    render(watchedState, elements, i18nInstance);
  });

  return watchState;
};

export default render;
