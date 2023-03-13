/* eslint-disable import/no-extraneous-dependencies */
import i18next from 'i18next';
import { setLocale } from 'yup';
import view from './view.js';
import resources from './locales/index.js';

// const state = {
//   error: null,
// };

const elements = {
  rssForm: document.querySelector('.rss-form'),
  urlInput: document.getElementById('url-input'),
  feedback: document.querySelector('.feedback'),
};

// const feedList = [];

export default () => {
  const defaultLanguage = 'ru';

  setLocale({
    mixed: { default: 'errors.default', notOneOf: 'errors.exist' },
    string: { url: 'errors.url' },
  });

  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: true,
      resources,
    })
    .then(() => view(elements, i18nInstance));

  console.log('IT IS WORKING!');
};

console.log('init is working');
