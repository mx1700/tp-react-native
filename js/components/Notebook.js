import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    SegmentedControlIOS,
    Alert,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';
import { TPColors } from '../common'

function bookView(props) {
    const book = props.book;
    const exp = book.isExpired ? '已过期' : '未过期';
    const label = book.isPublic ? null : (
        <Text style={{height: 14, fontSize: 10, padding: 2, marginRight: 10, backgroundColor: 'red', color: 'white', opacity: 0.75}}>私密</Text>
    );
    return (
        <TouchableOpacity key={book.id} onPress={props.onPress} style={props.style}>
            <View style={{
                width: 140,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 0 },
                backgroundColor: '#fff',
                alignItems:'center',
                paddingBottom: 5,
            }}>
                <Image key={book.id} style={{width: 140, height: 105, flexDirection: 'row', justifyContent: 'flex-end'}} source={{uri: book.coverUrl}}>
                    {label}
                </Image>
                <View style={{alignItems: 'center', justifyContent: 'center', padding: 5, height: 55}}>
                    <Text style={{textAlign: 'center', fontWeight: 'bold', color: TPColors.contentText}}>{book.subject}</Text>
                </View>
                <Text style={{ fontSize: 10, color: TPColors.inactiveText}}>{exp}</Text>
                <Text style={{ fontSize: 10, color: TPColors.inactiveText}}>{book.created}至{book.expired}</Text>
            </View>
        </TouchableOpacity>
    )
}

module.exports = bookView;