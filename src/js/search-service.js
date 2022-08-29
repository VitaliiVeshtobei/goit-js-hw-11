import axios from 'axios';
export default class SearchService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  getApi() {
    console.log(this);
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

    return axios(BASE_URL, { params }).then(resolve => {
      this.page += 1;
      return resolve.data.hits;
    });
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
}
