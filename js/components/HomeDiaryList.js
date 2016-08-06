import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import * as Api from 'Api'
import TPColors from 'TPColors'
import DiaryList from './DiaryList'
import NavigationBar from 'NavigationBar'
import DiaryPage from './DiaryPage'

export default class HomeDiaryList extends Component {

  _loadTodayDiaries(page, page_size) {
    return this.loadDiary(page, page_size);
  }

  async loadDiary(page, page_size) {
    const data = await Api.getTodayDiaries(page, page_size);
    return {
      diaries: data.diaries,
      page: data.page,
      more: data.diaries.length === page_size
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
      <View style={{flex: 1, backgroundColor: 'white', marginBottom: 48}}>
        <NavigationBar title="胶囊日记" />
        <DiaryList
        style={{}}
          navigator={this.props.navigator}
          getDiariesPage={this._loadTodayDiaries.bind(this)}
          onDiaryPress={this._toDiaryPage.bind(this)}/>
      </View>
    )
  }
}
