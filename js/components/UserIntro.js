import React, {Component} from 'react';
import {
    StyleSheet,
    Platform,
    ActivityIndicator,
    Text,
    InteractionManager,
    View,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import * as Api from '../Api'
import TPColors from '../common/TPColors'
import NotificationCenter from '../common/NotificationCenter'
var moment = require('moment');

export default class UserIntro extends Component {

    static propTypes = {
        user: React.PropTypes.object,
        mySelf: React.PropTypes.bool,
    };

    static defaultProps = {
        mySelf: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            user: props.user,
            userId: props.userId,
            loading: true,
        };
        this._updateUserInfo = this._updateUserInfo.bind(this);
    }

    getId() {
        return this.props.user != null ? this.props.user.id : this.props.userId;
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._loadUser().done();
        });
        if(this.props.mySelf) {
            NotificationCenter.addLister('updateUserInfo', this._updateUserInfo)
        }
    }

    componentWillUnmount() {
        if(this.props.mySelf) {
            NotificationCenter.removeLister('updateUserInfo', this._updateUserInfo)
        }
    }

    _updateUserInfo() {
        this._loadUser().done();
    }

    async _loadUser() {
        let user;
        try {
            if(this.props.mySelf) {
                user = await Api.getSelfInfoByStore();
            } else {
                user = await Api.getUserInfo(this.getId())
            }
        } catch(err) {
            Alert.alert('加载失败', err);
            return;
        }
        this.setState({
            user: user,
            loading: false,
        });

        if(this.props.mySelf && user) {
            let newUser;
            try {
                newUser = await Api.getUserInfo(user.id)
            } catch(err) {
                console.log(err)
            }
            if (newUser) {
                Api.updateUserInfoStore(newUser);
                this.setState({
                    user: newUser,
                    loading: false,
                });
            }
        }
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={[{flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}, this.props.style]}>
                    <ActivityIndicator color={TPColors.light} />
                </View>
            )
        }
        const user = this.state.user;

        const intro = user.intro && user.intro.length > 0
            ? (
            <Text style={{ padding: 15, color: TPColors.contentText, lineHeight: 24, textAlign: 'center'}}>
                {user.intro}
            </Text>
            ) : null;

        return (
            <ScrollView style={[{flex: 1, backgroundColor: 'white'}, this.props.style]}
                        automaticallyAdjustContentInsets={false}
            >
                <View style={{height: 210, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                        key={user.id}
                        style={{width: 90, height: 90, borderRadius: 45, backgroundColor: '#f3f3f3'}}
                        source={{uri: user.coverUrl}}
                    />
                    <Text style={{fontSize: 22, marginTop: 30, fontWeight: 'bold'}}>{user.name}</Text>
                </View>
                {intro}
                <Text style={{
                    marginTop: 30,
                    marginBottom:60,
                    padding: 15,
                    color: TPColors.inactiveText,
                    lineHeight: 20,
                    textAlign: 'center'
                }}>
                     {moment(user.created).format('YYYY年M月D日')}加入胶囊
                </Text>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    line: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: TPColors.line,
        marginHorizontal: 16,
        marginVertical: 10,
    }
});