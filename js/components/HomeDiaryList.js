import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Platform,
  Text,
  Image,
    TouchableOpacity,
} from 'react-native';
import * as Api from 'Api'
import DiaryList from './DiaryList'
import NavigationBar from 'NavigationBar'
import DiaryPage from './DiaryPage'
import TopicPage from './TopicPage'
var PureRenderMixin = require('react-addons-pure-render-mixin');


export default class HomeDiaryList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      topic: null,
    };
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)

    this.first_id = '';
  }

  _loadTodayDiaries(page, page_size) {
    return this.loadDiary(page, page_size);
  }

  async loadDiary(page, page_size) {
    this.loadTopic();
    if (page == 1) {
      this.first_id = ''
    }
    const data = await Api.getTodayDiaries(page, page_size, this.first_id);
    if (page == 1 && data && data.diaries && data.diaries.length > 0) {
      this.first_id = data.diaries[0].id
    }
    return {
      diaries: data.diaries,
      page: data.page,
      more: data.diaries.length === page_size
    }
  }

  async loadTopic() {
    let topic;
    try {
      topic = await Api.getTodayTopic();
    } catch(err) {
      console.log(err);
    }
    this.setState({
      topic: topic,
    });
    //console.log(topic);
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

  _toTopicPage() {
      this.props.navigator.push({
          name: 'TopicPage',
          component: TopicPage,
          params: {
              topic: this.state.topic
          }
      })
  }

  render() {
    //        <NavigationBar title="胶囊日记" />

    return (
      <View style={{flex: 1, marginBottom: 49, marginTop: 20}}>
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
    if (!this.state.topic) return (
        <Text style={{ padding: 15, paddingTop: 25,fontSize: 20}}>最新日记</Text>
    );
    const topic = this.state.topic;
    //TODO:高度按照设备宽度计算，固定 16：9
    //topic.intro = '有没有正义？';
    //topic.imageUrl = 'https://devimages.apple.com.edgekey.net/home/images/t1ile-wwdc_small_2x.jpg';
    return (
        <View>
          <TouchableOpacity onPress={this._toTopicPage.bind(this)}>
            <Text style={{ padding: 15, paddingTop: 20, fontSize: 20, paddingBottom: 25 }}>今日话题：{topic.title}</Text>
            <Image key={topic.id} source={{uri: topic.imageUrl}} style={{flexGrow:1, height: 160, backgroundColor:'#f1f7ff'}}>
              <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
                <View style={{backgroundColor: 'white', position: 'absolute', flex: 1, top: 0, bottom: 0, left: 0, right: 0, opacity: 0.35}}></View>
                <Text style={{flex: 1, color: '#111', padding: 15, paddingVertical: 5, paddingBottom: 7,lineHeight: 17, backgroundColor: 'transparent'}}>{topic.intro}</Text>
              </View>
            </Image>
          </TouchableOpacity>
          <Text style={{ padding: 15, paddingTop: 30,fontSize: 20 }}>最新日记</Text>
        </View>
    );
  }
}
