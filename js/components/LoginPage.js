import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image, 
  ToolbarAndroid, 
  Platform, 
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import * as Api from '../Api'
import TPButton from 'TPButton'

export default class LoginPage extends Component {

    constructor() {
        super();
        this.state = ({
            username: '',
            passwrod: '',
            loading: false, 
        });
    }

    _usernameSubmit() {
        //移到密码框
    }

    _passwordSubmit() {
        //提交登陆请求
        this._login()
    }

    _cancel() {

    }

    async _login() {
        //TODO:loading
        this.setState({ loading: true })
        const result = await Api.login(this.state.username, this.state.passwrod)
        this.setState({ loading: false })
        if (result) {
            console.warn('登陆成功')
        }
    }

    
    render() {
        return (
            <View style={{flex: 1, paddingTop: 120, paddingHorizontal: 20}}>
                <Modal 
                    visible={this.state.loading}
                    transparent={true}
                    onRequestClose={this._cancel.bind(this)}
                >
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <ActivityIndicator animating={true} color="#39E" size="large" />
                </View>
                </Modal>
                 <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({ username: text })}
                    value={this.state.username}
                    onSubmitEditing={this._usernameSubmit.bind(this)}
                    keyboardType="email-address"
                    autoCorrect={false}
                    autoFocus={true}
                    placeholder="邮箱"
                />
                 <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({ passwrod: text })}
                    value={this.state.passwrod}
                    onSubmitEditing={this._passwordSubmit.bind(this)}
                    autoCorrect={false}
                    placeholder="密码"
                    secureTextEntry={true}
                    selectTextOnFocus={true}
                />
                <TPButton 
                    caption="登陆" 
                    onPress={this._login.bind(this)} 
                    type="bordered" 
                    style={{}}/>
            </View>
        );
    }

}

const styles = StyleSheet.create({

});