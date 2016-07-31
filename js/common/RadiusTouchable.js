/**
 * @providesModule RadiusTouchable
 */

'use strict';

import React from 'react';
import {
  TouchableHighlight,
  TouchableNativeFeedback,
  Platform,
} from 'react-native';

function RadiusTouchableIOS(props) {
  return (
    <TouchableHighlight
      accessibilityTraits="button"
      underlayColor="#3C5EAE"
      {...props}
    />
  );
}

function RadiusTouchableAndroid(props) {
  return (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple('#3C5EAE', true)}
      {...props}
    />
  )
}

const TPTouchable = Platform.OS === 'android'
  ? RadiusTouchableAndroid
  : RadiusTouchableIOS;

module.exports = TPTouchable;
