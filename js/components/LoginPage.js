import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image, 
  ToolbarAndroid, 
  Platform, 
  ListView, 
  TouchableHighlight,RefreshControl, 
  ActivityIndicator,
  TextInput,
} from 'react-native';

import * as Api from '../Api'

export default class LoginPage extends Component {

    constructor() {
        super();
        this.state = ({
            username: '',
            passwrod: '',
        });
    }

    
    render() {
        return (
            <View style={{flex: 1, paddingTop: 120, paddingHorizontal: 20}}>
                 <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({ username: text })}
                    value={this.state.username}
                />
                 <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({ passwrod: text })}
                    value={this.state.passwrod}
                />

            </View>
        );
    }

}

const styles = StyleSheet.create({

});