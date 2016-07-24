/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import TPNavigator from './js/components/TPNavigator'

class tp_react_native extends Component {
  render() {
    return <TPNavigator />;
  }
}

AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
