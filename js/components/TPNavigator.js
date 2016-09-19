import React, { Component } from 'react';
import {
  Platform,
  Navigator,
  BackAndroid,
  StyleSheet,
  StatusBar,
    View,
} from 'react-native';
import HomePage from './HomePage'
import LoginPage from './LoginPage'
import * as Api from '../Api'
import PasswordPage from '../components/PasswordPage'
var Fabric = require('react-native-fabric');
var { Answers } = Fabric;

class DefaultPage extends Component {
  state = {
    init: false,
  };

  componentWillMount() {
    this.init()
  }

  async init() {
    const password = await Api.getLoginPassword();
    if (password) {
      this.props.navigator.resetTo({
        name: 'PasswordPage',
        component: PasswordPage,
        params: {
          type: 'login'
        }
      });
      return;
    }
    const token = await Token.getToken();
    if (!token) {
      this.props.navigator.resetTo({
        name: 'LoginPage',
        component: LoginPage
      });
      return;
    }
    this.setState({
      init: true,
    });
  }

  render() {
    if (this.state.init) {
      return <HomePage navigator={this.props.navigator}/>
    } else {
      return (
          <View style={{flex: 1, backgroundColor: 'white'}}>
            <StatusBar barStyle="default"/>
          </View>
      )
    }
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
    return (
      <MyNavigator
        ref="navigator"
        style={styles.container}
        initialRoute={{ name: 'DefaultPage', component: DefaultPage }}
        configureScene={(route) => {
          if (route.name == 'WritePage') {  //写日记页面从底部弹出
            return BottomSceneConfigs;
          }
          if (route.name == 'PhotoPage') {
            return PhotoSceneConfig;
          }
          if (route.name == 'LoginPage') {
            return {...BottomSceneConfigs, gestures: false}
          }
          Answers.logContentView('Route:' + route.name, 'Route', route.name);
          return SceneConfigs;
        }}
        renderScene={(route, navigator) => {
          let Component = route.component;
          return <Component {...route.params} navigator={navigator} />
        }} />
      )
  }
}

class MyNavigator extends Navigator {
  toLogin() {
    this.push({
      name: 'LoginPage',
      component: LoginPage
    });
  }
}

const SceneConfigs = Platform.OS === 'android'
  ? Navigator.SceneConfigs.FloatFromBottomAndroid
  : Navigator.SceneConfigs.PushFromRight;

const BottomSceneConfigs = Platform.OS === 'android'
    ? Navigator.SceneConfigs.FloatFromBottomAndroid
    : Navigator.SceneConfigs.FloatFromBottomAndroid;

const PhotoSceneConfig = {...Navigator.SceneConfigs.FadeAndroid, defaultTransitionVelocity: 3,
  springFriction: 20,};

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
