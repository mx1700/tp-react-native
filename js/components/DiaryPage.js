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
  TextInput
} from 'react-native';
import * as Api from 'Api'
import Diary from './Diary'
import TPColors from 'TPColors'
import TPButton from 'TPButton'
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

  componentDidMount(){
    this._loadComments();
  }

  async _loadComments() {
    console.log(this.props.diary);
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
        <View style={{ height: 60, backgroundColor: "red", flexDirection: 'row'}}>
          <TextInput style={{flex: 1}} 
            value={this.state.comment_content}
            onChangeText={(text) => this.setState({ comment_content: text })}/>
          <TPButton caption="回复" style={{ width: 60}} onPress={this._addCommentPress.bind(this)}/>
        </View>
      </View>
    );
  }

  renderTop() {
    return (<Diary data={this.props.diary} />)
  }

  renderComment(comment) {
    console.log(comment)
    return (
      <View>
        <View style={{ paddingVertical: 12, paddingHorizontal: 18, flexDirection: "row" }}>
          <Image style={styles.user_icon} source={{uri: comment.user.iconUrl}} />
          <View style={{ flexDirection: "column", flex: 1 }}>
            <View style={{ flexDirection: "row", paddingBottom: 5, alignItems: "flex-end" }}>
              <Text style={{ fontWeight: 'bold', color: '#333', marginRight: 10}}>{comment.user.name}</Text>
              <Text style={{fontSize: 12}}>{moment(comment.created).format('H:m')}</Text>
            </View>
            <Text style={{ flex: 1, lineHeight: 20, color: '#333' }} numberOfLines={5}>{comment.content}</Text>
          </View>
        </View>
        <View style={{height: 1, backgroundColor: TPColors.spaceBackground, marginHorizontal: 20}}></View>
      </View>
    );
  }

    renderFooter() {
      //TODO:如果评论数量为0，则不显示加载
      if (!this.state.loading_comments && this.props.diary.comment_count == 0) {
        return (
          <View style={{ height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
            <Text>没有回复</Text>
          </View>
        );
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
  user_icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderColor : TPColors.spaceBackground,
  },
});
