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

function emptyView(props) {
    return (
        <View style={{flex: 1, paddingTop: 180, alignItems:'center'}}>
            <Text style={{color: TPColors.inactive}}>{props.text}</Text>
        </View>
    )
}

module.exports = emptyView;