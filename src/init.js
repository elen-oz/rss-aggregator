/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { string, setLocale } from 'yup';
import resources from './locales/index.js';
import render from './view.js';
import parseRSS from './parser.js';

const downloadRSS = (url) => {
  const allOriginsLink = 'https://allorigins.hexlet.app/get';

  const workingUrl = new URL(allOriginsLink);

  workingUrl.searchParams.set('disableCache', 'true');
  workingUrl.searchParams.set('url', url);

  return axios.get(workingUrl);

  // fetch(
  //   `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
  //     'https://wikipedia.org',
  //   )}`,
  // )
  //   .then((response) => {
  //     console.log('----------', response.url);
  //     if (response.ok) return response.url;
  //     throw new Error('Network response was not ok.');
  //   });
};

const getRSSContents = (url) => downloadRSS(url)
  .catch(() => Promise.reject(new Error('networkError')))
  .then((response) => {
    const responseData = response.data.contents;
    return Promise.resolve(responseData);
  });

const buildPosts = (feedId, items, state) => {
  const posts = items.map((item) => ({
    feedId,
    id: `feed-${Date.now()}`,
    ...item,
  }));
  state.posts = posts.concat(state.posts);
};

const updatePosts = (feedId, state, timeout = 5000) => {
  const feed = state.feeds.find(({ id }) => feedId === id);

  const cb = () => getRSSContents(feed.link)
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
  const defaultLanguage = 'ru';

  setLocale({
    mixed: { default: 'default', notOneOf: 'exist' },
    string: { url: 'url' },
  });

  const i18nInstance = i18next.createInstance();

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    // example: document.querySelector('.text-muted'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const initialState = {
    form: {
      state: 'filling',
      url: '',
      error: '',
    },
    feeds: [],
    posts: [],
  };

  const state = onChange(
    initialState,
    render(elements, initialState, i18nInstance),
  );

  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: true,
      resources,
    })
    .then(() => {
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        state.form.error = '';
        const urlsList = state.feeds.map(({ link }) => link);
        const schema = string().url().notOneOf(urlsList);

        schema
          .validate(state.form.url)
          .then(() => {
            state.form.state = 'sending';

            return getRSSContents(state.form.url);
          })
          .then(parseRSS)
          .then((parsedRSS) => {
            const feedId = `feed-${Date.now()}`;

            const feed = {
              id: feedId,
              title: parsedRSS.title,
              description: parsedRSS.description,
              link: state.form.url,
            };

            state.feeds.push(feed);
            buildPosts(feedId, parsedRSS.items, state);
            updatePosts(feedId, state);

            state.form.url = '';
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
        state.form.url = e.target.value.trim();
      });
    });
};
