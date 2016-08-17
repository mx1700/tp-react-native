/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    AppState
} from 'react-native';
import TPNavigator from './js/components/TPNavigator'
import CodePush from "react-native-code-push";
import * as Api from './js/Api'
import fc from 'react-native-fabric-crashlytics';
var Fabric = require('react-native-fabric');
var { Crashlytics } = Fabric;


class tp_react_native extends Component {

    componentDidMount() {
        fc.init();
        AppState.addEventListener('change', this.handleAppStateChange);
        CodePush.sync({installMode: CodePush.InstallMode.ON_NEXT_RESUME});
        this.initFabric().done();
    }

    handleAppStateChange(appState) {
        if (appState === 'active') {
            CodePush.sync({installMode: CodePush.InstallMode.ON_NEXT_RESUME});
        }
    }

    async initFabric() {
        let user;
        try {
            user = await Api.getSelfInfoByStore();
        } finally {
            if (user) {
                console.log(user);
                Crashlytics.setUserName(user.name);
                Crashlytics.setUserIdentifier(user.id.toString());
            }
        }
    }

    render() {
        return <TPNavigator />;
    }
}


AppRegistry.registerComponent('tp_react_native', () => tp_react_native);
