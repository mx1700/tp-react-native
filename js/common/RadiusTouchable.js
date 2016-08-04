/**
 * @providesModule RadiusTouchable
 */

'use strict';

import React from 'react';
import {
  TouchableHighlight,
  TouchableNativeFeedback,
  Platform,
    TouchableOpacity
} from 'react-native';

function RadiusTouchableIOS(props) {
  return (
    <TouchableOpacity
      accessibilityTraits="button"
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
