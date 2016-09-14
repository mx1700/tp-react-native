import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    Linking,
    Switch
} from 'react-native';
import { NotificationCenter, TPColors } from '../common'
import NavigationBar from 'NavigationBar'
import * as Api from '../Api'
import Icon from 'react-native-vector-icons/Ionicons';
import UserIntroEdit from './UserIntroEdit'
import AboutPage from './AboutPage'
import PasswordPage from './PasswordPage'

export default class SettingPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hasUpdateNews: false,
            hasPassword: false,
        };
    }

    onReadUpdateNews = () => {
        this.setState({
            hasUpdateNews: false
        })
    };

    onUpdateStartupPassword = () => {
        Api.getLoginPassword()
            .then((v) => this.setState({hasPassword: v != null && v.length > 0}));
    };

    componentDidMount() {
        this._loadUpdateState();
        this.onUpdateStartupPassword();
        NotificationCenter.addLister('onReadUpdateNews', this.onReadUpdateNews);
        NotificationCenter.addLister('onUpdateStartupPassword', this.onUpdateStartupPassword);
    }

    componentWillUnmount() {
        NotificationCenter.removeLister('onReadUpdateNews', this.onReadUpdateNews);
        NotificationCenter.removeLister('onUpdateStartupPassword', this.onUpdateStartupPassword);
    }

    logout() {
        Alert.alert('提示','确认退出登录?',[
            {text: '退出', onPress: () => {
                Api.logout();
                this.props.navigator.toLogin();
            }},
            {text: '取消', onPress: () => console.log('OK Pressed!')},
        ]);

    }

    async _loadUpdateState() {
        const hasNews = await Api.hasUnreadUpdateNews();
        if (!hasNews) return;

        this.setState({
            hasUpdateNews: hasNews
        });
    }

    changePassword = () => {
        setTimeout(() => {
            this.props.navigator.push({
                name: 'PasswordPage',
                component: PasswordPage,
                params: {
                    type: 'setting'
                }
            })
        }, 200);
    };

    render() {
        const badge = this.state.hasUpdateNews
            ? (
            <View style={styles.badge}>
                <Text style={styles.badge_text}>1</Text>
            </View>
            )
            : null;
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
                    <View style={styles.item}>
                        <Text style={styles.title}>启动密码</Text>
                        <Switch value={this.state.hasPassword} onValueChange={this.changePassword} />
                    </View>


                </View>

                <View style={[styles.group]}>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() =>
                            Linking.openURL("https://itunes.apple.com/us/app/jiao-nang-ri-ji/id1142102323?l=zh&ls=1&mt=8")}
                    >
                        <Text style={styles.title}>去 App Store 评价</Text>
                        <Icon name="ios-arrow-forward" style={styles.arrow} size={18}/>
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
                        {badge}
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
        flex: 1,
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
    },
    badge: {
        backgroundColor: 'red',
        paddingHorizontal:8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 10
    },
    badge_text: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Arial'
    }
});