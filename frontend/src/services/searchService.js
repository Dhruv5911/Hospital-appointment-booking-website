import API_URLS from '../config/api.config';
import { API } from '../api';

const searchService = {
  // Main global search endpoint
  globalSearch: async (query, type = 'all') => {
    try {
      const qs = new URLSearchParams({ q: query, type }).toString();
      return await API.get(`${API_URLS.search.global}?${qs}`);
    } catch (e) {
      console.error("Search API Error:", e);
      return { results: [] };
    }
  }
};

export default searchService;
