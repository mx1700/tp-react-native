import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import Page from './Page'
import NavigationBar from 'NavigationBar'
import TPButton from '../common/TPButton';
import * as Api from '../Api'


export default class SettingPage extends Page {
    logout() {
        Alert.alert('确认退出登录?', '',[
            {text: '取消', onPress: () => console.log('OK Pressed!')},
            {text: '确认退出', onPress: () => {
                Api.logout();
                this.props.navigator.toLogin();
            }}
        ]);

    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <NavigationBar
                    title="设置"
                    leftButton={{ title: "后退", handler: () => { this.props.navigator.pop() } }}
                />
                <View style={{padding: 15}}>
                <TPButton caption="退出登录" type="danger" onPress={this.logout.bind(this)} />
                </View>
            </View>
        );
    }
}