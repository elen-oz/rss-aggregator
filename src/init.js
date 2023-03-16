/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
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
  //   `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
  // )
  //   .then((response) => {
  //     console.log('----------', response.url);
  //     if (response.ok) return response.url;
  //     throw new Error('Network response was not ok.');
  //   });
};

const getId = () => _.uniqueId();

const getRSSContents = (url) => downloadRSS(url)
  .catch(() => Promise.reject(new Error('networkError')))
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

  console.log('-----------feed.link', feed.link);
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

  yup.setLocale({
    mixed: { default: 'default', notOneOf: 'exist' },
    string: { url: 'url' },
  });

  const validateURL = async (url, parsedLinks) => {
    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(parsedLinks);
    return schema.validate(url);
  };

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
      fullArticleButton: document.querySelector('full-article'),
    },
  };

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
    // readPostIds: [],
  };

  const i18nInstance = i18next.createInstance();

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
      const feedId = getId();
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.target.reset();
        // const data = new FormData(e.target);
        // const currentURL = data.get('url').trim();
        let currentURL = state.form.url;

        state.form.error = '';
        state.form.state = 'sending';
        const urlsList = state.feeds.map(({ link }) => link);
        validateURL(currentURL, urlsList)
          .then(() => getRSSContents(currentURL))
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
        const post = state.posts
          .find(({ id }) => e.target.dataset.id === id);
        console.log('++++++++++ post', post);
        const {
          title,
          description,
          link,
          id,
        } = post;
        state.readPostIds.add(id);
        // state.readPostIds.push(id);
        if (e.target.dataset.bsTarget !== '#modal') return;
        state.modal = { title, description, link };
      });
      updatePosts(feedId, state);
    });
};
