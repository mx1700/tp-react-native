/**
 * @providesModule LabelButton
 */

'use strict';

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TPColors from 'TPColors'

function Button(props) {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={styles.button}>
                <Icon name={props.icon} size={13} color="#444" style={styles.button_icon} />
                <Text style={{fontSize: 12}}>{props.text}</Text>
            </View>
        </TouchableOpacity>
    )
}

module.exports = Button;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: TPColors.inactiveText,
    borderRadius: 3,
    paddingVertical: 7,
    paddingHorizontal: 15,
      height: 28,
  },
  button_icon: {
    marginTop: 0, marginRight: 8
  }
});
