// React
import { useEffect, useRef, useReducer } from 'react';

/**
 * Pretty print of JSON
 * @param {object} res 
 * @returns 
 */
export const fortmatResponse = (response) => {
  return JSON.stringify(response, null, 2);
}

// Wordpress rest API Urls
const domain = 'https://gregorythomason.com/wp-json';
export const WpRestUrl = `${domain}/wp/v2`;
export const WpAcfOptionsUrl = `${domain}/acf/v3/options/options`;

/**
 * Reusable hook to fetch all data from URL
 * @param {string} urls URLs to fetch from. 
 * @returns 
 */
export const useFetch = (stateKey, url) => {
  const cache = useRef({});
  const initialState = {
    [`status${stateKey}`]: 'idle',
    [`error${stateKey}`]: null,
    [`data${stateKey}`]: [],
  };

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'FETCHING':
        return { ...initialState, [`status${stateKey}`]: 'fetching' };
      case 'FETCHED':
        return { ...initialState, [`status${stateKey}`]: 'fetched', [`data${stateKey}`]: action.payload };
      case 'FETCH_ERROR':
        return { ...initialState, [`status${stateKey}`]: 'error', [`error${stateKey}`]: action.payload };
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    let cancelRequest = false;
    if (!url || !url.trim()) return;

    const fetchData = async () => {
      dispatch({ type: 'FETCHING' });
      if (cache.current[url]) {
        const data = cache.current[url];
        dispatch({ type: 'FETCHED', payload: data });
      } else {
        try {
          const response = await fetch(url);
          const data = await response.json();
          let urlDataObj = [];

          // Return data with a nice name based on REST API url response.
          const urlPathName = new URL(url).pathname.split('/');
          urlDataObj[urlPathName[urlPathName.length - 1]] = data;

          cache.current[url] = data;
          if (cancelRequest) return;
          dispatch({ type: 'FETCHED', payload: urlDataObj });
        } catch (error) {
          if (cancelRequest) return;
          dispatch({ type: 'FETCH_ERROR', payload: error.message });
        }
      }
    };

    fetchData();

    return function cleanup() {
      cancelRequest = true;
    };
  }, [url]);

  return state;
}

/**
 * Reduces any named sub-objects in the data array to normalize response 
 * @param {object} data Object data to filter
 * @returns {object}
 */
export const cleanFetchData = (data) => {
  data.forEach((item, index) => {
    if (!Array.isArray(item)) {
      data[index] = Object.values(item);
    }
  })
  return [].concat.apply([], data);
}