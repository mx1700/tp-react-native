import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    ListView,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    InteractionManager,
    TouchableOpacity,
    Alert,
    ActionSheetIOS,
    Clipboard
} from 'react-native';
import * as Api from '../Api'
import Diary from './Diary'
import TPColors from '../common/TPColors'
import UserPage from './UserPage'
import NavigationBar from 'NavigationBar'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import TPTouchable from 'TPTouchable'
import RadiusTouchable from 'RadiusTouchable'
import ErrorView from '../common/ErrorListView'
import WritePage from './WritePage'
import Icon from 'react-native-vector-icons/Ionicons';
import NotificationCenter from '../common/NotificationCenter'
import TimeHelper from '../common/TimeHelper'

var moment = require('moment');

export default class DiaryPage extends Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1.id !== r2.id
    });
    this.state = {
      commentsDateSource: ds,
      comments: [],
      loading_comments: true,
      comment_content: '',
      comment_sending: false,
      reply_user_id: 0,
      reply_user_name: '',
      comment_count: this.props.diary ? this.props.diary.comment_count : 0,
      diary: this.props.diary,
      commentsLoadingError: false,
      diaryLoadingError: false,
      isMy: null,
    }
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      let load;
      if (!this.props.diary) {
        load = this._loadDiary();
      } else {
        load = this._loadIsMy();
      }
      Promise.all([this._loadComments(), load])
          .then(() => {
            if (this.props.new_comments) {
              this._scrollToBottom();
            }
          });
    });
  }

  getDiaryId() {
    return this.props.diary ? this.props.diary.id : this.props.diary_id;
  }

  async _loadIsMy() {
    const user = await Api.getSelfInfoByStore();
    this.setState({
      isMy: this.state.diary.user_id == user.id
    });
  }

  async _loadDiary() {
    this.setState({
      diaryLoadingError: false,
    });

    let diary = null;
    try {
      diary = await Api.getDiary(this.getDiaryId());
    } catch (err) {
      //Alert.alert('日记加载失败', err.message);
      //有错误试图，不需处理
    }

    if (diary) {
      this.setState({
        diary: diary,
        comment_count: diary.comment_count,
        diaryLoadingError: false,
      });
      this._loadIsMy();
    } else {
      this.setState({
        diary: null,
        diaryLoadingError: true,
      })
    }
  }

  async _loadComments() {
    this.setState({
      loading_comments: true,
      commentsLoadingError: false,
    });
    let comments = null;
    try {
      comments = await Api.getDiaryComments(this.getDiaryId());
    } catch (e) {
      //console.log(e);
      //有错误试图，不需处理
    }

    if (comments) {
      comments = comments.reverse();
      this.setState({
        commentsDateSource: this.state.commentsDateSource.cloneWithRows(comments),
        comments: comments,
        loading_comments: false,
        comment_count: comments.length,
        commentsLoadingError: false,
      });
    } else {
      comments = [];
      this.setState({
        commentsDateSource: this.state.commentsDateSource.cloneWithRows(comments),
        comments: comments,
        loading_comments: false,
        commentsLoadingError: true,
      });
    }
  }

  _addCommentPress() {
    this.addComment()
  }

  async addComment() {
    this.setState({comment_sending: true});
    let ret = null;
    try {
      content = this.state.reply_user_name
          ? this.state.comment_content.substr(this.state.reply_user_name.length + 2)
          : this.state.comment_content;

      ret = await Api.addComment(this.state.diary.id, content, this.state.reply_user_id)
    } catch (err) {
      Alert.alert('回复失败', err.message);
    }

    if (ret) {
      this.state.comments.push(ret);
      this.setState({
        commentsDateSource: this.state.commentsDateSource.cloneWithRows(this.state.comments),
        comment_sending: false,
        comment_content: '',
        reply_user_id: 0,
        reply_user_name: '',
        comment_count: this.state.comment_count + 1
      }, () => {
        this._scrollToBottom();
      });
    } else {
      //Alert.alert('错误','回复失败 -_-!');
      this.setState({
        comment_sending: false,
      });
    }
  }

  _scrollToBottom() {
    /**
     只有指定 initialListSize 足够大时，获取子内容高度才是准确的，不指定时，获取不准确
     */
    setTimeout(() => {
      if(this && this.refs.list) {
        const listProps = this.refs.list.scrollProperties;
        if (listProps.contentLength < listProps.visibleLength) {
          return;
        }
        const y = listProps.contentLength - listProps.visibleLength;
        this.refs.list.scrollTo({x: 0, y: y, animated: true});
        //console.log(this.refs.list, listProps)
      }
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
    });
    if (this.refs.commentInput) {
      this.refs.commentInput.focus();
    }
  }

  _onCommentContentChange(text) {
    //console.log(text);
    if (this.state.reply_user_name == '') {
      this.setState({comment_content: text});
      return
    }
    if (text.startsWith('@' + this.state.reply_user_name + ' ')) {
      this.setState({comment_content: text});
      return
    }
    text = text.substr(this.state.reply_user_name.length + 1);
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
          {text: '删除', onPress: () => this.deleteDiary(diary)},
          {text: '取消', onPress: () => console.log('OK Pressed!')},
        ]);
      }
    });
  }

  _onCommentActionPress(comment) {
    ActionSheetIOS.showActionSheetWithOptions({
      options:['删除回复', '取消'],
      cancelButtonIndex:1,
      destructiveButtonIndex: 0,
    }, (index) => {
      if(index == 0) {
        Alert.alert('提示', '确认删除回复?',[
          {text: '取消', onPress: () => console.log('OK Pressed!')},
          {text: '删除', onPress: () => this.deleteComment(comment).done()}
        ]);
      }
    });
  }

  async deleteComment(comment) {
    const newComments = this.state.comments.filter(it => it.id != comment.id);
    this.setState({
      comments: newComments,
      commentsDateSource: this.state.commentsDateSource.cloneWithRows(newComments),
      comment_count: newComments.length,
    });

    try {
      await Api.deleteComment(comment.id);
    } catch(err) {
      Alert.alert('删除失败', err.message);
    }
  }

  _isTodayDiary() {
    const [date, ] = this.state.diary.created.split(' ');
    const [year, month, day] = date.split('-');
    const now = new TimeHelper.now();
    return !(now.getFullYear() != parseInt(year) ||
    now.getMonth() + 1 != parseInt(month) ||
    now.getDate() != parseInt(day));
  }

  _onDiaryMorePress() {
    if (this.state.isMy) {
      ActionSheetIOS.showActionSheetWithOptions({
        options: ['修改', '删除', '取消'],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 1,
      }, (index) => {
        if (index == 0) {
          this.props.navigator.push({
            name: 'WritePage',
            component: WritePage,
            params: {
              diary: this.state.diary,
              onSuccess: this._editSuccess
            }
          })
        } else if (index == 1) {
          Alert.alert('提示', '确认删除日记?', [
            {text: '删除', onPress: () => this.deleteDiary(this.state.diary)},
            {text: '取消', onPress: () => console.log('OK Pressed!')},
          ]);
        }
      });
    } else {
      ActionSheetIOS.showActionSheetWithOptions({
        options: ['举报', '取消'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
      }, (index) => {
        if (index == 0) {
          Api.report(this.state.diary.user_id, this.state.diary.id)
              .catch(err => console.log(err));
          Alert.alert('提示', '感谢你的贡献')
        }
      });
    }
  }

  async deleteDiary(diary) {
    let r;
    try {
      r = await Api.deleteDiary(diary.id);
    } catch (err) {
      Alert.alert('删除失败', err.message);
      return;
    }
    Alert.alert('提示', '日记已删除', [{text: '好', onPress: () =>  this.props.navigator.pop()}]);
    NotificationCenter.trigger('onDeleteDiary');
  }

  _editSuccess = (r) => {
      this.setState({diary: r})
  };

  _onCommentLongPress = (comment) => {
    ActionSheetIOS.showActionSheetWithOptions({
      options: ['复制内容', '取消'],
      cancelButtonIndex: 1,
    }, (index) => {
      if (index == 0) {
        Clipboard.setString(comment.content);
      }
    });
  };

  render() {
    let nav = (
        <NavigationBar
            title="日记详情"
            back="后退"
            backPress={() => {
              if(this && this.refs.commentInput) {
                this.refs.commentInput.setNativeProps({'editable': false});
              }
              this.props.navigator.pop()
            }}
        />
    );
    if (this.state.diaryLoadingError) {
      return (
          <View style={{flex: 1, backgroundColor: 'white', justifyContent: "space-between"}}>
            {nav}
            <ErrorView
                text="日记加载失败了 :("
                button="重写一下"
                onButtonPress={() => {
                  this._loadDiary();
                  if (this.state.commentsLoadingError) {
                    this._loadComments();
                  }
                }}/>
          </View>
      )
    }
    if (!this.state.diary) {
      return (
          <View style={{flex: 1, backgroundColor: 'white', justifyContent: "space-between"}}>
            {nav}
            <View style={{flex: 1, alignItems: 'center', paddingTop: 30}}>
              <ActivityIndicator animating={true} color={TPColors.light} size="small"/>
            </View>
          </View>
      )
    }

    const isToday = this._isTodayDiary();
    this.isToday = isToday;
    const commentInput = isToday ? this.renderCommentInputBox() : null;
    const editButton = isToday && this.state.isMy !== null
      ? (
        <NavigationBar.Icon name="ios-more" onPress={this._onDiaryMorePress.bind(this)}/>
    ) : null;

    nav = (
        <NavigationBar
            title="日记详情"
            back="后退"
            backPress={() => {
              if(this && this.refs.commentInput) {
                this.refs.commentInput.setNativeProps({'editable': false});
              }
              this.props.navigator.pop()
            }}
            rightButton={editButton}
        />
    );

    return (
        <View style={{flex: 1, backgroundColor: 'white', justifyContent: "space-between"}}>
          {nav}
          <ListView
              ref="list"
              dataSource={this.state.commentsDateSource}
              renderRow={this.renderComment.bind(this)}
              renderFooter={this.renderFooter.bind(this)}
              renderHeader={this.renderTop.bind(this)}
              enableEmptySections={true}      //enableEmptySections 不加会报一个不理解的警告
              keyboardDismissMode="on-drag"
              initialListSize={99}
          />
          {commentInput}
          <KeyboardSpacer />
        </View>
    );
  }

  renderCommentInputBox() {
    const comment_sending_box = this.state.comment_sending
        ? (<View style={styles.comment_sending}>
      <ActivityIndicator animating={true} color={TPColors.light} size="small"/>
    </View>)
        : null;

    return (
        <View style={styles.comment_box}>
          <TextInput style={styles.comment_input}
                     ref="commentInput"
                     value={this.state.comment_content}
                     placeholder="回复日记"
                     autoCorrect={false}
                     maxLength={500}
                     onSubmitEditing={this._addCommentPress.bind(this)}
                     selectionColor={TPColors.light}
                     enablesReturnKeyAutomatically={true}
                     returnKeyType="send"
                     onChangeText={(text) => this._onCommentContentChange(text)}/>
          {comment_sending_box}
        </View>
    );
  }

  renderTop() {
    /*
     editable={this.props.editable}
     没实现刷新,所以暂时不能在日记页面编辑删除
     */
    const content = this.state.comment_count > 0
        ? `共 ${this.state.comment_count} 条回复`
        : '还没有人回复';
    return (
        <View>
          <Diary
              data={this.state.diary}
              navigator={this.props.navigator}
              onIconPress={this._onDiaryIconPress.bind(this)}
              showComment={false}
              showAllContent={true}
              onActionPress={this._onActionPress.bind(this)}
          />
          <Text style={{marginHorizontal: 16, marginTop: 20, marginBottom: 20, color: TPColors.inactiveText}}>
            {content}
          </Text>
        </View>
    )
  }

  renderComment(comment) {
    const new_comment = this.props.new_comments != null
        && this.props.new_comments.some(it => it == comment.id);
    const style = new_comment ? {backgroundColor: '#eef5ff'} : null;
    const content = comment.recipient == null
        ? <Text style={styles.content}>{comment.content}</Text>
        : (
            <Text style={styles.content}>
              <Text style={{color: TPColors.light}}>@{comment.recipient.name} </Text>
              {comment.content}
            </Text>
        );

    const action = this.isToday && this.state.isMy
        ? (
            <TouchableOpacity onPress={() => this._onCommentActionPress(comment)}>
              <Icon name="ios-more"
                    size={16}
                    color={TPColors.inactiveText}
                    style={{ paddingHorizontal: 12, paddingVertical: 8, marginBottom: -8 }} />
            </TouchableOpacity>
        ) : null;

    return (
        <TPTouchable
            onPress={() => this._onCommentPress(comment)}
            underlayColor="#efefef"
            delayLongPress={500}
            onLongPress={() => this._onCommentLongPress(comment)}
        >
          <View style={style}>
            <View style={styles.box}>
              <RadiusTouchable style={styles.user_icon_box} onPress={() => this._onIconPress(comment.user)}>
                <Image style={styles.user_icon} source={{uri: comment.user.iconUrl}}/>
              </RadiusTouchable>
              <View style={styles.body}>
                <View style={styles.title}>
                  <Text style={styles.title_name}>{comment.user.name}</Text>
                  <Text style={[styles.title_text, {flex: 1}]}>{moment(comment.created).format('H:mm')}</Text>
                  {action}
                </View>
                {content}
              </View>
            </View>
            <View style={styles.line}/>
          </View>
        </TPTouchable>
    );
  }

  renderFooter() {
    if (!this.state.loading_comments && this.state.commentsLoadingError && this.state.diary.comment_count > 0) {
      return (
          <View style={{height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
            <TouchableOpacity style={{marginTop: 15}} onPress={this._loadComments.bind(this)}>
              <Text style={{color: TPColors.light}}>回复加载失败,请重试</Text>
            </TouchableOpacity>
          </View>
      );
    }
    if (!this.state.loading_comments && this.state.diary.comment_count == 0) {
      return null;
    }

    if (!this.state.loading_comments || this.state.diary.comment_count == 0) {
      return null;
    }

    return (
        <View style={{height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
          <ActivityIndicator animating={true} color={TPColors.light} size="small"/>
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
    padding: 10,
    marginLeft: -10,
    marginTop: -10,
    marginRight: 2,
  },
  user_icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  body: {
    flexDirection: "column",
    flex: 1,
    paddingTop: 2
  },
  title: {
    flexDirection: "row",
    paddingBottom: 10,
    alignItems: "flex-end",
      marginTop: -8,
  },
  title_name: {
    fontWeight: 'bold',
    color: TPColors.contentText,
    fontSize: 14,
    marginRight: 5,
  },
  title_text: {
    fontSize: 14,
    color: TPColors.inactiveText
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
    marginLeft: 56,
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
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    fontSize: 15,
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
