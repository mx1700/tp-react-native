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
import WritePage from './WritePage'
import NotificationCenter from '../common/NotificationCenter'

var PureRenderMixin = require('react-addons-pure-render-mixin');

export default class TopicPage extends Component {

    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    }

    componentDidMount() {
        NotificationCenter.addLister('onWriteTopicDiary', this._onWriteDiary);
        //NotificationCenter.addLister('onDeleteDiary', this._onWriteDiary);    //TODO:更新后列表为空，所以暂时不实现
    }

    componentWillUnmount() {
        NotificationCenter.removeLister('onWriteTopicDiary', this._onWriteDiary);
        //NotificationCenter.removeLister('onDeleteDiary', this._onWriteDiary);
    }

    _onWriteDiary = () => {
        this.refs.list.refresh();
    };

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

    _toWritePage() {
        this.props.navigator.push({
            name: 'WritePage',
            component: WritePage,
            params: {
                topic: this.props.topic
            }
        })
    }

    render() {
        const rightButton = <NavigationBar.Icon name="ios-create-outline" onPress={this._toWritePage.bind(this)} />;
        const title = "话题 · " + this.props.topic.title;
        return (
            <View style={{flex: 1, backgroundColor: "white"}}>
                <NavigationBar
                    title={title}
                    backPress={() => {
                        this.props.navigator.pop()
                    }}
                    rightButton={rightButton}
                />
                <DiaryList
                    ref="list"
                    style={{}}
                    navigator={this.props.navigator}
                    getDiariesPage={this._loadTodayDiaries.bind(this)}
                    onDiaryPress={this._toDiaryPage.bind(this)}
                    //renderHeader={this.renderHeader.bind(this)}
                />
            </View>
        )
    }

    renderHeader() {
        const topic = this.props.topic;
        //TODO:高度按照设备宽度计算，固定 16：9 或者 2：1
        return (
            <View>
                <Image key={topic.id} source={{uri: topic.imageUrl}} style={{flexGrow:1, height: 160}}>
                    <Text style={{fontSize: 26, padding: 15, color: '#444', backgroundColor: "transparent", textShadowColor: '#fff', textShadowOffset: {width: 1.8, height: 1}, textShadowRadius: 1.5}}>{topic.title}</Text>
                    <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
                        <View style={{backgroundColor: 'white', position: 'absolute', flex: 1, top: 0, bottom: 0, left: 0, right: 0, opacity: 0.35}} />
                        <Text style={{flex: 1, color: '#111', backgroundColor: "transparent", padding: 15, paddingVertical: 5, paddingBottom: 7,lineHeight: 17,}}>{topic.intro}</Text>
                    </View>
                </Image>
            </View>
        );
    }
}