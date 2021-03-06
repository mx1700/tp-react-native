import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    Image,
    CameraRoll,
    ActionSheetIOS,
} from 'react-native';
import NavigationBar from '../common/NavigationBar'
var DeviceInfo = require('react-native-device-info');
import CodePush from "react-native-code-push";
import * as Api from '../Api'
import TPColors from '../common/TPColors'
import NotificationCenter from '../common/NotificationCenter'

export default class AboutPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: null,
            news: Api.getUpdateNews()
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

        Api.readUpdateNews();
        NotificationCenter.trigger('onReadUpdateNews');
        // CodePush.checkForUpdate()
        //     .then((update) => {
        //         if (!update) {
        //             alert("The app is up to date!");
        //         } else {
        //             alert("An update is available! Should we download it?");
        //         }
        //         console.log(update);
        //     });
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
                    <Image source={require('./img/Icon.png')} style={{width: 128, height: 128, borderRadius: 28}} />
                    <Text style={{paddingTop: 20, paddingBottom: 60}}>版本: {DeviceInfo.getReadableVersion()}{label}</Text>
                    <Text style={{color: TPColors.inactiveText}}>{this.state.news.date} 更新日志</Text>
                    <Text style={{lineHeight: 20}}>{this.state.news.info}</Text>
                </View>
            </View>
        );
    }
}