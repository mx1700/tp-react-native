import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  ToolbarAndroid,
  Platform,
  ListView,
  RefreshControl,
  ActivityIndicator,
  InteractionManager,
    ActionSheetIOS,
    Alert,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import * as Api from '../Api'
import Diary from './Diary'
import TPColors from 'TPColors'
import UserPage from './UserPage'
import WritePage from './WritePage'
import ErrorView from '../common/ErrorListView'
import Toast from 'react-native-root-toast';

export default class DiaryList extends Component {

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      diaries: [],
      diariesDateSource: ds,
      page: 1,
      page_size: 20,
      more: false,
      loading_more: false,
      refreshing: true,
      emptyList: false,
        errorPage: false,
        loadMoreError: false,
    };
  }

  componentDidMount(){
    InteractionManager.runAfterInteractions(() => {
      this._loadTodayDiaries(this.state.page);
    });
  }

  refresh() {
      if (this.state.refreshing) {
          return;
      }
      this.setState({refreshing: true}, () => {
          this.refs.list.scrollTo({x: 0, y: -56, animated: false});
          InteractionManager.runAfterInteractions(() => {
              this._onRefresh();
          });
      });
  }

  async _loadTodayDiaries(page) {
    if (page === 1 && this.state.refreshing === false) {
      this.setState({refreshing: true});
    }
    if (page > 1) {
      this.setState({ loading_more: true });
    }
    let data = null;
    try {
      data = await this.props.getDiariesPage(page, this.state.page_size);
    } catch(e) {
      if(e.code && e.code == 401) {
        this.props.navigator.toLogin();
        return;
      } else {
        //console.log(e.response);
      }
    }
    //console.log(data, page);
    if (data) {
        let diaries;
        if (page == 1) {
            diaries = data.diaries;
            const old = this.state.diaries;
            if (diaries.length > 0 && old.length > 0) {
                if (diaries[0].id == old[0].id) {
                    Toast.show("没有新内容", {
                        duration: 2000,
                        position: -80,
                        shadow: false,
                        hideOnPress: true,
                    });
                }
            }
        } else {
            const last = this.state.diaries[this.state.diaries.length-1];
            const news = data.diaries.filter(d => d.id < last.id);
            diaries = this.state.diaries.concat(news);
            if(news.length == 0) {
                await this._loadTodayDiaries(page + 1);
                return;
            }
        }
      this.setState({
        diaries: diaries,
        diariesDateSource: this.state.diariesDateSource.cloneWithRows(diaries),
        page: data.page,
        more: data.more,
        refreshing: false,
        loading_more: false,
          emptyList: diaries.length == 0,
          errorPage: false,
          loadMoreError: false,
      });
    } else {
        if (page == 1) {
            diaries = [];
            this.setState({
                diaries: diaries,
                diariesDateSource: this.state.diariesDateSource.cloneWithRows(diaries),
                page: 1,
                more: false,
                refreshing: false,
                loading_more: false,
                emptyList: false,
                errorPage: true,
                loadMoreError: false,
            });
        } else {
            this.setState({
                refreshing: false,
                loading_more: false,
                loadMoreError: true,
            });
        }
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

  _onEndReached(ignoreError = false) {
      //console.log(this.state);
      if (this.state.refreshing || this.state.loading_more || !this.state.more) {
          return;
      }
      if (!ignoreError && this.state.loadMoreError) {
          return;
      }
      this._loadTodayDiaries(this.state.page + 1);
  }

  _onActionPress(diary) {
    ActionSheetIOS.showActionSheetWithOptions({
      options:['修改','删除', '取消'],
      //title: '日记',
      cancelButtonIndex:2,
      destructiveButtonIndex: 1,
    }, (index) => {
      if(index == 0) {
        this.props.navigator.push({
          name: 'WritePage',
          component: WritePage,
          params: {
            diary: diary
          }
        })
      } else if (index == 1) {
        Alert.alert('提示', '确认删除日记?',[
          {text: '删除', style: 'destructive', onPress: () => this.deleteDiary(diary)},
            {text: '取消', onPress: () => console.log('OK Pressed!')},
        ]);
      }
    });
  }

  async deleteDiary(diary) {
    try {
      await Api.deleteDiary(diary.id);
        Toast.show("日记已删除", {
            duration: 2000,
            position: -80,
            shadow: false,
            hideOnPress: true,
        });
      this.refresh()
    } catch (err) {
      Alert.alert('删除失败', err.message)
    }
  }

  render() {
      //console.log('DiaryList render');
      //console.log(this.state);
    return (
      <ListView
          ref="list"
        dataSource={this.state.diariesDateSource}
        renderRow={(rowData) =>
          <Diary data={rowData}
            onPress={this._onDiaryPress.bind(this)}
            onIconPress={this._onIconPress.bind(this)}
                 editable={this.props.editable}
                 deletable={this.props.deletable}
                 onActionPress={this._onActionPress.bind(this)}
            navigator={this.props.navigator} />
        }
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
            colors={[TPColors.refreshColor]}
            tintColor={TPColors.refreshColor} />
        }
        onEndReached={this._onEndReached.bind(this)}
        onEndReachedThreshold={200}
        renderFooter={this.renderFooter.bind(this)}
        enableEmptySections={true}
        automaticallyAdjustContentInsets={false}
        //renderHeader={() => <View style={{height: 4}}></View>}
        // onScroll={(event) => console.log(event.nativeEvent)}
        style={this.props.style}
          removeClippedSubviews={this.props.removeClippedSubviews}
          initialListSize={1}
          renderSeparator={(sectionID, rowID, adjacentRowHighlighted) =>
              <View key={`${sectionID}-${rowID}`} style={{borderBottomWidth: StyleSheet.hairlineWidth,
                  borderColor: TPColors.line, marginHorizontal: 15}} />}
      />
    );
  }

  renderFooter() {
      if (this.state.errorPage) {
          return <ErrorView text="日记加载失败了 :(" button="重试一下" onButtonPress={this.refresh.bind(this)} />
      }

      if (this.state.emptyList) {
          return this.props.myself
              ? (
                  <ErrorView
                      text="今天还没有写日记"
                      button="马上写一篇"
                      onButtonPress={() => {
                          this.props.navigator.push({
                              name: 'WritePage',
                              component: WritePage,
                          })
                      }} />
                )
              : (<ErrorView text="今天没有日记" />)
      }

      if(!this.state.loading_more && this.state.loadMoreError) {
          return (
              <View style={{ height: 60, justifyContent: "center", alignItems: "center", paddingBottom: 15}}>
                  <TouchableOpacity style={{marginTop: 15}}
                                    onPress={() => {
                                        this._onEndReached(true);
                                    }}
                  >
                      <Text style={{color: TPColors.light}}>加载失败,点击重试</Text>
                  </TouchableOpacity>
              </View>
          );
      }

    if (this.state.refreshing || this.state.diaries.length == 0) {
      return null;
    }

    if (this.state.more) {
        return (
            <View style={{ height: 60, justifyContent: "center", alignItems: "center"}}>
                <ActivityIndicator animating={true} color={TPColors.light} size="small" />
            </View>
        )
    } else {
        return (
            <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                <Text style={{color: TPColors.inactiveText, fontSize: 12}}>——  THE END  ——</Text>
            </View>
        )
    }
  }
}

DiaryList.propTypes = {
  editable: React.PropTypes.bool,
  deletable: React.PropTypes.bool,
  getDiariesPage: React.PropTypes.func,
    removeClippedSubviews: React.PropTypes.bool,
};

DiaryList.defaultProps = {
  editable: false,
  deletable: false,
    removeClippedSubviews: true,
};
