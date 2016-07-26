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
var Lightbox = require('Lightbox');

var moment = require('moment');

export default class Diary extends Component {

  render() {
    var diary = this.props.data;
    const img = diary.photoUrl ?
      (
        //去除  navigator={this.props.navigator} 属性，可以禁止后退键，但是无法遮挡状态条
        <Lightbox underlayColor="white" padding={5} 
          navigator={this.props.navigator}
          style={{ width: 220, marginTop: 5, backgroundColor: "#f8f8f8", padding: 5 }}
          swipeToDismiss={false}>
          <Image style={styles.photo} 
            resizeMode="contain"
            source={{uri: diary.photoUrl}} />
        </Lightbox>
      )
      : null;

    return (
      <TouchableHighlight onPress={() => this.props.onPress && this.props.onPress(diary)} underlayColor="#efefef">
        <View>
          <View style={{ paddingVertical: 12, paddingHorizontal: 18, flexDirection: "row" }}>
            <TouchableHighlight style={styles.user_icon_box} onPress={() => this.props.onIconPress && this.props.onIconPress(diary)}>
              <Image style={styles.user_icon} source={{uri: diary.user.iconUrl}} />
            </TouchableHighlight>
            <View style={{ flexDirection: "column", flex: 1 }}>
              <View style={{ flexDirection: "row", paddingBottom: 5, alignItems: "flex-end" }}>
                <Text style={{ fontWeight: 'bold', color: '#333' }}>{diary.user.name}</Text>
                <Text>《{diary.notebook_subject}》</Text>
                <Text style={{fontSize: 12}}>{moment(diary.created).format('H:m')}</Text>
              </View>
              <Text style={{ flex: 1, lineHeight: 20, color: '#333' }} numberOfLines={5}>{diary.content}</Text>
              {img}
              <View>
                <Text style={{fontSize: 12, marginTop: 10}}>{diary.comment_count} 回复</Text>
              </View>
            </View>
          </View>
          <View style={{height: 1, backgroundColor: TPColors.spaceBackground}}></View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  user_icon_box: {
    width: 32,
    height: 32,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor : TPColors.spaceBackground,

  },
  user_icon: {
    width: 32,
    height: 32,
    borderRadius: 18,
  },
  photo: {
    flex: 1,
    height: 160,
  }
});
