import React, { Component } from 'react';
import {
  AppRegistry,
  Text,View, TouchableNativeFeedback, ScrollView
} from 'react-native';
import TPNavigator from './js/components/TPNavigator'
import TPTouchable from 'TPTouchable'

class tp_react_native extends Component {

  constructor(props) {
    super(props);
    this.state = {
      y: 0
    }
  }

  render() {
    //return (<TPNavigator />)
    return (
      <ScrollView style={{flex: 1}}>
        <View style={{height: 84, backgroundColor: "#ccc", marginTop: this.state.y}}></View>
        <ScrollView style={{flex: 1, height: 600}} ref="scrollView"
          onScroll={(e) => {
            // var y = e.nativeEvent.contentOffset.y;
            // this.setState({
            //   y: this.state.y - y
            // });
            // this.refs.scrollView.scrollTo(0, false)
          }}
        >
          <View style={{height: 500, backgroundColor: "#f5f5f5"}}>
            
          </View>
          <View style={{height: 500, backgroundColor: "#5f5f5f"}}>
            
          </View>
        </ScrollView>
      </ScrollView>
    )
  }
}

AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
