import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    View,
    Platform,
    Image, Text
} from 'react-native';
import * as Api from 'Api'
import DiaryList from './DiaryList'
import NavigationBar from 'NavigationBar'
import DiaryPage from './DiaryPage'
import FollowUsersPage from './FollowUsersPage'
var PureRenderMixin = require('react-addons-pure-render-mixin');

export default class TopicPage extends Component {

    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    }

    _loadTodayDiaries(page, page_size) {
        return this.loadDiary(page, page_size);
    }

    async loadDiary(page, page_size) {
        const data = await Api.getTodayTopicDiaries(page, page_size);
        return {
            diaries: data.diaries,
            page: data.page,
            more: data.diaries.length === page_size,
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
            <View style={{flex: 1}}>
                <NavigationBar
                    title="今日话题"
                    backPress={() => {
                        this.props.navigator.pop()
                    }}
                />
                <DiaryList
                    ref="list"
                    style={{}}
                    navigator={this.props.navigator}
                    getDiariesPage={this._loadTodayDiaries.bind(this)}
                    onDiaryPress={this._toDiaryPage.bind(this)}
                    renderHeader={this.renderHeader.bind(this)}
                />
            </View>
        )
    }

    renderHeader() {
        const topic = this.props.topic;
        //TODO:高度按照设备宽度计算，固定 16：9
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