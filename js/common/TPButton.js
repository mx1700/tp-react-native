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
    const [bg, border, text] = this.getColor(this.props.type);

    const bStyle = this.props.size == 'small'
        ? [styles.button, {borderColor: border,}, styles.small]
        : [styles.button, {borderColor: border,}];

    const tStyle = this.props.size == 'small'
        ? {color: border, fontSize: 12}
        : {color: border, fontSize: 14};

    return (
      <TouchableOpacity
        accessibilityTraits="button"
        onPress={this.props.onPress}
        activeOpacity={0.8}
        style={this.props.style}>
        <View style={bStyle}>
          <Text style={tStyle}>{caption}</Text>
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

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    height: 40,
    alignItems:'center',
    justifyContent:'center',
    borderWidth: 1,
    paddingHorizontal: 25
  },
  small: {
    borderRadius: 12,
    height: 24,
    paddingHorizontal: 15,
  },
  smallText: {
    fontSize: 12,
  }
})