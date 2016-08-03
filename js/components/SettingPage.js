import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import NavigationBar from 'NavigationBar'
import TPButton from '../common/TPButton';
import * as Api from '../Api'
import LoginPage from './LoginPage'

export default class SettingPage extends Component {
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
                />
                <View style={{padding: 20}}>
                <TPButton caption="退出登录" type="danger" onPress={this.logout.bind(this)} />
                </View>
            </View>
        );
    }
}