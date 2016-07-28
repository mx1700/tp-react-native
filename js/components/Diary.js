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
import TPColors from 'TPColors'
import Icon from 'react-native-vector-icons/FontAwesome';

var Lightbox = require('Lightbox');
var moment = require('moment');

export default class Diary extends Component {

  render() {
    var diary = this.props.data;
    const photoView = this.randerPhoto()

    const icon = diary.user ? (
        <TouchableHighlight style={styles.user_icon_box} onPress={() => this.props.onIconPress && this.props.onIconPress(diary)}>
          <Image style={styles.user_icon} source={{uri: diary.user.iconUrl}} />
        </TouchableHighlight>
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
    
    return (
      <TouchableHighlight onPress={() => this.props.onPress && this.props.onPress(diary)} underlayColor="#efefef">
        <View>
          <View style={styles.box}>
            {icon}
            <View style={styles.body}>
              {title}
              <Text style={styles.content} numberOfLines={5}>{diary.content}</Text>
              {photoView}
              <View style={{flexDirection: "row"}}>
                <View style={styles.button}>
                  <Icon name="comment" size={12} color="#999" style={styles.button_icon} />
                  <Text style={{fontSize: 12}}>{diary.comment_count}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.line}></View>
        </View>
      </TouchableHighlight>
    );
  }

  randerPhoto() {
    var diary = this.props.data;
    const img = diary.photoUrl ?
      (
        <Lightbox underlayColor="white" padding={0} 
          navigator={this.props.navigator}
          style={{ width: 220, marginTop: 5, marginBottom: 15, backgroundColor: "#f8f8f8", padding: 0 }}
          swipeToDismiss={false}
          renderContent={this.randerPhotoZoom.bind(this)}>
          <Image style={styles.photo} 
            resizeMode="cover"
            source={{uri: diary.photoUrl}} />
        </Lightbox>
      )
      : null;

      return img;
  }

  randerPhotoZoom() {
    var diary = this.props.data;
    return (
      <Image style={styles.photo} 
      resizeMode="contain"
      source={{uri: diary.photoUrl}} />
    )
  }
}

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
    paddingBottom: 10, 
    alignItems: "flex-end" 
  },
  title_name: {
    fontWeight: 'bold', 
    color: TPColors.contentText, 
    fontSize: 12 
  },
  title_h: {
    fontWeight: 'bold', 
    color: TPColors.contentText, 
    fontSize: 15 
  },
  title_text: {
    fontSize: 12
  },
  user_icon_box: {
    width: 32,
    height: 32,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor : TPColors.spaceBackground,
  },
  user_icon: {
    width: 32,
    height: 32,
    borderRadius: 18,
  },
  content: { 
    flex: 1, 
    lineHeight: 26, 
    color: TPColors.contentText, 
    fontSize: 15, 
    marginBottom: 5 
  },
  photo: {
    flex: 1,
    height: 160,
  },
  button: {
    flex: 0, 
    flexDirection: "row", 
    marginTop: 5, 
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: TPColors.inactiveText, 
    borderRadius: 3, 
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  button_icon: {
    marginTop: 2, marginRight: 8
  },
  line: {
    height: StyleSheet.hairlineWidth, 
    backgroundColor: TPColors.line, 
    marginHorizontal: 16
  }
});
