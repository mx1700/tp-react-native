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
  TabBarIOS,
} from 'react-native';
import * as Api from 'Api'
import TPColors from 'TPColors'
import DiaryPage from './DiaryPage'
import DiaryList from './DiaryList'
import NavigationBar from 'NavigationBar'
import Icon from 'react-native-vector-icons/FontAwesome';


export default class HomePage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){
    //this._loadTodayDiaries(this.state.page);
  }

  _loadTodayDiaries(page, page_size) {
    return this.loadDiary(page, page_size);
  }

  async loadDiary(page, page_size) {
    const data = await Api.getTodayDiaries(page, page_size);
    console.log(data);
    return {
      diaries: data.diaries,
      page: data.page,
      //more: data.diaries.length === page_size
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
    const titleConfig = {
      title: '胶囊日记',
    };
    //<NavigationBar title="胶囊日记" style={{backgroundColor: 'red'}} />
    // <DiaryList
    //   navigator={this.props.navigator}
    //   getDiarirsPage={this._loadTodayDiaries.bind(this)}
    //   onDiaryPress={this._toDiaryPage.bind(this)}/>
    return (
      <TabBarIOS
        translucent={false}
      >
        <Icon.TabBarItemIOS
          title="首页"
          iconName="comments"
          selected={true}
          onPress={() => {
            this.setState({
              selectedTab: 'blueTab',
            });
          }}>
          <View style={{flex: 1, backgroundColor: 'white', marginBottom: 48}}>
            <NavigationBar title="胶囊日记" style={{backgroundColor: 'red'}} />
            <DiaryList
              navigator={this.props.navigator}
              getDiarirsPage={this._loadTodayDiaries.bind(this)}
              onDiaryPress={this._toDiaryPage.bind(this)}/>
          </View>
        </Icon.TabBarItemIOS>
      </TabBarIOS>
    );
  }
}
