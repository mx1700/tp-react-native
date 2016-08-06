/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
} from 'react-native';
import TPNavigator from './js/components/TPNavigator'
import CodePush from "react-native-code-push";

class tp_react_native extends Component {

  componentDidMount() {
    CodePush.sync();
  }

  render() {
    return <TPNavigator />;
  }
}

AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
