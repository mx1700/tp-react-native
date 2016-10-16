import React, { Component } from 'react';
import {
    View,
    Platform,
    ListView,
    InteractionManager,
    RefreshControl,
    Text,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    SegmentedControlIOS
} from 'react-native';
import NavigationBar from 'NavigationBar'
import * as Api from '../Api'
import TPColors from '../common/TPColors'
import ErrorView from '../common/ErrorListView'
import UserPage from './UserPage'
import { SwipeListView } from 'react-native-swipe-list-view';
import TPTouchable from 'TPTouchable'

export default class FollowUsersPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedIndex: 0,
            loadedFollow: true,
            loadedFollowReverse: false,
        };
    }

    render() {

        const followViewStyle = this.state.selectedIndex == 0 ? null : {height: 0, flex: null};
        const followViewReverseStyle = this.state.selectedIndex == 1 ? null : {height: 0, flex: null};

        const followView = this.state.loadedFollow
            ? (
            <FollowList
                style={followViewStyle}
                navigator={this.props.navigator}
                onLoadDate={(page, pageSize) => {
                    return Api.getRelationUsers(page, pageSize);
                }}
                onDeletePress={(user) => Api.deleteFollow(user.id)}
            />
        ) : null;

        const followViewReverse = this.state.loadedFollowReverse
            ? (
            <FollowList
                style={followViewReverseStyle}
                navigator={this.props.navigator}
                onLoadDate={(page, pageSize) => {
                    return Api.getRelationReverseUsers(page, pageSize);
                }}
                onDeletePress={(user) => Api.deleteFollowBy(user.id)}
            />
        ) : null;

        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <NavigationBar
                    title1="我关注的人"
                    title={(
                        <SegmentedControlIOS
                            style={{width: 220}}
                            selectedIndex={this.state.selectedIndex}
                            values={['我关注的人', '关注我的人']}
                            onValueChange={(v) => {
                                this.setState({
                                    selectedIndex: v == '我关注的人' ? 0 : 1,
                                    loadedFollow: this.state.loadedFollow || v == '我关注的人',
                                    loadedFollowReverse: this.state.loadedFollowReverse || v == '关注我的人',
                                })
                            }}
                        />
                    )}
                    backPress={() => this.props.navigator.pop() }
                />
                {followView}
                {followViewReverse}
            </View>
        )
    }


}

