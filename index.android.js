import React, { Component } from 'react';
import {
  AppRegistry,
  Text,View, TouchableNativeFeedback
} from 'react-native';
import TPNavigator from './js/components/TPNavigator'
import TPTouchable from 'TPTouchable'

class tp_react_native extends Component {
  render() {
    return (<TPNavigator />)
    // return (
    //   <View>
    //     <View style={{borderRadius: 24, backgroundColor: '#F66', width: 48,height: 48}}> 
    //       <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#AAF', true)}>
    //         <View style={{borderRadius: 24, backgroundColor: '#F66', width: 48,height: 48}}></View>
    //       </TouchableNativeFeedback>
    //     </View> 
    //   </View>
    //   )
  }
}

AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
