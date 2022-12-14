'use strict';
import Notiflix from 'notiflix';
import { axiosGetImages } from './js/PixabayAPI2.js';
import { createImageMarkup } from './js/imageCard2.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// ========= REFS =========== //

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryList: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.btn-load-more'),
};
const messages = {
  info: "We're sorry, but you've reached the end of search results.",
  fail: 'Sorry, there are no images matching your search query. Please try again.',
  warn: 'Please enter your query string',
};

// ======== INITIAL HELPER VARIABLES ========= //
let page = 1;
let per_page = 40;
let maxPage = 1;
let query = null;

// =============== LISTENERS ================== //

refs.formEl.addEventListener('submit', handlerFormSearch);
refs.btnLoadMore.addEventListener('click', handlerBtnLoadMore);

// =============== HANDLERS ================== //

async function handlerBtnLoadMore() {
  page++;
  try {
    const { data } = await axiosGetImages(page, query, per_page);

    refs.galleryList.innerHTML += createImageMarkup(data.hits);
    lightbox.refresh();
    isLastPage(maxPage, page);
  } catch (err) {
    console.log(err);
  }
}

async function handlerFormSearch(e) {
  e.preventDefault();
  // reset a page number to 1 as default
  page = 1;

  // assignment to an helper query variable
  query = e.target.elements.searchQuery.value;

  // check for empty enter value
  if (!query) {
    Notiflix.Notify.warning(messages.warn);
    return;
  }

  try {
    const { data } = await axiosGetImages(page, query, per_page);
    console.log(data);
    maxPage = Math.ceil(data.totalHits / per_page);

    //     check for empty data
    if (!data.hits.length) {
      Notiflix.Notify.failure(messages.fail);
      return;
    }

    Notiflix.Notify.success(`Hooray! We found ${data.total} images.`);

    refs.galleryList.innerHTML = createImageMarkup(data.hits);
    lightbox.refresh();

    showBtn();
    isLastPage(maxPage, page);
  } catch (err) {
    Notiflix.Notify.failure(err.message);
  }
}

// =============== HELPERS ================== //
function isLastPage(maxPage, currentPage) {
  if (maxPage === currentPage) {
    hideBtnAndNotify();
  }
}

function hideBtnAndNotify() {
  Notiflix.Notify.info(messages.info);
  refs.btnLoadMore.style.display = 'none';
}

function showBtn() {
  refs.btnLoadMore.style.display = 'inline-block';
}

// init SimpleLightbox
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 300,
  animationSpeed: 150,
  fadeSpeed: 150,
});
