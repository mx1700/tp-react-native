import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ToolbarAndroid,
  Platform,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import TPTouchable from 'TPTouchable'
import RadiusTouchable from 'RadiusTouchable'
import TPColors from 'TPColors'
import Icon from 'react-native-vector-icons/FontAwesome';

var Lightbox = require('Lightbox');
var moment = require('moment');

export default class Diary extends Component {

  render() {
    var diary = this.props.data;
    const photoView = this.renderPhoto();

    const icon = diary.user ? (
        <View style={styles.user_icon_box}>
          <RadiusTouchable onPress={() => this.props.onIconPress && this.props.onIconPress(diary)}>
            <View>
              <Image style={styles.user_icon} source={{uri: diary.user.iconUrl}} />
            </View>
          </RadiusTouchable>
        </View>
      ) : null;

    const title = diary.user ? (
      <View style={styles.title}>
        <Text style={styles.title_name}>{diary.user.name}</Text>
        <Text style={styles.title_text}>《{diary.notebook_subject}》</Text>
        <Text style={styles.title_text}>{moment(diary.created).format('H:m')}</Text>
      </View>
    ) : (
      <View style={styles.title}>
        <Text style={styles.title_h}>《{diary.notebook_subject}》</Text>
        <Text style={styles.title_text}>{moment(diary.created).format('H:m')}</Text>
      </View>
    );

    const comment = diary.comment_count > 0 && this.props.showComment ?
              (<View style={{flexDirection: "row", paddingTop: 5}}>
                <Icon name="comment-o" size={12} color={TPColors.inactiveText} style={styles.button_icon} />
                <Text style={{fontSize: 12, color: TPColors.inactiveText}}>{diary.comment_count}</Text>
              </View>) : null;

    const view = (
        <View>
          <View style={styles.box}>
            {icon}
            <View style={styles.body}>
              {title}
              <Text style={styles.content} numberOfLines={5}>{diary.content}</Text>
              {photoView}
              {comment}
            </View>
          </View>
          <View style={styles.line} />
        </View>
    );

    if (this.props.onPress) {
      return (
        <TPTouchable onPress={() => this.props.onPress && this.props.onPress(diary)} underlayColor="#efefef">
          {view}
        </TPTouchable>
      );
    } else {
      return view;
    }

  }

  renderPhoto() {
    var diary = this.props.data;
    const img = diary.photoUrl ?
      (
        <Lightbox underlayColor="white" padding={0}
          navigator={this.props.navigator}
          style={{ width: 220, marginTop: 5, marginBottom: 15, backgroundColor: "#f8f8f8", padding: 0 }}
          swipeToDismiss={false}
          renderContent={this.renderPhotoZoom.bind(this)}>
          <Image style={styles.photo}
            resizeMode="cover"
            source={{uri: diary.photoUrl}} />
        </Lightbox>
      )
      : null;

      return img;
  }

  renderPhotoZoom() {
    var diary = this.props.data;
    return (
      <Image style={styles.photo}
      resizeMode="contain"
      source={{uri: diary.photoUrl}} />
    )
  }
}

Diary.propTypes = {
  showComment: React.PropTypes.bool,
  diary: React.PropTypes.object
};

Diary.defaultProps = {
  showComment: true
};

const styles = StyleSheet.create({
  box: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: "row"
  },
  body: {
    flexDirection: "column",
    flex: 1 ,
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
    color: TPColors.contentText,
    fontSize: 14
  },
  title_text: {
    fontSize: 14,
    color: TPColors.inactiveText
  },
  user_icon_box: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor : TPColors.spaceBackground
  },
  user_icon: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  content: {
    flex: 1,
    lineHeight: 24,
    color: TPColors.contentText,
    fontSize: 15,
    textAlignVertical: 'bottom',
    paddingBottom: 8
  },
  photo: {
    flex: 1,
    height: 160
  },
  button_icon: {
    marginTop: 2, 
    marginRight: 8, 
    marginLeft: 2
  },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: TPColors.line,
    marginHorizontal: 16
  }
});
