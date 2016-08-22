import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    Image,
    CameraRoll,
    ActionSheetIOS,
    Alert
} from 'react-native';
import NavigationBar from '../common/NavigationBar'
var DeviceInfo = require('react-native-device-info');
import CodePush from "react-native-code-push";

export default class AboutPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: null,
        };
    }

    componentDidMount() {
        CodePush.getUpdateMetadata()
            .then((update) => {
                if (update) {
                    this.setState({info: update})
                }
                console.log(update);
            });
    }

    render() {
        const label = this.state.info ? ` (${this.state.info.label})` : null;

        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <NavigationBar
                    title="关于"
                    backPress={() => {this.props.navigator.pop()}}
                />
                <View style={{flex: 1, padding: 15, alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('./img/Icon.png')} style={{width: 200, height: 200, borderRadius: 50}} />
                    <Text style={{paddingTop: 20, paddingBottom: 100}}>版本: {DeviceInfo.getReadableVersion()}{label}</Text>
                </View>
            </View>
        );
    }
}