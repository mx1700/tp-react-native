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
  View,
  Image, 
  StatusBar, 
  ToolbarAndroid, 
  Platform,
  Navigator
} from 'react-native';
import HomePage from './js/components/HomePage'
import LoginPage from './js/components/LoginPage'
import TPNavigator from './js/components/TPNavigator'

class tp_react_native extends Component {
  render() {
    return (<TPNavigator />)
  }
}

//var STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 25;
//var HEADER_HEIGHT = Platform.OS === 'ios' ? 44 + STATUS_BAR_HEIGHT : 56 + STATUS_BAR_HEIGHT;
var STATUS_BAR_HEIGHT = 20;
var HEADER_HEIGHT = 56;
AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
