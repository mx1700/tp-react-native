import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    View,
    Platform,
    ListView,
    InteractionManager,
    RefreshControl,
    Text,
    Image,
    ActivityIndicator,
    TouchableOpacity
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
            data = await Api.getRelationUsers(page, this.state.page_size)
        } catch (err) {
            console.log(err);
        }

        console.log(data);

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
                page_size: 20,
                more: data.users.length == 20,
                loading_more: false,
                refreshing: false,
                emptyList: false,
                errorPage: false,
                loadMoreError: false,
            });
        }
    }

    arrayToMap(array, keyGet) {
        let ret = {};
        array.forEach(it => ret[keyGet(it)] = it);
        return ret;
    }

    _onEndReached() {
        if(this.state.refreshing || this.state.loading_more || !this.state.more) {
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

    _deleteUser(user) {
        const users = this.state.users.filter((it) => it.id != user.id);
        const ids = users.map(it => it.id);
        this.setState({
            users: users,
            usersDateSource: this.state.usersDateSource.cloneWithRows(this.arrayToMap(users, it => it.id), ids),
        });
        Api.deleteFollow(user.id)
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <NavigationBar
                    title="我关注的人"
                    backPress={() => this.props.navigator.pop() }
                />
                <SwipeListView
                    ref="list"
                    dataSource={this.state.usersDateSource}
                    renderRow={this.renderUser.bind(this)}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                            colors={[TPColors.light]}
                            tintColor={TPColors.light} />
                    }
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={50}
                    renderFooter={this.renderFooter.bind(this)}
                    enableEmptySections={true}
                    automaticallyAdjustContentInsets={false}
                    style={this.props.style}
                    rightOpenValue={-75}
                    renderHiddenRow={this.renderAction.bind(this)}
                />
            </View>
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
                    <Image source={{uri: user.iconUrl}} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 25 }} />
                    <Text>{user.name}</Text>
                </View>
            </TPTouchable>
        );
    }

    renderAction(user) {
        return (
            <TouchableOpacity style={{flex: 1, flexDirection:'row',backgroundColor:'#f9f9f9', justifyContent: 'flex-end'}} onPress={() => this._deleteUser(user)}>
                <View style={{width: 75, backgroundColor: '#d9534f', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: 'white'}}>删除</Text>
                </View>
            </TouchableOpacity>
        )
    }

    renderFooter() {
        if (this.state.errorPage) {
            return <ErrorView text="加载失败了 :(" />
        }

        if (this.state.emptyList) {
            return (<ErrorView text="还没有关注任何人" />)
        }

        if(!this.state.loading_more && this.state.loadMoreError) {
            return (
                <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                    <TouchableOpacity style={{marginTop: 15}} onPress={this._onEndReached.bind(this)}>
                        <Text style={{color: TPColors.light}}>加载失败,请重试</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (this.state.refreshing || this.state.users.length == 0) {
            return null;
        }
        var content = this.state.more ?
            (<ActivityIndicator animating={true} color={TPColors.light} size="small" />) :
            (<Text style={{color: TPColors.inactiveText, fontSize: 12}}>——  THE END  ——</Text>);

        return (
            <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                {content}
            </View>
        );
    }
}