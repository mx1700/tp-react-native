import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ToolbarAndroid,
  Platform,
  RefreshControl,
  ActivityIndicator,
    TouchableOpacity,
Text,
} from 'react-native';
import Page from './Page'
import * as Api from '../Api'
import DiaryPage from './DiaryPage'
import DiaryList from './DiaryList'
import SettingPage from './SettingPage'
import NavigationBar from 'NavigationBar'
import NotificationCenter from '../common/NotificationCenter'
import Icon from 'react-native-vector-icons/Ionicons';
import TPColors from '../common/TPColors'

export default class UserPage extends Page {

  constructor(props) {
    super(props);
    if (this.props.myself) {
      this._onWriteDiary = this._onWriteDiary.bind(this);
    }

    this.state = {
        followed: false
    }
  }

  componentDidMount() {
    if (this.props.myself) {
      NotificationCenter. addLister('onWriteDiary', this._onWriteDiary)
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
      } catch(err) {
          console.log(err); //TODO:友好提示
          this.setState({
              followed: rel
          })
      }
  }

  _loadTodayDiaries(page, page_size) {
    return this.loadDiary(page, page_size);
  }

  async loadDiary(page, page_size) {
    let user = null;
    if (this.props.myself) {
      user = await Api.getSelfInfoByStore();
    } else if (this.props.user != null) {
      user = this.props.user;
    } else if (this.props.user_id != null) {
        user = await Api.getUserInfo(id)
    }
    const data = await Api.getUserTodayDiaries(user.id, page, page_size);
    //console.log(data);
    return {
      diaries: data,
      page: 1,
      more: false
    }
  }

  _toDiaryPage(diary) {
    this.props.navigator.push({
      name: 'DiaryPage',
      component: DiaryPage,
      params: {
        diary: diary
      }
    })
  }

  _toSettingPage() {
    this.props.navigator.push({
      name: 'SettingPage',
      component: SettingPage
    })
  }

  _followPress() {
      this.updateRelation()
  }

  render() {
    const name = this.props.myself ? '我' : this.props.user.name;
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
                  handler: () => { this.props.navigator.pop() }
              }
          };
          if (this.state.followed !== null) {
              const icon = this.state.followed
                  ? <Icon name="ios-heart" size={24} color='#d9534f' />
                  : <Icon name="ios-heart-outline" size={24} color='#0076FF' />;

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

      //我的页面在 tab 上,需要空出 tab 的高度
      const style = this.props.myself
          ? {flex: 1, backgroundColor: 'white', marginBottom: 49}
          : {flex: 1, backgroundColor: 'white'};
    return (

      <View style={style}>
        <NavigationBar
          title={name + "的日记"}
          {...navAttrs}
          />
          <DiaryList ref="list"
            navigator={this.props.navigator}
                     deletable={this.props.myself}
                     editable={this.props.myself}
                     myself={this.props.myself}
            getDiariesPage={this._loadTodayDiaries.bind(this)}
            onDiaryPress={this._toDiaryPage.bind(this)}/>
      </View>
    );
  }
}

//var STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 25;
//var HEADER_HEIGHT = Platform.OS === 'ios' ? 44 + STATUS_BAR_HEIGHT : 56 + STATUS_BAR_HEIGHT;
var STATUS_BAR_HEIGHT = 20;
var HEADER_HEIGHT = 56;

const styles = StyleSheet.create({
  toolbar: {
    height: HEADER_HEIGHT,
  },
  toolbarContainer: {
    backgroundColor: '#39E',
    paddingTop: STATUS_BAR_HEIGHT,
    elevation: 2,
    borderRightWidth: 1,
    marginRight: -1,
    borderRightColor: 'transparent',
  },
});
