import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ToolbarAndroid,
  Platform,
  RefreshControl,
  ActivityIndicator,
    TouchableOpacity,
    ActionSheetIOS,
    Clipboard,
} from 'react-native';
import RadiusTouchable from 'RadiusTouchable'
import TPColors from 'TPColors'
import Icon from 'react-native-vector-icons/Ionicons';
import PhotoPage from './PhotoPage'

var Lightbox = require('Lightbox');
var moment = require('moment');

export default class Diary extends Component {

    contentLongPress = () => {
        ActionSheetIOS.showActionSheetWithOptions({
            options: ['复制', '取消'],
            cancelButtonIndex: 1,
        }, (index) => {
            if (index == 0) {
                Clipboard.setString(this.props.data.content);
            }
        });
    };

    shouldComponentUpdate(nextProps, nextState) {
        const diary = this.props.data;
        const newDiary = nextProps.data;
        if (diary.id != newDiary.id) {
            return true;
        }
        return diary.notebook_id != newDiary.notebook_id
            || diary.notebook_subject != newDiary.notebook_subject
            || diary.content != newDiary.content
            || diary.comment_count != newDiary.comment_count
    }

    photoPress = () => {
        const diary = this.props.data;
        this.props.navigator.push({
            name: 'PhotoPage',
            component: PhotoPage,
            params: {
                source: {uri: diary.photoUrl.replace('w640', 'w640-q75')}
            }
        });
    };

  render() {
    var diary = this.props.data;
    const photoView = this.renderPhoto(diary);

    const icon = diary.user ? (
          <RadiusTouchable style={styles.user_icon_box} onPress={() => this.props.onIconPress && this.props.onIconPress(diary)}>
            <Image key={diary.id} style={styles.user_icon} source={{uri: diary.user.iconUrl}} />
          </RadiusTouchable>
      ) : null;


    let title;
    if (diary.user) {
      title = <View style={styles.title}>
                <Text style={styles.title_name}>{diary.user.name}</Text>
                <Text style={[styles.title_text, {flex: 1}]} numberOfLines={1}>《{diary.notebook_subject}》</Text>
                <Text style={styles.title_text}>{moment(diary.created).format('H:mm')}</Text>
              </View>
    } else {
      const book = this.props.showBookSubject
              ? (<Text style={styles.title_h}>《{diary.notebook_subject}》</Text>)
              : null;

      title = <View style={styles.title}>
                {book}
                <Text style={styles.title_text}>{moment(diary.created).format('H:mm')}</Text>
              </View>
    }

    const content = this.props.showAllContent
        ? (
            <TouchableOpacity delayLongPress={500} activeOpacity={0.5} onLongPress={this.contentLongPress}>
                <Text style={styles.content}>{diary.content}</Text>
            </TouchableOpacity>
        )
        : <Text style={styles.content} numberOfLines={5}>{diary.content}</Text>;

    const view = (
        <View style={styles.box}>
            {icon}
            <View style={styles.body}>
              {title}
                {content}
              {photoView}
              {this.renderActionBar(diary)}
            </View>
        </View>
    );

    if (this.props.onPress) {
      return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.props.onPress && this.props.onPress(diary)}
            style={styles.box}>
            {icon}
            <View style={styles.body}>
                {title}
                {content}
                {photoView}
                {this.renderActionBar(diary)}
            </View>
        </TouchableOpacity>
      );
    } else {
      return (
          <View style={styles.box}>
              {icon}
              <View style={styles.body}>
                  {title}
                  {content}
                  {photoView}
                  {this.renderActionBar(diary)}
              </View>
          </View>
      );
    }
  }

  renderActionBar(diary) {
      const hasComment = diary.comment_count > 0 && this.props.showComment;
      const hasMoreAction = this.props.editable || this.props.deletable;
      if (hasComment || hasMoreAction) {
          const comment = hasComment
              ? (<View style={styles.comment_icon_box}>
              <Icon name="ios-text-outline"
                    size={18}
                    color={TPColors.inactiveText}
                    style={styles.button_icon} />
              <Text style={styles.comment_icon_text}>{diary.comment_count}</Text>
          </View>)
              : null;

          const action = hasMoreAction
              ? (
              <TouchableOpacity onPress={() => this.props.onActionPress(diary)}>
                  <Icon name="ios-more"
                        size={18}
                        color={TPColors.inactiveText}
                        style={styles.more_icon} />
              </TouchableOpacity>
          )
              : null;

          return (
              <View style={styles.action_bar}>
                  {comment}
                  {action}
              </View>
          )
      } else {
          return <View style={{height: 24}} />
      }
  }

  renderPhoto(diary) {
      return diary.photoUrl ?
          (
              <TouchableOpacity
                  onPress={this.photoPress}
                  style={styles.photo_box}
              >
                  <Image style={styles.photo}
                         key={diary.id}
                         source={{uri: diary.photoThumbUrl.replace('w240-h320', 'w320-h320-c320:320-q75')}}/>
              </TouchableOpacity>
          )
          : null;
  }
}

// const pix = PixelRatio.get();
// var thumbSize = 'w320-h320-c320:320-q75';
// if ()

Diary.propTypes = {
  showComment: React.PropTypes.bool,
  showAllContent: React.PropTypes.bool,
  diary: React.PropTypes.object,
  editable: React.PropTypes.bool,
  deletable: React.PropTypes.bool,
  onActionPress: React.PropTypes.func,
  showBookSubject: React.PropTypes.bool,
};

Diary.defaultProps = {
  showComment: true,
  showAllContent: false,
  editable: false,
  deletable: false,
  showBookSubject: true,
};

const styles = StyleSheet.create({
    box: {
        backgroundColor: 'white',
        overflow: "hidden",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: TPColors.line,
        marginHorizontal: 15,
        paddingTop: 20,
        flexDirection: "row"
    },
    body: {
        flexDirection: "column",
        flex: 1,
        paddingTop: 2
    },
    title: {
        flexDirection: "row",
        paddingBottom: 5,
        alignItems: "flex-end"
    },
    title_name: {
        fontWeight: 'bold',
        color: TPColors.contentText,
        fontSize: 14
    },
    title_h: {
        fontWeight: 'bold',
        color: '#222222',
        fontSize: 14
    },
    title_text: {
        fontSize: 12,
        color: TPColors.inactiveText
    },
    user_icon_box: {
        padding: 10,
        marginLeft: -10,
        marginTop: -10,
    },
    user_icon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: TPColors.spaceBackground,
        marginRight: 2,
    },
    content: {
        flex: 1,
        lineHeight: 24,
        color: TPColors.contentText,
        fontSize: 15,
        textAlignVertical: 'bottom',
    },
    photo_box: {
        width: 160,
        height: 160,
        marginTop: 15,
        backgroundColor: "#f8f8f8",
        padding: 0,
    },
    photo: {
        flex: 1,
        width: 160,
        height: 160,
    },
    button_icon: {
        marginRight: 8,
        marginLeft: 2
    },
    comment_icon_box: {
        flexDirection: "row"
    },
    comment_icon_text: {
        fontSize: 15,
        color: TPColors.inactiveText
    },
    more_icon: {
        paddingVertical: 4, paddingHorizontal: 15, marginRight: 5
    },
    action_bar: {
        flexDirection: 'row',
        alignItems: "center",
        height: 50,
        marginRight: -15,
        justifyContent: 'space-between'
    }
});
