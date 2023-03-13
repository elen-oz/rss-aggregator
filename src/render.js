/* eslint-disable no-param-reassign */
export default (elements, i18nInstance) => (path, value) => {
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
