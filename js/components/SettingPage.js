import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import Page from './Page'
import NavigationBar from 'NavigationBar'
import TPButton from '../common/TPButton';
import * as Api from '../Api'
import LoginPage from './LoginPage'

export default class SettingPage extends Page {
    logout() {
        Api.logout();
        const nav = this.props.navigator;
        nav.resetTo({
            name: 'LoginPage',
            component: LoginPage
        });
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