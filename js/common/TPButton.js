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
    let icon;
    if (this.props.icon) {
      icon = <Image source={this.props.icon} style={styles.icon} />;
    }
    var border = this.props.type === 'bordered' && styles.border;

    var content = (
      <View style={[styles.button, border]}>
        {icon}
        <Text style={[styles.caption, styles.secondaryCaption]}>
          {caption}
        </Text>
      </View>
    );
    return (
      <TouchableOpacity
        accessibilityTraits="button"
        onPress={this.props.onPress}
        activeOpacity={0.8}
        style={[styles.container, this.props.style]}>
        {content}
      </TouchableOpacity>
    );
  }
}

const HEIGHT = 50;

var styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    // borderRadius: HEIGHT / 2,
    // borderWidth: 1 / PixelRatio.get(),
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  border: {
    borderWidth: 1,
    borderColor: TPColors.lightText,
    borderRadius: HEIGHT / 2,
  },
  icon: {
    marginRight: 12,
  },
  caption: {
    letterSpacing: 1,
    fontSize: 12,
  },
  primaryCaption: {
    color: 'white',
  },
  secondaryCaption: {
    color: TPColors.lightText,
  }
});