import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import SearchService from './search-service';
import LoadMoreBtn from './load-more-btn';

const searchService = new SearchService();

const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

const DEBOUNCE_DELAY = 300;

const refs = {
  searchForm: document.querySelector('.search-form'),
  input: document.querySelector('[name="searchQuery"]'),
  searchBtn: document.querySelector('.search'),
  gallery: document.querySelector('.gallery'),
};

refs.searchForm.addEventListener('submit', onSubmitForm);
refs.input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);
refs.searchBtn.disabled = true;

function onInput(evt) {
  console.log(evt.target.value);

  if (evt.target.value !== '') {
    return (refs.searchBtn.disabled = false);
  }
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
      Notify.info(`Hooray! We found ${data.totalHits} images.`);
      renderGallery(data.hits);
      if (data.totalHits <= 40) return;
      loadMoreBtn.show();
      loadMoreBtn.enable();
    })
    .catch(error => {
      console.log(error);
    });
  evt.currentTarget.reset();
  refs.searchBtn.disabled = true;
}
function onLoadMore(evt) {
  loadMoreBtn.disable();
  searchService.getApi().then(data => {
    if (data.totalHits / searchService.pageNumber < 40) {
      renderGallery(data.hits);
      loadMoreBtn.hide();
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    renderGallery(data.hits);
    loadMoreBtn.enable();
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
