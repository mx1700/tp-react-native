/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  AppState,
} from 'react-native';
import TPNavigator from './js/components/TPNavigator'
import CodePush from "react-native-code-push";
import * as Api from './js/Api'
import Token from './js/TokenManager'
import fc from 'react-native-fabric-crashlytics';
var Fabric = require('react-native-fabric');
var { Crashlytics } = Fabric;

class tp_react_native extends Component {

  componentDidMount() {
    fc.init();
    AppState.addEventListener('change', this.handleAppStateChange);
    CodePush.sync();
    this.initFabric().done();
  }

  handleAppStateChange(appState) {
    if (appState === 'active') {
      CodePush.sync();
    }
  }

  async initFabric() {
    let user;
    try {
      user = await Api.getSelfInfoByStore();
    } catch(err) {
      console.log(err)
    }
    finally {
      if (user) {
        Crashlytics.setUserName(user.name);
        Crashlytics.setUserIdentifier(user.id.toString());
      }
    }
  }

  render() {
    return <TPNavigator />;
  }
}

AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
