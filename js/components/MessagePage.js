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
} from 'react-native';
import Page from './Page'
import * as Api from '../Api'
import TPColors from '../common/TPColors'
import Icon from 'react-native-vector-icons/Ionicons';
import NavigationBar from 'NavigationBar'
import TPTouchable from '../common/TPTouchable'
import UserPage from './UserPage'
import DiaryPage from './DiaryPage'
import NotificationCenter from '../common/NotificationCenter'

export default class LoginPage extends Page {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1.link_id !== r2.link_id
        });
        this.state = ({
            messages: [],
            messagesDataSource: ds,
            refreshing: true,
        });
    }

    componentWillMount(){
        InteractionManager.runAfterInteractions(() => this._loadMessages());
    }

    componentDidMount() {
        this._startTipTimer();
    }

    _startTipTimer() {
        if (this.tipTimer) {
            clearTimeout(this.tipTimer);
        }
        this.tipTimer = setTimeout(async () => {
            await this._loadMessages();
            this._startTipTimer();
        }, 60 * 1000)
    }

    componentWillUnmount() {
        if (this.tipTimer) {
            clearTimeout(this.tipTimer);
        }
    }

    _onRefresh() {
        this.setState({
            refreshing: true,
        });
        this._startTipTimer();
        this._loadMessages();
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
            await Api.deleteMessage(ids);
        } catch (err) {
            console.log(err);
        }
    }

    async _loadMessages() {
        let list = null;
        try {
            list = await Api.getMessages(0);
            //console.log(list);
            NotificationCenter.trigger('tipCount', list.length);
        } catch (err) {
            console.log(err); //TODO:友好提示
            this.setState({
                refreshing: false,
            });
            return;
        }

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
        //console.log((rowData));

        this.setState({
            messagesDataSource: this.state.messagesDataSource.cloneWithRows(rowData),
            comments: list,
            refreshing: false,
        });
    }

    render() {
        /* removeClippedSubviews 属性的意义
         * 如果没有这个属性,页面在非当前视图更新时,list将变成空的,必须触摸一下才会展示
         */
        return (
            <View style={{flex: 1, backgroundColor: 'white', marginBottom: 48}}>
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
                            colors={[TPColors.light]}
                            tintColor={TPColors.light} />
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
            <TPTouchable onPress={() => this._onCommentPress(msg)}>
                <View key={msg.link_id} style={styles.message}>
                    <Icon name="ios-text" size={16} style={styles.icon} color={TPColors.light} />
                    <Text style={{flex: 1, lineHeight: 20}}>{body}</Text>
                </View>
            </TPTouchable>
        )
    }

    renderFollow(msg) {
        const body = `${msg.content.user.name} 关注了你`;
        return (
            <TPTouchable onPress={() => this._onFollowPress(msg)}>
                <View style={styles.message}>
                    <Icon name="ios-heart" size={16} style={styles.icon} color='#d9534f' />
                    <Text key={msg.link_id} style={{flex: 1, lineHeight: 20}}>{body}</Text>
                </View>
            </TPTouchable>
        )
    }

    renderFooter() {
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