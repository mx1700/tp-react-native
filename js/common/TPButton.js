/**
 * @providesModule TPButton
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

export default class TPButton extends Component {
  render() {
    const caption = this.props.caption.toUpperCase();
    let [bg, border, text] = this.getColor(this.props.type);
    return (
      <TouchableOpacity
        accessibilityTraits="button"
        onPress={this.props.onPress}
        activeOpacity={0.8}
        style={this.props.style}>
        <View style={{
          borderRadius: 25,
          height: 40,
          alignItems:'center',
          justifyContent:'center',
          borderColor: border,
          borderWidth: 1
        }}>
          <Text style={{color: bg, fontSize: 14}}>{caption}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  getColor(type) {
    switch (type) {
      case 'success':
        return ['#5cb85c', '#5cb85c', '#fff']
      case 'warning':
        return ['#f0ad4e', '#f0ad4e', '#fff']
      case 'secondary':
        return ['#fff', '#ccc', '#373a3c']
      case 'danger':
        return ['#d9534f', '#d9534f', '#fff']
      default:
        return ['#0076FF', '#0076FF', '#fff']
    }
  }
}