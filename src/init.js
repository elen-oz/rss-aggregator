/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import resources from './locales/index.js';
import render from './view.js';
import parseRSS from './parser.js';

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#url-input'),
  feedback: document.querySelector('.feedback'),
  submit: document.querySelector('button[type="submit"]'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
  modal: {
    title: document.querySelector('.modal-title'),
    body: document.querySelector('.modal-body'),
    fullArticleButton: document.querySelector('.full-article'),
  },
};

const getId = () => uniqueId();

const initialState = {
  form: {
    state: 'filling',
    url: '',
    error: '',
  },
  modal: {
    title: '',
    description: '',
    link: '',
  },
  feeds: [],
  posts: [],
  readPostIds: new Set(),
};

yup.setLocale({
  mixed: {
    required: 'empty',
    notOneOf: 'exist',
    default: 'default',
  },
  string: { url: 'url' },
});

const getallOriginsUrl = (url) => {
  const allOriginsUrl = new URL('https://allorigins.hexlet.app/get');
  allOriginsUrl.searchParams.set('disableCache', 'true');
  allOriginsUrl.searchParams.set('url', url);

  return axios.get(allOriginsUrl);
};

const validateURL = async (url, parsedLinks) => {
  const schema = yup.string().required().url().notOneOf(parsedLinks);
  return schema.validate(url);
};

const getRSSContent = (url) => getallOriginsUrl(url).catch(() => Promise.reject(new Error('networkError')))
  .then((response) => {
    const responseData = response.data.contents;
    return Promise.resolve(responseData);
  });

const buildPosts = (feedId, items, state) => {
  const posts = items.map((item) => ({
    feedId,
    id: getId(),
    ...item,
  }));
  state.posts = posts.concat(state.posts);
};

const updatePosts = (feedId, state, timeout = 5000) => {
  const feed = state.feeds.find(({ id }) => feedId === id);

  const cb = () => getRSSContent(feed.link)
    .then(parseRSS)
    .then((parsedRSS) => {
      const postsUrls = state.posts
        .filter((post) => feedId === post.feedId)
        .map(({ link }) => link);
      const newItems = parsedRSS.items.filter(
        ({ link }) => !postsUrls.includes(link),
      );

      if (newItems.length > 0) {
        buildPosts(feedId, newItems, state);
      }
    })
    .finally(() => {
      setTimeout(cb, timeout);
    });

  setTimeout(cb, timeout);
};

export default () => {
  const i18nInstance = i18next.createInstance();

  const state = onChange(
    initialState,
    render(elements, initialState, i18nInstance),
  );

  i18nInstance
    .init({
      lng: 'ru',
      debug: true,
      resources,
    })
    .then(() => {
      const feedId = getId();
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.target.reset();
        let currentURL = state.form.url;

        state.form.error = '';
        state.form.state = 'sending';
        const urlsList = state.feeds.map(({ link }) => link);
        validateURL(currentURL, urlsList)
          .then(() => getRSSContent(currentURL))
          .then(parseRSS)
          .then((parsedRSS) => {
            const feed = {
              id: feedId,
              title: parsedRSS.title,
              description: parsedRSS.description,
              link: currentURL,
            };

            state.feeds.push(feed);
            buildPosts(feedId, parsedRSS.items, state);
            updatePosts(feedId, state);

            currentURL = '';
          })
          .catch((error) => {
            const message = error.message ?? 'default';
            state.form.error = message;
          })
          .finally(() => {
            state.form.state = 'filling';
          });
      });

      elements.input.addEventListener('change', (e) => {
        e.preventDefault();
        state.form.url = e.target.value.trim();
      });

      elements.posts.addEventListener('click', (e) => {
        const post = state.posts.find(({ id }) => e.target.dataset.id === id);
        const {
          title, description, link, id,
        } = post;
        state.readPostIds.add(id);
        // state.readPostIds.push(id);
        if (e.target.dataset.bsTarget !== '#modal') return;
        state.modal = { title, description, link };
      });
      updatePosts(feedId, state);
    });
};
