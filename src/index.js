import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';

const DEBOUNCE_DELAY = 300;
const BASE_URL = 'https://pixabay.com/api/';

const refs = {
  searchForm: document.querySelector('.search-form'),
  input: document.querySelector('[name="searchQuery"]'),
  searchBtn: document.querySelector('button'),
  gallery: document.querySelector('.gallery'),
};

refs.searchForm.addEventListener('submit', onSubmitForm);
refs.input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput(evt) {
  console.log(evt.target.value);
  evt.target.value;
}

function onSubmitForm(evt) {
  evt.preventDefault();

  getApi(evt.target[0].value)
    .then(resp => {
      renderGallery(resp.data.hits);
    })
    .catch(() =>
      Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      )
    );
}

function getApi(value) {
  const params = {
    key: '29558697-85a489dc53885da2ee650bf34',
    q: `${value}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
  };

  return axios(BASE_URL, { params });
}

function renderGallery(photos) {
  const markupGallery = photos
    .map(photo => {
      console.log(photo);
      return `<div class="photo-card">
  <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">${photo.likes}
      <b>Likes</b>
    </p>
    <p class="info-item">${photo.views}
      <b>Views</b>
    </p>
    <p class="info-item">${photo.comments}
      <b>Comments</b>
    </p>
    <p class="info-item">${photo.downloads}
      <b>Downloads</b>
    </p>
  </div>
</div>`;
    })
    .join('');

  refs.gallery.innerHTML = markupGallery;
}
