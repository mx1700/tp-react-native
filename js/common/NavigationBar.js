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
import Icon from 'react-native-vector-icons/Ionicons';

// export default class NavigationBar extends Component {
//
//   render() {
//
//   }
// }


function NavigationBarIOS(props) {
  //console.log(props);

  let attr = {};
  if (props.backPress) {
    const icon = <Icon name="ios-arrow-back" size={26} color='#0076FF'/>;
    attr.leftButton = (
        <TouchableOpacity
            onPress={props.backPress}
            style={{padding: 9, paddingHorizontal: 15}}
        >
          {icon}
        </TouchableOpacity>
    )
  }

  if (props.rightButton) {
    attr.rightButton = props.rightButton;
  }

  if (props.leftButton) {
    attr.leftButton = props.leftButton;
  }

  let style = {borderColor: '#bbb', borderBottomWidth: StyleSheet.hairlineWidth}
  if (props.noBorder == true) {
    style = {};
  }

  const title = (!!props.title.props) ? props.title : {title: props.title};

  return (
    <NavBar
      style={{...style, backgroundColor: '#F9F9F9'}}
      title={title}
      {...attr}
      statusBar={{
        tintColor: '#F9F9F9'
      }}
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

const NavigationBar = Platform.OS === 'android'
  ? NavigationBarAndroid
  : NavigationBarIOS;

NavigationBar.Icon = function(props) {
  const color = props.color ? props.color : '#0076FF';
  const icon = <Icon name={props.name} size={26} color={color}/>
  const badge = props.badge == true
      ? <View style={styles.badge}/>
      : null;
  return (
      <TouchableOpacity
          onPress={props.onPress}
          style={{padding: 9}}
      >
        {icon}
        {badge}
      </TouchableOpacity>
  );
};

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
  badge: {
    width: 9,
    height: 9,
    backgroundColor: 'red',
    position: 'absolute',
    top: 11,
    right: 9,
    borderRadius: 5,
  }
});

module.exports = NavigationBar;
