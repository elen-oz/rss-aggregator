import onChange from 'on-change';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import resources from './locales/index.js';
import render from './view.js';
import parseRSS from './parser.js';

const getId = () => uniqueId();

const proxifyAndRequest = (url) => {
  const proxifyUrl = new URL('https://allorigins.hexlet.app/get');
  proxifyUrl.searchParams.set('disableCache', 'true');
  proxifyUrl.searchParams.set('url', url);
  return axios.get(proxifyUrl.toString());
};

const validateURL = (url, parsedLinks) => {
  const schema = yup.string().required().url().notOneOf(parsedLinks);
  return schema.validate(url);
};

const getRSSContent = (url) => proxifyAndRequest(url).then((response) => {
  const responseData = response.data.contents;
  return responseData;
});

const buildPosts = (feedId, items, state) => {
  const posts = items.map((item) => ({
    feedId,
    id: getId(),
    ...item,
  }));
  state.posts = posts.concat(state.posts);
};

const updatePosts = (state, timeout = 5000) => {
  const promises = state.feeds.map((feed) => getRSSContent(feed.link)
    .then(parseRSS)
    .then((response) => {
      const feedId = feed.id;
      const postsUrls = state.posts
        .filter((post) => feedId === post.feedId)
        .map(({ link }) => link);
      const newItems = response.items.filter(
        ({ link }) => !postsUrls.includes(link),
      );

      if (newItems.length > 0) {
        buildPosts(feedId, newItems, state);
      }
    }));

  Promise.all(promises).finally(() => {
    setTimeout(() => updatePosts(state, timeout), timeout);
  });
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: true,
      resources,
    })
    .then(() => {
      const initialState = {
        loadingProcess: 'done',
        error: '',
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
          required: 'isEmpty',
          notOneOf: 'exist',
          default: 'default',
        },
        string: { url: 'invalidUrl' },
      });

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

      const state = onChange(
        initialState,
        render(elements, initialState, i18nInstance),
      );

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const currentURL = formData.get('url');

        state.loadingProcess = 'loading';
        const urlsList = state.feeds.map(({ link }) => link);
        validateURL(currentURL, urlsList)
          .then(() => getRSSContent(currentURL))
          .then(parseRSS)
          .then((response) => {
            const feedId = getId();
            const feed = {
              id: feedId,
              title: response.title,
              description: response.description,
              link: currentURL,
            };

            state.feeds.push(feed);
            buildPosts(feedId, response.items, state);
          })
          .catch((error) => {
            const message = error.isParsingError ? 'parsingError' : '';
            state.error = message;
          })
          .finally(() => {
            state.loadingProcess = 'done';
            e.target.reset();
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const postId = e.target.dataset.id;
        state.readPostIds.add(postId);
        if (e.target.dataset.bsTarget !== '#modal') return;
        state.modal = { id: postId };
      });

      updatePosts(state);
    });
};
