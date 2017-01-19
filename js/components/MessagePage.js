import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ToolbarAndroid,
    Platform,
    ActivityIndicator,
    Modal,
    InteractionManager,
    ListView,
    RefreshControl,
    NativeAppEventEmitter,
    DeviceEventEmitter,
    PushNotificationIOS,
} from 'react-native';
import * as Api from '../Api'
import TPColors from '../common/TPColors'
import Icon from 'react-native-vector-icons/Ionicons';
import NavigationBar from 'NavigationBar'
import TPTouchable from '../common/TPTouchable'
import UserPage from './UserPage'
import DiaryPage from './DiaryPage'
import NotificationCenter from '../common/NotificationCenter'
import ErrorView from '../common/ErrorListView'
import JPushModule from 'jpush-react-native';

const LOOP_TIME_SHORT = 60 * 1000;
const LOOP_TIME_LONG = 150 * 1000;

export default class MessagePage extends Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = ({
            messages: [],
            messagesDataSource: ds,
            refreshing: true,
        });
    }

    loading = false;
    loopTime = LOOP_TIME_LONG;

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.initPush();
            this._startTipTimer();
        });

        NativeAppEventEmitter.addListener(
            'ReceiveNotification',
            (notification) => {
                this._startTipTimer();
                console.log(notification);
            }
        );

        NativeAppEventEmitter.addListener(
            'networkDidReceiveMessage',
            (message) => {
                this._startTipTimer();
                console.log(message);
            }
        );
    }

    async initPush() {
        JPushModule.setupPush((a) => { console.log(a) });
        const user = await Api.getSelfInfoByStore();
        const settings = await Api.getSettings();
        if (user) {
            try {
                // JPushModule.getRegistrationID((registrationid) => {
                //     console.log('registrationid:' + registrationid);
                // });
                const alias = settings['pushMessage'] ? user.id.toString() : user.id.toString() + '_close';
                JPushModule.setAlias(alias , () => {
                    console.log('[jpush] setAlias:ok');
                    this.loopTime = settings['pushMessage'] ? LOOP_TIME_LONG : LOOP_TIME_SHORT
                }, () => {
                    console.log('[jpush] setAlias:err');
                    this.loopTime = LOOP_TIME_SHORT;
                })
            } catch(err) {
                console.log('[jpush] setAlias:err');
                this.loopTime = LOOP_TIME_SHORT;
            }
        }
    }

    async _startTipTimer() {
        if (this.tipTimer) {
            clearTimeout(this.tipTimer);
        }

        try {
            await this._loadMessages();
        } catch(err) {
            console.log(err);
        }
        console.log('[message] loop time:' + this.loopTime);
        this.tipTimer = setTimeout(() => {
            this._startTipTimer();
        }, this.loopTime)
    }

    componentWillUnmount() {
        if (this.tipTimer) {
            clearTimeout(this.tipTimer);
        }
        DeviceEventEmitter.removeAllListeners();
        NativeAppEventEmitter.removeAllListeners();
    }

    _onRefresh() {
        this.setState({
            refreshing: true,
        });
        this._startTipTimer();
    }

    _onCommentPress(msg) {
        this.props.navigator.push({
            name: 'DiaryPage',
            component: DiaryPage,
            params: {
                diary_id: msg.link_id,
                new_comments: msg.list.map(it => it.content.comment_id)
            }
        });
        this._setRead(msg);
    }

    _onFollowPress(msg) {
        this.props.navigator.push({
            name: 'UserPage',
            component: UserPage,
            params: {
                user: msg.content.user
            }
        });
        this._setRead(msg);
    }

    async _setRead(msg) {
        let ids = null;
        if (msg.type == 1) {    //回复
            ids = msg.list.map(it => it.id);
        } else if (msg.type == 2) {     //关注
            ids = [msg.id];
        }

        try {
            const newMsg = this.state.messages.filter((msg) => ids.indexOf(msg.id) == -1);
            this._setMsgList(newMsg);
            await Api.deleteMessage(ids);
        } catch (err) {
            console.log(err);
        }
    }

    _onDeletePress(msg) {
        this._setRead(msg).done();
    }

    async _loadMessages() {
        let user = await Api.getSelfInfoByStore();
        if (!user || this.loading) {
            this.setState({
                refreshing: false,
            });
            return;
        }
        this.loading = true;
        let list = [];
        try {
            list = await Api.getMessages(0);
        } catch (err) {
            //Alert.alert('提醒加载失败', err.message);
        }
        this.loading = false;
        //console.log(list);
        this._setMsgList(list);
    }

    _setMsgList(list) {
        const rowData = list
            .reduce((ret, v) => {
                if (v.type == 2) {  //关注
                    ret.push(v);
                }
                if (v.type == 1) {  //回复
                    const items = ret.filter(x => x.type == 1 && x.link_id == v.link_id);
                    if (items.length > 0) {
                        items[0].list.push(v);
                    } else {
                        ret.push({
                            type: 1,
                            link_id: v.link_id,
                            created: v.created,
                            list: [v]
                        });
                    }
                }

                return ret;

            }, []);

        //console.log(rowData);
        this.setState({
            messagesDataSource: this.state.messagesDataSource.cloneWithRows(rowData),
            messages: list,
            refreshing: false,
        });
        // JPushModule.setBadge(list.length, function(err) {
        //     console.log('setBadge');
        //     console.log(err);
        // });      //TODO:严重闪退 bug
        PushNotificationIOS.setApplicationIconBadgeNumber(list.length);
        NotificationCenter.trigger('tipCount', list.length);
    }

    render() {
        /* removeClippedSubviews 属性的意义
         * 如果没有这个属性,页面在非当前视图更新时,list将变成空的,必须触摸一下才会展示
         */
        return (
            <View style={{flex: 1, backgroundColor: 'white', marginBottom: 49}}>
                <NavigationBar
                    title="提醒"
                />
                <ListView
                    dataSource={this.state.messagesDataSource}
                    renderRow={(rowData) => this.renderMessage(rowData) }
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                            colors={[TPColors.refreshColor]}
                            tintColor={TPColors.refreshColor} />
                    }
                    renderFooter={this.renderFooter.bind(this)}
                    enableEmptySections={true}
                    automaticallyAdjustContentInsets={false}
                    removeClippedSubviews={false}
                />
            </View>
        )
    }

    renderMessage(msg) {
        if (msg.type == 1) {
            return this.renderComment(msg);
        } else if (msg.type == 2) {
            return this.renderFollow(msg);
        }


        return (
            <View />
        )
    }

    renderComment(msg) {
        const users = unique(msg.list.map(it => it.content.author.name)).join('、');
        const body = `${users} 回复了你`;
        return (
            <TPTouchable key={msg.link_id} onPress={() => this._onCommentPress(msg)}>
                <View style={styles.message}>
                    <Icon name="ios-text" size={16} style={styles.icon} color={TPColors.light} />
                    <Text style={{flex: 1, lineHeight: 20}}>{body}</Text>
                    <TPTouchable onPress={() => this._onDeletePress(msg)}>
                        <Icon name="md-close" size={16} style={styles.delete} color={TPColors.inactiveText} />
                    </TPTouchable>
                </View>
            </TPTouchable>
        )
    }

    renderFollow(msg) {
        const body = `${msg.content.user.name} 关注了你`;
        return (
            <TPTouchable key={msg.link_id} onPress={() => this._onFollowPress(msg)}>
                <View style={styles.message}>
                    <Icon name="ios-heart" size={16} style={styles.icon} color='#d9534f' />
                    <Text key={msg.link_id} style={{flex: 1, lineHeight: 20}}>{body}</Text>
                    <TPTouchable onPress={() => this._onDeletePress(msg)}>
                        <Icon name="md-close" size={16} style={styles.delete} color={TPColors.inactiveText} />
                    </TPTouchable>
                </View>
            </TPTouchable>
        )
    }

    renderFooter() {
        if(this.state.refreshing) return null;

        if (this.state.messages.length == 0) {
            return <ErrorView text="没有提醒 :)" />
        }
        return (
            <View />
        )
    }
}

const styles = StyleSheet.create({
    message: {
        padding: 20,
        borderColor: TPColors.cellBorder,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row'
    },
    icon: {
        marginRight: 10,
        marginTop: 1,
        lineHeight: 20,
    },
    delete: {
        lineHeight: 20,
        paddingHorizontal: 8,
    }
});

function unique(array){
    var n = []; //一个新的临时数组
    //遍历当前数组
    for(var i = 0; i < array.length; i++){
        //如果当前数组的第i已经保存进了临时数组，那么跳过，
        //否则把当前项push到临时数组里面
        if (n.indexOf(array[i]) == -1) n.push(array[i]);
    }
    return n;
}