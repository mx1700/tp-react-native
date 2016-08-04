import React, { Component } from 'react';
import {
  View,
  Image,
  Platform,
  Navigator,
  BackAndroid,
  StyleSheet,
  StatusBar,
} from 'react-native';
import HomePage from './HomePage'

class DefaultPage extends Component {
  render() {
    // <View style={{flex: 1}}>
    //   // <StatusBar
    //   //   translucent={true}
    //   //   backgroundColor="rgba(0, 0, 0, 0.2)"
    //   //   barStyle="light-content"/>
    //   <HomePage navigator={this.props.navigator} />
    // </View>
    return (
      <HomePage navigator={this.props.navigator} />
    )
  }
}

export default class TPNavigator extends Component {

  constructor(props) {
    super(props);
    this._handlers = [];
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBackButton.bind(this));
  }

  getChildContext() {
    return {
      addBackButtonListener: this.addBackButtonListener.bind(this),
      removeBackButtonListener: this.removeBackButtonListener.bind(this),
    };
  }

  addBackButtonListener(listener) {
    this._handlers.push(listener);
  }

  removeBackButtonListener(listener) {
    this._handlers = this._handlers.filter((handler) => handler !== listener);
  }

  handleBackButton() {
    for (let i = this._handlers.length - 1; i >= 0; i--) {
      if (this._handlers[i]()) {
        return true;
      }
    }

    const {navigator} = this.refs;
    if (navigator && navigator.getCurrentRoutes().length > 1) {
      navigator.pop();
      return true;
    }

    return false;
  }

  render() {
    //TODO:根据平台更换动画效果，ios 使用 PushFromRight ， android 用 FloatFromBottomAndroid
    return (
      <Navigator
        ref="navigator"
        style={styles.container}
        initialRoute={{ name: 'DefaultPage', component: DefaultPage }}
        configureScene={(route) => {
          console.log(route);
          if (route.name == 'WritePage' || route.name == 'LoginPage') {  //写日记页面从底部弹出
            return BottomSceneConfigs;
          }
          if (route.name == 'PhotoPage') {
            return Navigator.SceneConfigs.FadeAndroid;
          }
          console.log(route);
          return SceneConfigs;
        }}
        renderScene={(route, navigator) => {
          let Component = route.component;
          return <Component {...route.params} navigator={navigator} />
        }} />
      )
  }
}

const SceneConfigs = Platform.OS === 'android'
  ? Navigator.SceneConfigs.FloatFromBottomAndroid
  : Navigator.SceneConfigs.PushFromRight;

const BottomSceneConfigs = Platform.OS === 'android'
    ? Navigator.SceneConfigs.FloatFromBottomAndroid
    : Navigator.SceneConfigs.FloatFromBottom;

TPNavigator.childContextTypes = {
  addBackButtonListener: React.PropTypes.func,
  removeBackButtonListener: React.PropTypes.func,
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
