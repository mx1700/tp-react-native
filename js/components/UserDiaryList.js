import React, {Component} from 'react';
import {
    StyleSheet,
    ToolbarAndroid,
    Platform,
    ActivityIndicator,
} from 'react-native';
import * as Api from '../Api'
import DiaryPage from './DiaryPage'
import DiaryList from './DiaryList'


export default class UserDiaryList extends Component {

    refresh() {
        this.refs.list.refresh()
    }

    _loadTodayDiaries(page, page_size) {
        return this.loadDiary(page, page_size);
    }

    async loadDiary(page, page_size) {
        let userId = this.props.userId;
        if (this.props.myself) {
            let user = await Api.getSelfInfoByStore();
            userId = user.id;
        }

        const data = await Api.getUserTodayDiaries(userId, page, page_size);
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
                diary: diary,
            }
        })
    }

    render() {
        return (
            <DiaryList ref="list"
               style={this.props.style}
               navigator={this.props.navigator}
               deletable={this.props.myself}
               editable={this.props.myself}
               myself={this.props.myself}
               getDiariesPage={this._loadTodayDiaries.bind(this)}
               onDiaryPress={this._toDiaryPage.bind(this)}
                       removeClippedSubviews={false}
            />
        );
    }
}


