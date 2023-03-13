/* eslint-disable import/no-extraneous-dependencies */
import onChange from 'on-change';

export default (state, elements) => {
  const watchedState = onChange(state, (path) => {
    if (path === 'error') {
      elements.feedback.classList.add('error');
    } else {
      elements.feedback.classList.remove('error');
    }
    elements.feedback.textContent = state.error;
    if (state.error) {
      elements.urlInput.classList.add('invalid');
    } else {
      elements.urlInput.classList.remove('invalid');
    }
  });

  elements.rssForm.addEventListener('submit', (e) => {
    console.log('e', e);
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('formData ', formData);
    const url = formData.get('url');
    watchedState.urlInput = elements.urlInput;
    console.log('watchedState.urlInput ', watchedState.urlInput);
    watchedState.feedback = elements.feedback;
    console.log('watchedState.feedback', watchedState.feedback);
    watchedState.error = null;
    watchedState.addFeed(url);
    console.log('url ', url);
  });

  console.log('view is working');
};
