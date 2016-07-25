import React, { Component } from 'react';
import {
  AppRegistry,
} from 'react-native';
import TPNavigator from './js/components/TPNavigator'

class tp_react_native extends Component {
  render() {
    return (<TPNavigator />)
  }
}

AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
