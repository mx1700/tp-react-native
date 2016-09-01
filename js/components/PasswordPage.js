import React, { Component } from 'react';
import {
    View,
    Text,
    Alert,
} from 'react-native';
import NavigationBar from 'NavigationBar'
import PasswordInput from '../common/PasswordInput'
import HomePage from './HomePage'
import * as Api from '../Api'
import TPColors from '../common/TPColors'

export default class PasswordPage extends Component {
    static propTypes = {
        //login, setting
        type: React.PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        if (this.props.type == 'setting') {
            this.state = {
                title: '请输入新密码',
                password: null,
                step: 1,
                oldPassword: false,
            };
        } else {
            this.state = {
                title: '请输入密码',
                password: null,
                step: 1,
                oldPassword: false,
            };
        }

    }

    componentDidMount() {
        if (this.props.type == 'setting') {
            Api.getLoginPassword().then((pwd) => {
                if(pwd) {
                    this.setState({
                        title: '请输入旧密码',
                        password: null,
                        step: 0,
                        oldPassword: pwd,
                    })
                } else {
                    this.setState({
                        title: '请输入新密码',
                        password: null,
                        step: 1,
                        oldPassword: null,
                    })
                }

            })
        } else {
            Api.getLoginPassword().then((pwd) => {
                this.setState({
                    oldPassword: pwd
                });
            });
        }
    }

    _onEnd(password) {
        if (this.props.type == 'setting') {
            this._setting(password);
        } else if (this.props.type == 'login') {
            this._login(password);
        }
    }

    _login(password) {
        if(this.state.oldPassword === false) {
            Alert.alert('错误', '密码加载失败');
            return;
        }
        this.refs.input.clear();
        if (this.state.oldPassword === password) {
            this.props.navigator.resetTo({
                name: 'HomePage',
                component: HomePage,
            })
        } else {
            Alert.alert('失败', '密码错误');
        }
    }

    _setting(password) {
        if(this.state.oldPassword === false) {
            Alert.alert('错误', '密码加载失败');
            return;
        }
        this.refs.input.clear();

        if (this.state.step == 0) {
            if (this.state.oldPassword === password) {
                this.setState({
                    title: '请输入新密码',
                    password: null,
                    step: 1,
                })
            } else {
                Alert.alert('提示','旧密码不正确');
            }
        } else if (this.state.step == 1) {
            this.setState({
                title: '请再次输入密码',
                password: password,
                step: 2
            });
        } else if (this.state.step == 2) {
            if (this.state.password !== password) {
                Alert.alert('设置失败', '两次输入的密码不相同,请重新输入')
                this.setState({
                    title: '请输入新密码',
                    password: null,
                    step: 1
                });
                return;
            }
            Api.setLoginPassword(password).then(() => {
                Alert.alert('提示', '设置成功');
                this.props.navigator.pop();
            }).catch(() => {
                Alert.alert('错误', '设置失败');
            })
        }
    }

    _clearPassword() {
        if(this.state.oldPassword === false) {
            Alert.alert('错误', '密码加载失败');
            return;
        }
        if (this.state.step == 0) {
            Alert.alert('提示', '请先输入旧密码后再清除密码');
            return;
        }
        Api.setLoginPassword('').then(() => {
            Alert.alert('提示', '密码已清除');
            this.props.navigator.pop();
        }).catch(() => {
            Alert.alert('错误', '设置失败');
        })
    }

    render() {
        const rightButton = this.props.type == 'setting' && this.state.oldPassword
            ? {
                title: '清除密码',
                handler: this._clearPassword.bind(this)
            }
            : null;

        const nav = this.props.type == 'setting'
            ? (
            <NavigationBar
                title="设置密码"
                backPress={() => this.props.navigator.pop() }
                rightButton={rightButton}
            />
            ) : null;

        const tip = this.props.type == 'setting'
            ? (
                <Text style={{marginTop: 50, fontSize: 11, color: TPColors.inactiveText}}>提示: 从后台切切换前台时不需要输入密码</Text>
            ) : null;

        return (
            <View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
                {nav}
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 200}}>
                    <Text style={{fontSize: 24}}>{this.state.title}</Text>
                    <PasswordInput ref="input" style={{marginTop: 50}} maxLength={4} onEnd={this._onEnd.bind(this)} />
                    {tip}
                </View>
            </View>
        );
    }
}