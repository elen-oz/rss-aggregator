/* eslint-disable no-return-assign */
import { string } from 'yup';
import onChange from 'on-change';
import view from './view.js';

export default (elements, i18nInstance) => {
  const watchedState = onChange(
    {
      form: {
        url: null,
        error: {},
      },
      urls: [],
    },
    view(elements, i18nInstance),
  );

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    watchedState.form.url = url;

    const schema = string().url().notOneOf(watchedState.urls);

    schema
      .validate(watchedState.form.url)
      .then(() => {
        watchedState.urls.push(watchedState.form.url);
        watchedState.form.url = null;
      })
      .catch((error) => (watchedState.form.error = error))
      .finally(() => elements.urlInput.focus());
  });
};
