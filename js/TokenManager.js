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
}

export default new TokenManager()
