import * as Types from '../../constants/ActionType';
import callApi from '../../utils/apiCaller';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { actShowLoading, actHiddenLoading } from './loading'

export const actFetchHomepagesRequest = (token, offset) => {
  const newOffset = offset === null || offset === undefined ? 0 : offset;
  const limit = 10;
  return dispatch => {
    dispatch(actShowLoading());
    return new Promise((resolve, reject) => {
      callApi(`categories?limit=${limit}&page=${newOffset}&sortBy=-createdAt`, 'GET', null, token)
        .then(res => {
          if (res && res.status === 200) {
            dispatch(actFetchHomepages(res.data.results));
            resolve(res.data);
            setTimeout(function(){ dispatch(actHiddenLoading()) }, 200);
          }
        })
        .catch(err => {
          console.log(err);
          reject(err);
          setTimeout(function(){ dispatch(actHiddenLoading()) }, 200);
        });
    });
  };
};

export const actFetchHomepages = (homepages) => {
  return {
    type: Types.FETCH_HOMEPAGES,
    homepages
  }
}

export const actFindHomepagesRequest = (token, searchText) => {
  return dispatch => {
  dispatch(actShowLoading());
  return new Promise((resolve, reject) => {
    if (searchText !== undefined && searchText !== null && searchText !== '') {
      callApi(`categories/search-product?search=${searchText}`, 'GET', null, token)
      .then(res => {
        if (res && res.status === 200) {
          dispatch(actFindHomepages(res.data.results));
          resolve(res.data);
          setTimeout(function(){ dispatch(actHiddenLoading()) }, 200);
        }
      })
      .catch(err => {
        console.log(err);
        reject(err);
        setTimeout(function(){ dispatch(actHiddenLoading()) }, 200);
      });
    } else {
      callApi('categories', 'GET', null, token)
      .then(res => {
        if (res && res.status === 200) {
          dispatch(actFindHomepages(res.data.results));
          resolve(res.data);
          setTimeout(function(){ dispatch(actHiddenLoading()) }, 200);
        }
      })
      .catch(err => {
        console.log(err);
        reject(err);
        setTimeout(function(){ dispatch(actHiddenLoading()) }, 200);
      });
    }
  });
}
}

export const actFindHomepages = (homepages) => {
  return {
    type: Types.FIND_HOMEPAGES,
    homepages
  }
}

export const actDeleteHomepageRequest = (id, token) => {
  return async dispatch => {
    await callApi(`categories/${id}`, 'DELETE', null, token);
    dispatch(actDeleteHomepage(id));
  }
}

export const actDeleteHomepage = (id) => {
  return {
    type: Types.REMOVE_HOMEPAGE,
    id
  }
}

export const actAddHomepageRequest = (token, data) => {
  return async dispatch => {
    const res = await callApi('categories', 'POST', data, token);
    if (res && res.status === 200) {
      toast.success('Add new Homepage is success')
      dispatch(actAddHomepage(res.data));
    }
  }
}

export const actAddHomepage = (data) => {
  return {
    type: Types.ADD_HOMEPAGE,
    data
  }
}

export const actGetHomepageRequest = (token, id) => {
  return async dispatch => {
    await callApi(`categories/${id}`, 'GET', null, token);
  };
}

export const actEditHomepageRequest = (token, id, data) => {
  return async dispatch => {
    const res = await callApi(`categories/${id}`, 'PUT', data, token);
    if (res && res.status === 200) {
      toast.success('Edit Homepage is success')
      dispatch(actEditHomepage(res.data));
    }
  }
}

export const actEditHomepage = (data) => {
  return {
    type: Types.EDIT_HOMEPAGE,
    data
  }
}
