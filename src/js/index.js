import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import SearchService from './search-service';

const searchService = new SearchService();

const DEBOUNCE_DELAY = 300;

const refs = {
  searchForm: document.querySelector('.search-form'),
  input: document.querySelector('[name="searchQuery"]'),
  searchBtn: document.querySelector('.search'),
  loadMoreBtn: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};

refs.searchForm.addEventListener('submit', onSubmitForm);
refs.input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));
refs.loadMoreBtn.addEventListener('click', onLoadMore);
refs.searchBtn.disabled = true;

function onInput(evt) {
  console.log(evt.target.value);

  if (evt.target.value !== '') {
    return (refs.searchBtn.disabled = false);
  }
  // refs.searchBtn.disabled = false;
}

function onSubmitForm(evt) {
  evt.preventDefault();

  searchService.query = evt.currentTarget.elements.searchQuery.value;
  searchService.resetPage();
  searchService
    .getApi()
    .then(data => {
      if (data.length === 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      clearGallery();
      renderGallery(data);
    })
    .catch(error => {
      console.log(error);
    });
  evt.currentTarget.reset();
  refs.searchBtn.disabled = true;
}
function onLoadMore(evt) {
  searchService.getApi().then(data => {
    renderGallery(data);
  });
}

function renderGallery(photos) {
  const markupGallery = photos
    .map(photo => {
      return `<div class="photo-card">
  <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" width=320 height=220 />
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
  refs.gallery.insertAdjacentHTML('beforeend', markupGallery);
  // refs.gallery.innerHTML = markupGallery;
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}
