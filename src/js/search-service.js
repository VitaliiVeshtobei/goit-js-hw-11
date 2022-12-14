import axios from 'axios';
export default class SearchService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async getApi() {
    const BASE_URL = 'https://pixabay.com/api/';
    const params = {
      key: '29558697-85a489dc53885da2ee650bf34',
      q: `${this.searchQuery}`,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: `${this.page}`,
      per_page: '40',
    };

    const resolve = await axios(BASE_URL, { params });
    this.page += 1;
    return resolve.data;
  }
  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
  get pageNumber() {
    return this.page;
  }
  set pageNumber(newPage) {
    this.page = newPage;
  }
}
