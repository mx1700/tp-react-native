import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    SegmentedControlIOS,
} from 'react-native';
import * as Api from '../Api'
import UserDiaryList from './UserDiaryList'
import NotebookList from './NotebookList'
import NotebookAddPage from './NotebookAddPage'
import UserIntro from './UserIntro';
import SettingPage from './SettingPage'
import NavigationBar from 'NavigationBar'
import NotificationCenter from '../common/NotificationCenter'
import Icon from 'react-native-vector-icons/Ionicons';

export default class UserPage extends Component {

    static propTypes = {
        selectedIndex: React.PropTypes.number,
    };

    static defaultProps = {
        selectedIndex: 0,
    };

    constructor(props) {
        super(props);
        if (this.props.myself) {
            this._onWriteDiary = this._onWriteDiary.bind(this);
        }

        let loaded = [false, false, false];
        loaded[this.props.selectedIndex] = true;
        this.state = {
            followed: false,
            selectedIndex: this.props.selectedIndex,
            loaded: loaded
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
        this.setState({
            selectedIndex: 1,
        });
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

    _toNotebookAddPage() {
        this.props.navigator.push({
            name: 'NotebookAddPage',
            component: NotebookAddPage
        })
    }

    _onValueChange(v) {
        let index;
        switch (v) {
            case '简介':
                index = 0;
                break;
            case '日记':
                index = 1;
                break;
            case '日记本':
                index = 2;
                break;
        }
        let loaded = this.state.loaded;
        loaded[index] = true;
        this.setState({selectedIndex: index, loaded: loaded});
    }

    render() {
        const name = this.props.myself ? '我的' : this.props.user.name;
        let navAttrs;
        if (this.props.myself) {
            if(this.state.selectedIndex != 2) {
                navAttrs = {
                    rightButton: <NavigationBar.Icon name="ios-cog" onPress={this._toSettingPage.bind(this)} />,
                };
            } else {
                navAttrs = {
                    rightButton: <NavigationBar.Icon name="md-add" onPress={this._toNotebookAddPage.bind(this)} />,
                }
            }
        } else {
            navAttrs = {
                backPress: () => {
                    this.props.navigator.pop()
                }
            };
            if (this.state.followed !== null) {
                navAttrs.rightButton = this.state.followed
                    ? <NavigationBar.Icon name="ios-heart" color="#d9534f" onPress={this._followPress.bind(this)}/>
                    : <NavigationBar.Icon name="ios-heart-outline" onPress={this._followPress.bind(this)}/>;
            }
        }

        const userStyle = this.state.selectedIndex == 0 ? null : {height: 0, flex: null};
        const diaryStyle = this.state.selectedIndex == 1 ? null : {height: 0, flex: null};
        const bookStyle = this.state.selectedIndex == 2 ? null : {height: 0, flex: null, paddingTop: 0};

        const user = this.state.loaded[0]
            ? (
            <UserIntro
                style={userStyle}
                user={this.props.user}
                userId={this.getId()}
                mySelf={this.props.myself}
            />
            ) : null;

        const diaries = this.state.loaded[1]
            ? (
            <UserDiaryList
                ref="list"
                style={diaryStyle}
                userId={this.getId()}
                myself={this.props.myself}
                navigator={this.props.navigator}/>
        ) : null;

        const books = this.state.loaded[2]
            ? (
            <NotebookList
                ref="bookView"
                style={bookStyle}
                userId={this.getId()}
                mySelf={this.props.myself}
                navigator={this.props.navigator}/>
            ) : null;

        //我的页面在 tab 上,需要空出 tab 的高度
        const style = this.props.myself
            ? {flex: 1, backgroundColor: 'white', marginBottom: 49}
            : {flex: 1, backgroundColor: 'white'};
        return (
            <View style={style}>
                <NavigationBar
                    title={(
                        <SegmentedControlIOS
                            style={{width: 220}}
                            selectedIndex={this.state.selectedIndex}
                            values={['简介', '日记', '日记本']}
                            onValueChange={(v) => this._onValueChange(v)}
                        />
                    )}
                    {...navAttrs}
                />
                {user}
                {books}
                {diaries}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    tabBar: {
        borderColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingVertical: 8,
        paddingHorizontal: 50,
        paddingTop: 0,
        backgroundColor: 'white'
    }
});