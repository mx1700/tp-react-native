import {
    AsyncStorage
} from 'react-native';
var base64 = require('base-64');

class TokenManager {

  generateToken(username, password) {
    return 'Basic ' + base64.encode(username + ":" + password);
  }

  async setToken(token) {
    await AsyncStorage.setItem('user_token', token);
    this.token = token;
  }

  async getToken() {
    if (this.token) {
      return new Promise((resolve) => resolve(this.token));
    }
    var value = await AsyncStorage.getItem('user_token');
    this.token = value;
    return value;
  }

  async setUser(user) {
    await AsyncStorage.setItem('user_info', JSON.stringify(user));
    this.user = user;
  }

  async getUser() {
    if (this.user) {
      return new Promise((resolve) => resolve(this.user));
    }
    var value = JSON.parse(await AsyncStorage.getItem('user_info'));
    this.user = value;
    return value;
  }

  async getLoginPassword() {
    return AsyncStorage.getItem('login_password');
  }

  async setLoginPassword(password) {
    return AsyncStorage.setItem('login_password', password);
  }

  async getUpdateVersion() {
    return JSON.parse(await AsyncStorage.getItem('update_version'));
  }

  async setUpdateVersion(version) {
    return AsyncStorage.setItem('update_version', JSON.stringify(version));
  }

  async setDraft(content) {
      return AsyncStorage.setItem('draft', JSON.stringify(content));
  }

  async getDraft() {
    return JSON.parse(await AsyncStorage.getItem('draft'));
  }
}

export default new TokenManager()
