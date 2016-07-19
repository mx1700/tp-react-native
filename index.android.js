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
  Platform
} from 'react-native';
import HomePage from './js/components/HomePage'

class tp_react_native extends Component {
  
  render() {
    return (
      <View>
        <StatusBar
            translucent={true}
            backgroundColor="rgba(0, 0, 0, 0.2)"
            barStyle="light-content"/>
        <HomePage />
      </View>
      )
    // return (
    //   <View style={styles.container}>
    //     <StatusBar
    //         translucent={true}
    //         backgroundColor="rgba(0, 0, 0, 0.2)"
    //         barStyle="light-content"
    //       />
    //     <View style={[styles.toolbarContainer, this.props.style]}>
    //       <ToolbarAndroid
    //         navIcon={require('./img/back_white.png')}
    //         onActionSelected={this._onActionSelected}
    //         onIconClicked={() => this.setState({actionText: 'Icon clicked'})}
    //         style={styles.toolbar}
    //         title="Toolbar" />
    //     </View>

    //     <Text style={styles.welcome}>
    //       Welcome to React Native!123
    //     </Text>
    //     <Text style={styles.instructions}>
    //       To get started, edit index.android.js
    //     </Text>
    //     <Text style={styles.instructions}>
    //       Shake or press menu button for dev menu
    //     </Text>
    //     <Image source={{ uri: "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png"}} 
    //     style={{width: 40, height: 40}}/>
    //   </View>
    // );
  }
}

//var STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 25;
//var HEADER_HEIGHT = Platform.OS === 'ios' ? 44 + STATUS_BAR_HEIGHT : 56 + STATUS_BAR_HEIGHT;
var STATUS_BAR_HEIGHT = 20;
var HEADER_HEIGHT = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  toolbar: {
    height: HEADER_HEIGHT,
  },
  toolbarContainer: {
    backgroundColor: '#39E',
    paddingTop: STATUS_BAR_HEIGHT,
  },
});

AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
