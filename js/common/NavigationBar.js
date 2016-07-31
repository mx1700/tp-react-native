/**
 * @providesModule NavigationBar
 */

'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import TPColors from 'TPColors'
import NavBar from 'react-native-navbar';

// export default class NavigationBar extends Component {
//
//   render() {
//
//   }
// }


function NavigationBarIOS(props) {
  //console.log(props);

  let attr = {}
  if (props.back) {
    attr.leftButton = {
      title: props.back,
    }
    if (props.backPress) {
      attr.leftButton.handler = props.backPress;
    }
  }

  if (props.rightButton) {
    attr.rightButton = props.rightButton;
  }

  if (props.leftButton) {
    attr.leftButton = props.leftButton;
  }

  return (
    <NavBar
      style={{borderColor: '#bbb', borderBottomWidth: StyleSheet.hairlineWidth}}
      title={{title: props.title}}
      {...attr}
    />
  );
}

function NavigationBarAndroid(props) {
  return (
    <View style={[styles.toolbarContainer, props.style]}>
      <ToolbarAndroid
        navIcon={require('../components/img/back_white.png')}
        onActionSelected={this._onActionSelected}
        onIconClicked={() => this.setState({actionText: 'Icon clicked'})}
        style={styles.toolbar}
        title="首页"
        titleColor="white">
        <Text></Text>
      </ToolbarAndroid>
    </View>
  )
}

//var STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 25;
//var HEADER_HEIGHT = Platform.OS === 'ios' ? 44 + STATUS_BAR_HEIGHT : 56 + STATUS_BAR_HEIGHT;
var STATUS_BAR_HEIGHT = 20;
var HEADER_HEIGHT = 56;

const styles = StyleSheet.create({
  toolbar: {
    height: HEADER_HEIGHT,
  },
  toolbarContainer: {
    backgroundColor: TPColors.light,
    paddingTop: STATUS_BAR_HEIGHT,
    elevation: 2,
    borderRightWidth: 1,
    marginRight: -1,
    borderRightColor: 'transparent',
  },
});

const NavigationBar = Platform.OS === 'android'
  ? NavigationBarAndroid
  : NavigationBarIOS;

module.exports = NavigationBar;
