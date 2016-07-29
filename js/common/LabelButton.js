/**
 * @LabelButton TPTouchable
 */

'use strict';

import React from 'react';
import {
  StyleSheet,
  Text
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import TPColors from 'TPColors'

function Button(props) {
    return (
        <View style={styles.button}>
            <Icon name="comment" size={12} color="#999" style={styles.button_icon} />
            <Text style={{fontSize: 12}}>Apple</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  button: {
    flex: 0, 
    flexDirection: "row", 
    marginTop: 5, 
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: TPColors.inactiveText, 
    borderRadius: 3, 
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  button_icon: {
    marginTop: 2, marginRight: 8
  },
});