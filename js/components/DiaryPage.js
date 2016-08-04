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
import NavigationBar from 'NavigationBar'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import TPTouchable from 'TPTouchable'
import RadiusTouchable from 'RadiusTouchable'

var moment = require('moment');

export default class DiaryPage extends Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1.id !== r2.id
    });
    this.state = ({
      commentsDateSource: ds,
      comments: [],
      loading_comments: true,
      comment_content: '',
      comment_sending: false,
      reply_user_id: 0,
      reply_user_name: '',
      comment_count: this.props.diary.comment_count
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
      comments: comments,
      loading_comments: false,
        comment_count: comments.length
    });
  }

  _addCommentPress() {
    this.addComment()
  }

  async addComment() {
    this.setState({ comment_sending: true });
    try {
      content = this.state.reply_user_name
        ? this.state.comment_content.substr(this.state.reply_user_name.length + 2)
        : this.state.comment_content

      const r = await Api.addComment(this.props.diary.id, content, this.state.reply_user_id)
      console.log(r);
      this.state.comments.push(r)
      this.setState({
        commentsDateSource: this.state.commentsDateSource.cloneWithRows(this.state.comments),
      }, () => {
        this._scrollToBottom();
      });
    } catch (err) {
      console.log(err);
    }
    this.setState({
      comment_sending: false,
      comment_content: '',
      reply_user_id: 0,
      reply_user_name: '',
        comment_count: this.state.comment_count + 1
    });

    //TODO:回复成功，显示回复
  }

  _scrollToBottom() {
    /**
    只有指定 initialListSize 足够大时，获取子内容高度才是准确的，不指定时，获取不准确
    */
    setTimeout(() => {
      const listProps = this.refs.list.scrollProperties;
      if (listProps.contentLength < listProps.visibleLength) {
        return;
      }
      const y = listProps.contentLength - listProps.visibleLength;
      this.refs.list.scrollTo({ x: 0, y: y, animated: true})
      //console.log(this.refs.list, listProps)
    }, 500)
  }

  _onCommentPress(comment) {
    let content = this.state.comment_content;
    if (this.state.reply_user_name) {
      content = content.replace('@' + this.state.reply_user_name, '@' + comment.user.name)
    } else {
      content = '@' + comment.user.name + ' ' + content
    }
    this.setState({
      reply_user_id: comment.user.id,
      reply_user_name: comment.user.name,
      comment_content: content,
    })
  }

  _onCommentContentChange(text) {
    //console.log(text);
    if (this.state.reply_user_name == '') {
      this.setState({ comment_content: text})
      return
    }
    if (text.startsWith('@' + this.state.reply_user_name + ' ')) {
      this.setState({ comment_content: text})
      return
    }
    text = text.substr(this.state.reply_user_name.length + 1)
    this.setState({
      reply_user_id: 0,
      reply_user_name: '',
      comment_content: text,
    })
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

  _onDiaryIconPress(diary) {
    this.props.navigator.push({
      name: 'UserPage',
      component: UserPage,
      params: {
        user: diary.user
      }
    })
  }

  render() {
    //enableEmptySections 不加会报一个不理解的警告
    //TODO:评论功能未完成
    //TODO:加载评论后更新评论数
    const comment_sending_box = this.state.comment_sending
      ? (<View style={styles.comment_sending}>
        <ActivityIndicator animating={true} color={TPColors.inactive} size="small" />
      </View>)
      : null;

    return (
      <View style={{flex: 1, backgroundColor: 'white', justifyContent: "space-between"}}>
        <NavigationBar
          title="日记详情"
          back="后退"
          backPress={() => { this.props.navigator.pop() }}
          />
        <ListView
          ref="list"
          dataSource={this.state.commentsDateSource}
          renderRow={this.renderComment.bind(this)}
          renderFooter={this.renderFooter.bind(this)}
          renderHeader={this.renderTop.bind(this)}
          enableEmptySections={true}
          keyboardDismissMode="on-drag"
          initialListSize={99}
        />
        <View style={styles.comment_box}>
          <TextInput style={styles.comment_input}
            value={this.state.comment_content}
            placeholder="回复日记"
            autoCorrect={false}
            maxLength={100}
            onSubmitEditing={this._addCommentPress.bind(this)}
            selectionColor={TPColors.light}
            enablesReturnKeyAutomatically={true}
            returnKeyType="send"
            onChangeText={(text) => this._onCommentContentChange(text)}/>
          {comment_sending_box}
        </View>
        <KeyboardSpacer />
      </View>
    );
  }

  renderTop() {
    return (
      <View>
        <Diary
            data={this.props.diary}
            navigator={this.props.navigator}
            onIconPress={this._onDiaryIconPress.bind(this)}
            showComment={false} />
        <Text style={{marginHorizontal: 16, marginTop: 20, marginBottom: 5, color: TPColors.inactiveText}}>
        共 {this.state.comment_count} 条回复
        </Text>
      </View>
      )
  }

  renderComment(comment) {
    return (
      <TPTouchable onPress={() => this._onCommentPress(comment)} underlayColor="#efefef">
        <View>
          <View style={styles.box}>
            <RadiusTouchable style={styles.user_icon_box} onPress={() => this._onIconPress(comment.user)}>
              <Image style={styles.user_icon} source={{uri: comment.user.iconUrl}} />
            </RadiusTouchable>
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
      </TPTouchable>
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
        <ActivityIndicator animating={true} color={TPColors.light} size="small" />
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
  comment_box: {
    height: 50,
    backgroundColor: '#fff',
    elevation: 3,
    borderColor: '#bbb',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  comment_input: {
    flex: 1,
    borderColor: TPColors.inactive,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    fontSize: 13,
    height: 34,
    margin: 8,
  },
  comment_sending: {
    height: 50,
    opacity: 0.8,
    backgroundColor: "#fff",
    top: -50,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
