import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import SearchService from './search-service';
import LoadMoreBtn from './load-more-btn';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

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

  if (evt.target.value.trim() !== '') {
    return (refs.searchBtn.disabled = false);
  }
  refs.searchBtn.disabled = true;
}

async function onSubmitForm(evt) {
  evt.preventDefault();
  searchService.query = evt.currentTarget.elements.searchQuery.value;
  searchService.resetPage();
  // if (searchService.query.trim() === '') {
  //   refs.searchBtn.disabled = true;
  //   return;
  // }

  try {
    const data = await searchService.getApi();
    if (data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      clearGallery();
      loadMoreBtn.hide();
      evt.target.reset();
      refs.searchBtn.disabled = true;
      return;
    }
    clearGallery();
    Notify.info(`Hooray! We found ${data.totalHits} images.`);
    renderGallery(data.hits);

    if (data.totalHits <= 40) return;
    loadMoreBtn.show();
    loadMoreBtn.enable();
  } catch (error) {
    console.log(error);
  }
  evt.target.reset();
  refs.searchBtn.disabled = true;
}

async function onLoadMore(evt) {
  loadMoreBtn.disable();

  try {
    const data = await searchService.getApi();

    if (data.totalHits / searchService.pageNumber < 40) {
      renderGallery(data.hits);
      loadMoreBtn.hide();
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
    renderGallery(data.hits);
    slowScroll();
    loadMoreBtn.enable();
  } catch (error) {
    console.log(error.message);
  }
}

function renderGallery(photos) {
  const markupGallery = photos
    .map(photo => {
      return `<div class="photo-card">
      <a href="${photo.largeImageURL}"><img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${photo.likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${photo.views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${photo.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${photo.downloads}
    </p>
  </div>
</div>`;
    })
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markupGallery);
  let gallery = new SimpleLightbox('.gallery a');
  gallery.refresh();
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function slowScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
