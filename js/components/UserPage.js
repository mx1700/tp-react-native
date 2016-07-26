import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ToolbarAndroid,
  Platform,
  ListView,
  TouchableHighlight,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import * as Api from 'Api'
import Diary from './Diary'
import DiaryPage from './DiaryPage'
import LoginPage from './LoginPage'
import DiaryList from './DiaryList'

export default class UserPage extends Component {

  constructor(props) {
    super(props);
  }

  _loadTodayDiaries(page, page_size) {
    return this.loadDiary(page, page_size);
  }

  async loadDiary(page, page_size) {
    console.log(this.props)
    const data = await Api.getUserTodayDiaries(this.props.user.id, page, page_size);
    console.log(data);
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

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={[styles.toolbarContainer, this.props.style]}>
          <ToolbarAndroid
            navIcon={require('./img/back_white.png')}
            onActionSelected={this._onActionSelected}
            onIconClicked={() => this.setState({actionText: 'Icon clicked'})}
            style={styles.toolbar}
            title="首页"
            titleColor="white">
            <Text></Text>
          </ToolbarAndroid>
        </View>
        <DiaryList 
          navigator={this.props.navigator} 
          getDiarirsPage={this._loadTodayDiaries.bind(this)} 
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
