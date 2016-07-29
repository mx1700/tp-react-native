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
  ActivityIndicator,
  TextInput,
  InteractionManager,
} from 'react-native';
import * as Api from 'Api'
import Diary from './Diary'
import TPColors from 'TPColors'
import TPButton from 'TPButton'
import UserPage from './UserPage'
var moment = require('moment');

export default class DiaryPage extends Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = ({
      commentsDateSource: ds,
      loading_comments: true,
      comment_content: '',
    });
  }

  componentWillMount(){
    InteractionManager.runAfterInteractions(() => this._loadComments());
  }

  async _loadComments() {
    try {
      var comments = await Api.getDiaryComments(this.props.diary.id);
    } catch(e) {
      console.warn(e);
      //TODO:加载失败提供重新加载功能
    }

    if (comments) {
      comments = comments.reverse();
    }

    this.setState({
      commentsDateSource: this.state.commentsDateSource.cloneWithRows(comments),
      loading_comments: false,
    });
  }

  _addCommentPress() {
    console.warn(this.state.comment_content)
    this.addComment()
  }

  async addComment() {
    //TODO:提示正在回复
    const r = await Api.addComment(this.props.diary.id, this.state.comment_content, 0)
    //TODO:回复成功，显示回复
  }

  _onIconPress(user) {
    this.props.navigator.push({
      name: 'UserPage',
      component: UserPage,
      params: {
        user: user
      }
    })
  }

  render() {
    //enableEmptySections 不加会报一个不理解的警告
    //TODO:评论功能未完成
    return (
      <View style={{flex: 1, backgroundColor: 'white', justifyContent: "space-between"}}>
        <ListView
          dataSource={this.state.commentsDateSource}
          renderRow={this.renderComment.bind(this)}
          renderFooter={this.renderFooter.bind(this)}
          renderHeader={this.renderTop.bind(this)}
          enableEmptySections={true}
        />
        <View style={{ height: 60, backgroundColor: '#fff', flexDirection: 'row', elevation: 3,}}>
          <TextInput style={{flex: 1}} 
            value={this.state.comment_content}
            onChangeText={(text) => this.setState({ comment_content: text })}/>
          <TPButton caption="回复" style={{ width: 60}} onPress={this._addCommentPress.bind(this)}/>
        </View>
      </View>
    );
  }

  renderTop() {
    return (
      <View>
        <Diary data={this.props.diary} navigator={this.props.navigator} showComment={false} />
        <Text style={{marginHorizontal: 16, marginTop: 20, marginBottom: 5}}>共{this.props.diary.comment_count}条回复</Text>
      </View>
      )
  }

  renderComment(comment) {
    console.log(comment)
    return (
      <View>
        <View style={styles.box}>
          <TouchableHighlight style={styles.user_icon_box} onPress={() => this._onIconPress(comment.user)}>
            <Image style={styles.user_icon} source={{uri: comment.user.iconUrl}} />
          </TouchableHighlight>
          <View style={styles.body}>
            <View style={styles.title}>
              <Text style={styles.title_name}>{comment.user.name}</Text>
              <Text style={styles.title_text}>{moment(comment.created).format('H:m')}</Text>
            </View>
            <Text style={styles.content} numberOfLines={5}>{comment.content}</Text>
          </View>
        </View>
        <View style={styles.line}></View>
      </View>
    );
  }

    renderFooter() {
      //TODO:如果评论数量为0，则不显示加载
      if (!this.state.loading_comments && this.props.diary.comment_count == 0) {
        return null;
      }

      if (!this.state.loading_comments || this.props.diary.comment_count == 0) {
        return null;
      }

      return (
        <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
          <ActivityIndicator animating={true} color="#39E" size="large" />
        </View>
      );
    }
}

const styles = StyleSheet.create({
  box: {
    paddingVertical: 20, 
    paddingHorizontal: 15, 
    flexDirection: "row"
  },
  user_icon_box: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor : TPColors.spaceBackground,
  },
  user_icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  body: { 
    flexDirection: "column", 
    flex: 1 , 
    paddingTop: 2
  },
  title: { 
    flexDirection: "row", 
    paddingBottom: 10, 
    alignItems: "flex-end",
  },
  title_name: {
    fontWeight: 'bold', 
    color: TPColors.contentText, 
    fontSize: 12,
    marginRight: 5,
  },
  title_text: {
    fontSize: 12
  },
  content: { 
    flex: 1, 
    lineHeight: 26, 
    color: TPColors.contentText, 
    fontSize: 15, 
    marginBottom: 5 
  },
  line: {
    height: StyleSheet.hairlineWidth, 
    backgroundColor: TPColors.line, 
    marginHorizontal: 16,
    marginLeft:56,
  },
});
