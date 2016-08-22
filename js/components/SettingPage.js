import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity
} from 'react-native';
import Page from './Page'
import NavigationBar from 'NavigationBar'
import * as Api from '../Api'
import Icon from 'react-native-vector-icons/Ionicons';
import TPColors from '../common/TPColors'
import UserIntroEdit from './UserIntroEdit'
import AboutPage from './AboutPage'

export default class SettingPage extends Component {
    logout() {
        Alert.alert('提示','确认退出登录?',[
            {text: '退出', onPress: () => {
                Api.logout();
                this.props.navigator.toLogin();
            }},
            {text: '取消', onPress: () => console.log('OK Pressed!')},
        ]);

    }
    render() {
        //                    <TPButton caption="退出登录" type="danger" onPress={this.logout.bind(this)} />

        return (
            <View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
                <NavigationBar
                    title="设置"
                    backPress={() => { this.props.navigator.pop() }}
                />
                <View style={styles.group}>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => this.props.navigator.push({
                            name: 'UserIntroEdit',
                            component: UserIntroEdit,
                        })}
                    >
                        <Text style={styles.title}>修改个人信息</Text>
                        <Icon name="ios-arrow-forward" style={styles.arrow} size={18} color='#0076FF'/>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() =>
                        this.props.navigator.push({
                            name: 'AboutPage',
                            component: AboutPage,
                        })}
                    >
                        <Text style={styles.title}>关于</Text>
                        <Icon name="ios-arrow-forward" style={styles.arrow} size={18}/>
                    </TouchableOpacity>
                </View>

                <View style={[styles.group, { marginTop: 45 }]}>
                    <TouchableOpacity onPress={this.logout.bind(this)} style={styles.item}>
                        <Text style={styles.button}>退出登录</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    group: {
        marginTop: 30,
        backgroundColor: 'white',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#c8c7cc'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 45,
    },
    title: {
        fontSize: 16,
        color: '#222222',
    },
    line: {
        marginLeft: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#c8c7cc'
    },
    arrow: {
        paddingTop: 1,
        color: TPColors.inactiveText,
    },
    button: {
        flex: 1,
        textAlign: 'center',
        color: '#d9534f',
        fontSize: 16,
    }
});