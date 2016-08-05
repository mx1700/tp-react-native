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
import TPColors from './TPColors'

function TPTouchableIOS(props) {
  return (
    <TouchableHighlight
      accessibilityTraits="button"
      underlayColor='#f3f3f3'
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
