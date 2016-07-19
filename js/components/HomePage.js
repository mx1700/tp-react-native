import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,ToolbarAndroid,Platform
} from 'react-native';
import * as Api from '../Api'
var moment = require('moment');

export default class HomePage extends Component {

    constructor() {
        super();
        this.loadTodayDiaries();
        this.state = ({
            todayData: null
        });
    }

    async loadTodayDiaries() {
        var data = await Api.getTodayDiaries();
        console.log(data);
        this.setState({
            todayData: data
        });
    }
    
    render() {
        var diary = this.state.todayData && this.state.todayData.diaries[0];
        console.log(diary);
        var content = null;

        return (
            <View>
                <View style={[styles.toolbarContainer, this.props.style]}>
                    <ToolbarAndroid
                        navIcon={require('./img/back_white.png')}
                        onActionSelected={this._onActionSelected}
                        onIconClicked={() => this.setState({actionText: 'Icon clicked'})}
                        style={styles.toolbar}
                        title="首页"
                        titleColor="white">
                        <Text>Hello</Text>
                    </ToolbarAndroid>
                </View>
                {this.renderDiary(diary)}
            </View>
        );
    }

    renderDiary(diary) {
        if (diary) {
            return (
                <View style={{ padding: 18, flexDirection: "row" }}>
                    <Image style={diaryStyles.user_icon} source={{uri: diary.user.iconUrl}} />
                    <View style={{ flexDirection: "column", flex: 1 }}>
                        <View style={{ flexDirection: "row", paddingBottom: 5 }}>
                            <Text style={{ fontWeight: 'bold', color: '#333' }}>{diary.user.name}</Text>
                            <Text>《{diary.notebook_subject}》</Text>
                            <Text>{moment(diary.created).format('H:m')}</Text>
                        </View>
                        <Text style={{ flex: 1, lineHeight: 19, color: '#333' }} numberOfLines={5}>{diary.content}</Text>
                    </View>
                </View>
            );
        } else {
            return (
                <View>
                    <Text>none</Text>
                </View>
            );
        }
        
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

const diaryStyles = StyleSheet.create({
  user_icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  }
});