/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import { string } from 'yup';
import onChange from 'on-change';

const render = (elements, i18nInstance) => (path, value) => {
  elements.urlInput.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-success', 'text-danger');
  elements.feedback.textContent = '';

  switch (path) {
    case 'urls':
      elements.urlInput.classList.remove('is-invalid');

      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18nInstance.t('success');
      break;

    case 'form.url':
      elements.urlInput.value = value;
      break;

    case 'form.error':
      elements.urlInput.classList.add('is-invalid');

      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18nInstance.t(value.message);
      break;

    default:
      break;
  }
};

export default (elements, i18nInstance) => {
  const watchedState = onChange(
    {
      form: {
        url: null,
        error: {},
      },
      urls: [],
    },
    render(elements, i18nInstance),
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
      .catch((error) => watchedState.form.error = error)
      .finally(() => elements.urlInput.focus());
  });
};
