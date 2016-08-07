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

function emptyView(props) {
    return (
        <View style={{flex: 1, paddingTop: 180, alignItems:'center'}}>
            <Text style={{color: TPColors.inactive}}>{props.text}</Text>
            <TouchableOpacity style={{marginTop: 15}} onPress={props.onButtonPress}>
                <Text style={{color: TPColors.light}}>重试一下</Text>
            </TouchableOpacity>
        </View>
    )
}

module.exports = emptyView;