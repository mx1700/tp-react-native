import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    ActivityIndicator,
    SegmentedControlIOS,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';
import { TPColors } from '../common'

function bookView(props) {
    const book = props.book;
    const exp = book.isExpired ? '已过期' : '未过期';
    const label = book.isPublic ? null : (
        <Text style={{position: 'absolute', fontSize: 11, top: 0, right: 7, padding: 3,backgroundColor: 'red', color: 'white', opacity: 0.75}}>私密</Text>
    );
    return (
        <TouchableOpacity key={book.id} onPress={props.onPress} style={props.style}>
            <View style={{
                width: 140,
                shadowColor: '#444',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 0 },
                backgroundColor: '#fff',
                alignItems:'center',
            }}>
                <Image key={book.id} style={{width: 140, height: 105, flexDirection: 'row', justifyContent: 'flex-end'}} source={{uri: book.coverUrl}}>
                    {label}
                </Image>
                <View style={{
                    alignItems:'center',
                    width: 141,
                    borderColor: '#eee',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderTopWidth: 0,
                    paddingBottom: 5,
                }}>
                    <View style={{alignItems: 'center', justifyContent: 'center', padding: 5, height: 55}}>
                        <Text style={{textAlign: 'center', fontWeight: 'bold', color: TPColors.contentText}} allowFontScaling={false}>{book.subject}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: TPColors.inactiveText}} allowFontScaling={false}>{exp}</Text>
                    <Text style={{ fontSize: 10, color: TPColors.inactiveText}} allowFontScaling={false}>{book.created}至{book.expired}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

module.exports = bookView;