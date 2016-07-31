/**
 * @providesModule TPTouchable
 */

'use strict';

import React from 'react';
import {
  TouchableHighlight,
  TouchableNativeFeedback,
  Platform,
} from 'react-native';

function TPTouchableIOS(props) {
  return (
    <TouchableHighlight
      accessibilityTraits="button"
      underlayColor="#3C5EAE"
      {...props}
    />
  );
}

function TPTouchableAndroid(props) {
  return (
    <TouchableNativeFeedback
      {...props}
    />
  )
}

const TPTouchable = Platform.OS === 'android'
  ? TPTouchableAndroid
  : TPTouchableIOS;

module.exports = TPTouchable;
