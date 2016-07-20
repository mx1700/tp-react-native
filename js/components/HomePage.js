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
  TouchableHighlight,RefreshControl, 
  ActivityIndicator
} from 'react-native';
import * as Api from '../Api'
import Diary from './Diary'

var moment = require('moment');

export default class HomePage extends Component {

    constructor() {
        super();
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = ({
            diaries: [],
            diariesDateSource: ds,
            page: 1,
            page_size: 20,
            count: 0,
            more: false,
            loading_more: false,
            refreshing: true,
            title: "首页"
        });
    }

    componentDidMount(){
        this._loadTodayDiaries(this.state.page);
    }

    async _loadTodayDiaries(page) {
        if (page === 1 && this.state.refreshing === false) {
	        this.setState({refreshing: true});
        }
        if (page > 1) {
            this.setState({ loading_more: true });
        }
        var data = await Api.getTodayDiaries(page, this.state.page_size);
        console.log(data);
        var diaries = page === 1 ? data.diaries : this.state.diaries.concat(data.diaries);
        this.setState({
            diaries: diaries,
            diariesDateSource: this.state.diariesDateSource.cloneWithRows(diaries),
            page: data.page,
            count: data.count,
            more: data.page_size == data.diaries.length,
            refreshing: false,
            loading_more: false,
        });
    }

    _onRefresh() {
        this._loadTodayDiaries(1);
    }

    _onEndReached() {
        if(this.state.refreshing || this.state.loading_more || !this.state.more) {
            return;
        }
        this._loadTodayDiaries(this.state.page + 1);
    }
    
    render() {
        return (
            <View style={{flex: 1}}>
                <View style={[styles.toolbarContainer, this.props.style]}>
                    <ToolbarAndroid
                        navIcon={require('./img/back_white.png')}
                        onActionSelected={this._onActionSelected}
                        onIconClicked={() => this.setState({actionText: 'Icon clicked'})}
                        style={styles.toolbar}
                        title={this.state.title}
                        titleColor="white">
                        <Text>Hello</Text>
                    </ToolbarAndroid>
                </View>
                <ListView
                    dataSource={this.state.diariesDateSource}
                    renderRow={(rowData) => <Diary diary={rowData} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind(this)}/>
                    }
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={150}
                    renderFooter={this.renderFooter.bind(this)}
                    renderHeader={() => <View style={{height: 4}}></View>}
                />
            </View>
        );
    }

    renderFooter() {
        if (this.state.refreshing) {
            return null;
        }
        if (this.state.more) {
            return (
                <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                    <ActivityIndicator
                        animating={true}
                        color="#39E"
                        size="large"
                    />
                </View>
            );
        } else {
            return (
                <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                    <Text>End</Text>
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