/* eslint-disable import/no-extraneous-dependencies */
import 'bootstrap';
import * as yup from 'yup';
import i18n from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';

const schema = yup.string().trim().required().notOneOf();

const validate = (fields) => {
  return schema.validate(fields);
}; // dorabotat

const loadRss = (url, watchedState) => {};

const updateRss = (watchedState) => {};

export default async () => {
  const defaultLanguage = 'ru';
  // каждый запуск приложения создаёт свой собственный объект i18n и работает с ним,
  // не меняя глобальный объект.
  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const elements = {
    formEl: document.querySelector('form'),
    inputEl: document.querySelector('input[type=url]'),
    resetEl: document.querySelector('button'),
  };

  // MODEL
  const initialState = {
    formState: {
      state: 'filling',
      error: null,
    },
    // formLoadind: {
    //   state: 'initial',
    //   error: null,
    // },
    posts: [],
    feeds: [],
  };

  // VIEW
  const watchedState = watch(initialState, elements, i18nInstance);

  // CONTROLLER
  elements.formEl.addEventListener('submit', (e) => {
    // dopisat logiku
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    const existedUrls = [];
    validate(url, existedUrls);

    // menyaem sostoyanie
    // validirovat znachenie
  });

  elements.postsContainer.addEventListener('click', () => {
    // menyaem sostoyanie
    // click na knopku ili ssilku => menyaem sostoyanie
  });

  inputEl.focus();

  updateRss(watchedState);

  console.log('IT IS WORKING!');
};

// const posts = [{
//   id: 1,
//   feedId: 3,
// }];
// const feeds = [{
//   id: 3,
// }];
// => normalizovanie dannie= rasparsennie dannie is servera raskladivaem na posts i feeds
