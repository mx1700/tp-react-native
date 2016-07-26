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
import UserPage from './UserPage'

export default class DiaryList extends Component {

  constructor(props) {
    super(props);
    /**
     * props:
     * getDiarirsPage(page)
     */

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      diaries: [],
      diariesDateSource: ds,
      page: 1,
      page_size: 20,
      more: false,
      loading_more: false,
      refreshing: true,
    };
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
    try {
          console.log('_loadTodayDiaries', this.state)
      const page_size = this.state.page_size;
      var data = await this.props.getDiarirsPage(page, page_size);
    } catch(e) {
      console.log(e)
      if(e.response.status == 401) {
        //TODO:登录
        this.props.navigator.push({
          name: 'LoginPage',
          component: LoginPage,
          params: {
            onLogin: () => {
              this._loadTodayDiaries(1);
            }
          }
        });
      } else {
        console.log(e.response);
        //TODO:提示出错
      }
    }
    if (data) {
      var diaries = page === 1 ? data.diaries : this.state.diaries.concat(data.diaries);
      this.setState({
        diaries: diaries,
        diariesDateSource: this.state.diariesDateSource.cloneWithRows(diaries),
        page: data.page,
        more: data.more,
        refreshing: false,
        loading_more: false,
      });
    } else {
      this.setState({
          refreshing: false,
          loading_more: false,
      });
      //TODO:提示加载失败，如果列表没内容，显示出错页面，有刷新按钮
    }
  }

  _onDiaryPress(diary) {
    this.props.onDiaryPress && this.props.onDiaryPress(diary)
  }
  _onIconPress(diary) {
    this.props.navigator.push({
      name: 'UserPage',
      component: UserPage,
      params: {
        user: diary.user
      }
    })
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
      <ListView
        dataSource={this.state.diariesDateSource}
        renderRow={(rowData) => 
          <Diary data={rowData} 
            onPress={this._onDiaryPress.bind(this)} 
            onIconPress={this._onIconPress.bind(this)}
            navigator={this.props.navigator} />
        }
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}/>
        }
        onEndReached={this._onEndReached.bind(this)}
        onEndReachedThreshold={200}
        renderFooter={this.renderFooter.bind(this)}
        renderHeader={() => <View style={{height: 4}}></View>}
      />
    );
  }

  renderFooter() {
    if (this.state.refreshing || this.state.diaries.length == 0) {
      return null;
    }
    var content = this.state.more ?
                    (<ActivityIndicator animating={true} color="#39E" size="large" />) :
                    (<Text>End</Text>);

    return (
      <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
        {content}
      </View>
    );
  }
}
