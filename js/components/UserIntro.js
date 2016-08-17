import React, {Component} from 'react';
import {
    StyleSheet,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Text,
    InteractionManager,
    View,
    Image,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import * as Api from '../Api'
import TPColors from '../common/TPColors'
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
        }
    }

    getId() {
        return this.props.user != null ? this.props.user.id : this.props.userId;
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._loadUser().done();
        });
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
            alert('简介加载失败');
            return;
        }
        //console.log(user);
        this.setState({
            user: user,
            loading: false,
        })
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={[{flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}, this.props.style]}>
                    <ActivityIndicator />
                </View>
            )
        }
        const user = this.state.user;

        const intro = user.intro && user.intro.length > 0
            ? (
            <Text style={{ padding: 15, color: TPColors.contentText, lineHeight: 20 }}>
                {user.intro}
            </Text>
            ) : null;

        return (
            <ScrollView style={[{flex: 1, backgroundColor: 'white'}, this.props.style]}
                        automaticallyAdjustContentInsets={false}
            >
                <View style={{height: 220, backgroundColor: '#f6f9ff', alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                        key={user.id}
                        style={{width: 90, height: 90, borderRadius: 45}}
                        source={{uri: user.coverUrl}}
                    />
                    <Text style={{fontSize: 20, marginTop: 15}}>{user.name}</Text>
                </View>
                {intro}
                <Text style={{
                    marginTop: 10,
                    marginBottom:30,
                    padding: 15,
                    color: TPColors.inactiveText,
                    lineHeight: 20,
                    textAlign: 'center'
                }}>
                    —— {moment(user.created).format('YYYY年M月D日')}加入胶囊 ——
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