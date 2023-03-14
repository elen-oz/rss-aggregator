import i18next from 'i18next';
import { setLocale } from 'yup';
import view from './view.js';
import resources from './locales/index.js';
// import parseRSS from './parser.js';

const initialState = {
  form: {
    url: null,
    error: {},
  },
  urls: [],
};

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
    .then(() => view(i18nInstance, initialState));
};

console.log('init is working');
