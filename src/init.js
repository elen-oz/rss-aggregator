/* eslint-disable import/no-extraneous-dependencies */
import 'bootstrap';
import * as yup from 'yup';
import view from './view.js';

const state = {
  error: null,
};

const elements = {
  rssForm: document.querySelector('.rss-form'),
  urlInput: document.getElementById('url-input'),
  feedback: document.querySelector('.feedback'),
};

const feedList = [];

export default async (url) => {
  const schema = yup.object().shape({
    url: yup.string().url().required(),
  });

  schema
    .validate({ url })
    .then(() => {
      if (feedList.includes(url)) {
        state.error = 'Данный адрес уже в списке';
      } else {
        feedList.push(url);
        state.urlInput.value = '';
        state.urlInput.focus();
      }
    })
    .catch((err) => {
      state.error = err.message;
    });

  console.log('IT IS WORKING!');
};

console.log('init is working');
view(state, elements);
// export default addFeed;
