import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Platform,
  Text,
  Image
} from 'react-native';
import * as Api from 'Api'
import DiaryList from './DiaryList'
import NavigationBar from 'NavigationBar'
import DiaryPage from './DiaryPage'
var PureRenderMixin = require('react-addons-pure-render-mixin');


export default class HomeDiaryList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      topic: null,
    };
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  _loadTodayDiaries(page, page_size) {
    return this.loadDiary(page, page_size);
  }

  async loadDiary(page, page_size) {
    const data = await Api.getTodayDiaries(page, page_size);
    const topic = await Api.getTodayTopic();
    this.setState({
      topic: topic,
    });
    console.log(topic);
    return {
      diaries: data.diaries,
      page: data.page,
      more: data.diaries.length === page_size
    }
  }

  refresh() {
    this.refs.list.refresh();
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
      <View style={{flex: 1, marginBottom: 49}}>
        <NavigationBar title="胶囊日记" />
        <DiaryList
            ref="list"
          navigator={this.props.navigator}
          getDiariesPage={this._loadTodayDiaries.bind(this)}
          onDiaryPress={this._toDiaryPage.bind(this)}
            renderHeader={this.renderHeader.bind(this)}
        />
      </View>
    )
  }

  renderHeader() {
    if (!this.state.topic) return null;
    const topic = this.state.topic;
    //TODO:高度按照设备宽度计算，固定 16：9
    //topic.intro = '有没有正义？';
    //topic.imageUrl = 'https://devimages.apple.com.edgekey.net/home/images/tile-wwdc_small_2x.jpg';
    return (
        <View>
          <Image key={topic.id} source={{uri: topic.imageUrl}} style={{flex:1, height: 160}}>
            <Text style={{fontSize: 26, padding: 15, color: '#444', textShadowColor: '#fff', textShadowOffset: {width: 1.8, height: 1}, textShadowRadius: 1.5}}>{topic.title}</Text>
            <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
              <View style={{backgroundColor: 'white', position: 'absolute', flex: 1, top: 0, bottom: 0, left: 0, right: 0, opacity: 0.35}}></View>
              <Text style={{flex: 1, color: '#111', padding: 15, paddingVertical: 5, paddingBottom: 7,lineHeight: 17,}}>{topic.intro}</Text>
            </View>
          </Image>
        </View>
    );
  }
}
