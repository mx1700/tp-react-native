'use strict';

import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TPColors from './TPColors'
import TPButton from './TPButton';

function errorView(props) {
    const button = props.button
        ? (
        <TouchableOpacity style={{marginTop: 15}} onPress={props.onButtonPress}>
            <Text style={{color: TPColors.light}}>{props.button}</Text>
        </TouchableOpacity>
        )
        : null;
    return (
        <View style={[{flex: 1, paddingTop: 180, alignItems:'center'}, props.style]}>
            <Text style={{color: TPColors.inactive}}>{props.text}</Text>
            {button}
        </View>
    )
}

module.exports = errorView;