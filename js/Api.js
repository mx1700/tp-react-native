/**
 * @providesModule Api
 */

import TokenManager from './TokenManager'

export async function getTodayDiaries(page = 1, page_size = 20) {
  return call('GET', '/diaries/today?page=' + page + '&page_size=' + page_size)
  .then((json) => {
    json.page = Number(json.page)
    json.page_size = Number(json.page_size)
    return json;
  });
}

export async function login(username, password) {
  const token = TokenManager.generateToken(username, password);
  await TokenManager.setToken(token);
  try {
    const user_info = await getSelfInfo();
    await TokenManager.setUser(user_info);
    return user_info;
  } catch(err) {
    //TODO:判断状态码，401是登陆失败，其他错误继续抛出
    await TokenManager.setToken('');
    return false;
  }
}

export async function logout() {
  TokenManager.setToken('');
  TokenManager.setUser(false);
}

export async function getSelfInfoByStore() {
  let user = await TokenManager.getUser();
  // if (!user) {
  //   user = await getSelfInfo();
  //   if (user) {
  //     TokenManager.setUser(user);
  //   }
  // }

  return user;
}

export async function updateUserInfoStore(newInfo) {
  await TokenManager.setUser(newInfo);
}

export async function getSelfInfo() {
  return call('GET', '/users/my')
}

export async function getUserInfo(id) {
  return call('GET', '/users/' + id)
}

export async function updateUserIcon(photoUri) {
  return upload('POST', '/users/icon', {
    icon: {uri: photoUri, name: 'image.jpg', type: 'image/jpg'}
  });
  //TODO:更新本地缓存
}

export async function updateUserInfo(name, intro) {
  return call('PUT', '/users', {
    name: name,
    intro: intro,
  });
  //TODO:更新本地缓存
}

export async function getSelfNotebooks() {
  return call('GET', '/notebooks/my')
}

export async function getUserNotebooks(id) {
  return call('GET', '/users/' + id + '/notebooks')
}

export async function getNotebook(id) {
  return call('POST', '/notebooks/' + id)
}

export async function createNotebook(subject, description, expired, privacy) {
  return call('POST', '/notebooks', {
    subject: subject,
    description: description,
    expired: expired,
    privacy: privacy,
  })
}

export async function updateNotebook(id, subject, description, privacy) {
  return call('PUT', '/notebooks/' + id, {
    subject: subject,
    description: description,
    privacy: privacy,
  })
}

export async function updateNotebookCover(bookId, photoUri) {
  return upload('POST', `/notebooks/${bookId}/cover`, {
    cover: {uri: photoUri, name: 'image.jpg', type: 'image/jpg'},
  })
}

export async function deleteNotebook(id) {
  return call('DELETE', '/notebooks/' + id)
}

export async function addDiary(bookId, content, photoUri = null) {
  if (photoUri == null) {
    return call('POST', '/notebooks/' + bookId + '/diaries', {
      content: content,
    })
  } else {
    return upload('POST', '/notebooks/' + bookId + '/diaries', {
      content: content,
      photo: {uri: photoUri, name: 'image.jpg', type: 'image/jpg'},
    })
  }

}

export async function getFollowDiaries(page, page_size) {
  return call('GET', '/diaries/follow?page=' + page + '&page_size=' + page_size)
    .then((json) => {
      json.page = Number(json.page)
      json.page_size = Number(json.page_size)
      return json;
    });
}

export async function getDiary(id) {
  return call('GET', '/diaries/' + id)
}

export async function deleteDiary(id) {
  return call('DELETE', '/diaries/' + id)
}

export async function updateDiary(id, bookId, content) {
  return call('PUT', '/diaries/' + id, {
    content: content,
    notebook_id: bookId,
  })
}

export async function getUserTodayDiaries(id) {
  return call('GET', '/users/' + id + '/diaries/')
}

export async function getNotebookTodayDiaries(id, page, page_size) {
  return call('GET', '/notebooks/' + id + '/diaries?page=' + page + '&page_size=' + page_size)
      .then((json) => {
        json.page = Number(json.page)
        json.page_size = Number(json.page_size)
        return json;
      });
}

export async function getNotebookDiaries(id, year, month, day) {
  return call('GET', '/notebooks/' + id + '/diaries/' + year + '/' + month + '/' + day)
}

export async function addComment(diaryId, content, recipient_id) {
  return call('POST', '/diaries/' + diaryId + '/comments', {
    content: content,
    recipient_id: recipient_id,
  })
}

export async function deleteComment(id) {
  return call('DELETE', '/comments/' + id)
}

export async function getDiaryComments(diaryId) {
  return call('GET', '/diaries/' + diaryId + '/comments')
}

export async function getRelation(user_id) {
  return call('GET', '/relation/' + user_id);
}

export async function addFollow(user_id) {
  return call('POST', '/relation/' + user_id);
}

export async function deleteFollow(user_id) {
  return call('DELETE', '/relation/' + user_id);
}

export async function getMessages(last_id = 0) {
  return call('GET', '/tip')
}

export async function deleteMessage(ids) {
  return call('POST', '/tip/read/' + ids.join(','))
}

export async function getLoginPassword() {
  return TokenManager.getLoginPassword()
}

export async function setLoginPassword(password) {
  return TokenManager.setLoginPassword(password);
}

//==========================================================================

var baseUrl = 'https://open.timepill.net/api';
async function call(method, api, body) {
  console.log('request:', baseUrl + api)
  var token = await TokenManager.getToken();
  // if (body) {
  //   let formData = new FormData();
  //   for (key of Object.keys(body)) {
  //
  //   }
  // }
  return timeout(fetch(baseUrl + api, {
    method: method,
    headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(checkStatus)
  .then(parseJSON),
      10000);
}

async function upload(method, api, body) {
  console.log('request upload:', baseUrl + api)
  var token = await TokenManager.getToken();
  let formData = new FormData();
  for(let prop of Object.keys(body)) {
    formData.append(prop, body[prop]);
  }
  console.log(formData);
  return timeout(fetch(baseUrl + api, {
    method: method,
    headers: {
      'Authorization': token,
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
    },
    body: formData
  })
      .then(checkStatus)
      .then(parseJSON),
      30000)
}


async function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    console.log('http error: ' + response.status + ' ' + response.body)
    console.log(await response.json());
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response) {
  if (response.headers.get('content-type') == 'application/json') {
    const r = response.json();
    return r;
  } else {
    return response.text();
  }
}

function timeout(promise, time) {
  return Promise.race([
    promise,
    new Promise(function (resolve, reject) {
      setTimeout(() => reject(new Error('request timeout')), time)
    })
  ]);
}
