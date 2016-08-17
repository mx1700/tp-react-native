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
    TouchableOpacity,
    Image
} from 'react-native';
import Page from './Page'
import NavigationBar from 'NavigationBar'
import * as Api from '../Api'
import Icon from 'react-native-vector-icons/Ionicons';
import TPColors from '../common/TPColors'

export default class UserIntroEdit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null
        }
    }

    componentWillMount(){
        this._loadUser().done();
    }

    async _loadUser() {
        const user = await Api.getSelfInfoByStore();
        console.log(user);
        this.setState({user: user});
    }

    render() {
        let content;
        if (!this.state.user) {
            content = null;
        } else {
            const user = this.state.user;
            content = (
                <View style={styles.group}>
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.title}>头像</Text>
                        <View style={styles.right}>
                            <Image source={{uri: user.iconUrl}} style={{width: 28, height: 28, borderRadius: 14}} />
                            <Icon name="ios-arrow-forward" style={styles.arrow} size={18}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.title}>名字</Text>
                        <View style={styles.right}>
                            <Text style={styles.value}>{user.name}</Text>
                            <Icon name="ios-arrow-forward" style={styles.arrow} size={18}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.title}>个人简介</Text>
                        <Icon name="ios-arrow-forward" style={styles.arrow} size={18}/>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
                <NavigationBar
                    title="修改个人信息"
                    backPress={() => { this.props.navigator.pop() }}
                />
                {content}
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
    right: {
        flexDirection:'row',
        alignItems: 'center'
    },
    arrow: {
        paddingTop: 1,
        color: TPColors.inactiveText,
        paddingLeft: 15,
    },
    value: {
        fontSize: 16,
        color: TPColors.inactiveText,
    },
    button: {
        flex: 1,
        textAlign: 'center',
        color: '#d9534f',
        fontSize: 16,
    }
});