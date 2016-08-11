import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    SegmentedControlIOS,
    Text,
} from 'react-native';
import * as Api from '../Api'
import UserDiaryList from './UserDiaryList'
import NotebookList from './NotebookList'
import SettingPage from './SettingPage'
import NavigationBar from 'NavigationBar'
import NotificationCenter from '../common/NotificationCenter'
import Icon from 'react-native-vector-icons/Ionicons';

export default class UserPage extends Component {

    constructor(props) {
        super(props);
        if (this.props.myself) {
            this._onWriteDiary = this._onWriteDiary.bind(this);
        }

        this.state = {
            followed: false,
            selectedIndex: 0,
        }
    }

    componentDidMount() {
        if (this.props.myself) {
            NotificationCenter.addLister('onWriteDiary', this._onWriteDiary)
        }
        this._loadRelation();
    }

    componentWillUnmount() {
        if (this.props.myself) {
            NotificationCenter.removeLister('onWriteDiary', this._onWriteDiary)
        }
    }

    _onWriteDiary() {
        this.refs.list.refresh();
    }

    getId() {
        return this.props.user != null ? this.props.user.id : this.props.user_id;
    }

    async _loadRelation() {
        if (this.props.myself) return;
        const uid = this.getId();
        try {
            const rel = await Api.getRelation(uid);
            this.setState({
                followed: rel != null && rel != ''
            });
        } catch (err) {
            console.log(err);     //TODO:错误处理
        }
    }

    _followPress() {
        this.updateRelation()
    }

    async updateRelation() {
        const rel = this.state.followed;
        try {
            this.setState({
                followed: !rel
            });
            if (rel) {
                await Api.deleteFollow(this.getId())
            } else {
                await Api.addFollow(this.getId())
            }
        } catch (err) {
            console.log(err); //TODO:友好提示
            this.setState({
                followed: rel
            })
        }
    }


    _toSettingPage() {
        this.props.navigator.push({
            name: 'SettingPage',
            component: SettingPage
        })
    }

    _onValueChange(v) {
        const index = v == '今天的日记' ? 0 : 1;
        this.setState({selectedIndex: index})
        if (index == 1) {
            this.refs.bookView.init();
        }
    }

    render() {
        const name = this.props.myself ? '我的' : this.props.user.name;
        let navAttrs;
        if (this.props.myself) {
            navAttrs = {
                rightButton: {
                    title: "设置",
                    handler: this._toSettingPage.bind(this)
                }
            };
        } else {
            navAttrs = {
                leftButton: {
                    title: "后退",
                    handler: () => {
                        this.props.navigator.pop()
                    }
                }
            };
            if (this.state.followed !== null) {
                const icon = this.state.followed
                    ? <Icon name="ios-heart" size={24} color='#d9534f'/>
                    : <Icon name="ios-heart-outline" size={24} color='#0076FF'/>;

                navAttrs.rightButton = (
                    <TouchableOpacity
                        onPress={this._followPress.bind(this)}
                        style={{flex: 1, padding: 10}}
                    >
                        {icon}
                    </TouchableOpacity>
                )
            }
        }


        const diaryStyle = this.state.selectedIndex == 0 ? null : { height: 0,flex: null };
        const bookStyle = this.state.selectedIndex == 1 ? null :  { height: 0,flex: null,paddingTop: 0 };

        //我的页面在 tab 上,需要空出 tab 的高度
        const style = this.props.myself
            ? {flex: 1, backgroundColor: 'white', marginBottom: 49}
            : {flex: 1, backgroundColor: 'white'};
        return (

            <View style={style}>
                <NavigationBar
                    title={name}
                    noBorder={true}
                    {...navAttrs}
                />
                <View style={styles.tabBar}>
                    <SegmentedControlIOS
                        selectedIndex={this.state.selectedIndex}
                        values={['今天的日记', '日记本']}
                        onValueChange={(v) => this._onValueChange(v)}
                    />
                </View>
                <NotebookList
                    ref="bookView"
                    style={bookStyle}
                    userId={this.getId()}
                    mySelf={this.props.myself}
                    navigator={this.props.navigator} />

                <UserDiaryList
                    ref="list"
                    style={diaryStyle}
                    userId={this.getId()}
                    myself={this.props.myself}
                    navigator={this.props.navigator}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    tabBar: {
        borderColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingVertical: 8,
        paddingHorizontal: 8,
        paddingTop: 0,
    }
});