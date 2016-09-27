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
                <Icon name={props.icon} size={14} color={TPColors.light} style={styles.button_icon} />
                <Text style={{fontSize: 13, color: TPColors.light }}>{props.text}</Text>
            </View>
        </TouchableOpacity>
    )
}

module.exports = Button;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: TPColors.light,
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button_icon: {
    marginTop: 1, marginRight: 6
  }
});