class FollowList extends Component {

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            users: [],
            usersDateSource: ds,
            page: 1,
            page_size: 20,
            more: false,
            loading_more: false,
            refreshing: false,
            emptyList: false,
            errorPage: false,
            loadMoreError: false,
        };
    }

    componentWillMount(){
        InteractionManager.runAfterInteractions(() => {
            this._loadUsers(this.state.page);
        });
    }

    _onRefresh() {
        this._loadUsers(1);
    }

    async _loadUsers(page) {
        if (page === 1 && this.state.refreshing === false) {
            this.setState({refreshing: true});
        }
        if (page > 1) {
            this.setState({ loading_more: true });
        }

        let data;
        try {
            data = await this.props.onLoadDate(page, this.state.page_size)
        } catch (err) {
            //Alert.alert('加载失败', err.message);
        }

        //console.log(data);

        if (data) {
            let users;
            if (page == 1) {
                users = data.users;
            } else {
                users = this.state.users.concat(data.users);
            }
            const ids = users.map(it => it.id);

            this.setState({
                users: users,
                usersDateSource: this.state.usersDateSource.cloneWithRows(this.arrayToMap(users, it => it.id), ids),
                page: page,
                page_size: this.state.page_size,
                more: data.users.length == this.state.page_size,
                loading_more: false,
                refreshing: false,
                emptyList: false,
                errorPage: false,
                loadMoreError: false,
            });
        }else {
            if (page == 1) {
                const users = [];
                const ids = [];
                this.setState({
                    users: users,
                    usersDateSource: this.state.usersDateSource.cloneWithRows(this.arrayToMap(users, it => it.id), ids),
                    page: 1,
                    more: false,
                    refreshing: false,
                    loading_more: false,
                    emptyList: false,
                    errorPage: true,
                    loadMoreError: false,
                });
            } else {
                this.setState({
                    refreshing: false,
                    loading_more: false,
                    loadMoreError: true,
                });
            }
        }
    }

    arrayToMap(array, keyGet) {
        let ret = {};
        array.forEach(it => ret[keyGet(it)] = it);
        return ret;
    }

    _onEndReached(ignoreError = false) {
        if(this.state.refreshing || this.state.loading_more || !this.state.more) {
            return;
        }
        if (!ignoreError && this.state.loadMoreError) {
            return;
        }
        this._loadUsers(this.state.page + 1)
    }

    _onUserPress(user) {
        this.props.navigator.push({
            name: 'UserPage',
            component: UserPage,
            params: {
                user: user
            }
        })
    }

    _onDeletePress(user) {
        const users = this.state.users.filter((it) => it.id != user.id);
        const ids = users.map(it => it.id);
        this.setState({
            users: users,
            usersDateSource: this.state.usersDateSource.cloneWithRows(this.arrayToMap(users, it => it.id), ids),
        });
        this.props.onDeletePress(user);
    }

    render() {
        return (
            <SwipeListView
                ref="list"
                dataSource={this.state.usersDateSource}
                renderRow={this.renderUser.bind(this)}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        colors={[TPColors.refreshColor]}
                        tintColor={TPColors.refreshColor} />
                }
                onEndReached={this._onEndReached.bind(this)}
                onEndReachedThreshold={50}
                renderFooter={this.renderFooter.bind(this)}
                enableEmptySections={true}
                automaticallyAdjustContentInsets={false}
                style={this.props.style}
                rightOpenValue={-60}
                disableRightSwipe={true}
                renderHiddenRow={this.renderAction.bind(this)}
            />
        )
    }

    renderUser(user) {
        return (
            <TPTouchable
                onPress={() => this._onUserPress(user)}
                underlayColor="#efefef"
                key={user.id}
            >
                <View style={{flexDirection: 'row', padding: 15, paddingHorizontal: 25, borderBottomWidth: 1, borderColor: TPColors.cellBorder, alignItems: 'center', backgroundColor: 'white'}}>
                    <Image source={{uri: user.iconUrl}} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 15 }} />
                    <Text>{user.name}</Text>
                </View>
            </TPTouchable>
        );
    }

    renderAction(user) {
        return (
            <TouchableOpacity style={{flex: 1, flexDirection:'row',backgroundColor:'#f9f9f9', justifyContent: 'flex-end'}}
                              onPress={this._onDeletePress.bind(this, user)}>
                <View style={{width: 60, backgroundColor: '#d9534f', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: 'white'}}>删除</Text>
                </View>
            </TouchableOpacity>
        )
    }

    renderFooter() {
        //todo:按照日记列表更改
        if (this.state.errorPage) {
            return <ErrorView text="加载失败了 :(" />
        }

        if (this.state.emptyList) {
            return (<ErrorView text="还没有关注任何人" />)
        }

        if(!this.state.loading_more && this.state.loadMoreError) {
            return (
                <View style={{ height: 60, justifyContent: "center", alignItems: "center", paddingBottom: 15}}>
                    <TouchableOpacity style={{marginTop: 15}} onPress={this._onEndReached.bind(this, true)}>
                        <Text style={{color: TPColors.light}}>加载失败,请重试</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (this.state.refreshing || this.state.users.length == 0) {
            return null;
        }

        if (this.state.more) {
            return (
                <View style={{ height: 60, justifyContent: "center", alignItems: "center"}}>
                    <ActivityIndicator animating={true} color={TPColors.light} size="small" />
                </View>
            )
        } else {
            return (
                <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                    <Text style={{color: TPColors.inactiveText, fontSize: 12}}>——  THE END  ——</Text>
                </View>
            )
        }
    }
}