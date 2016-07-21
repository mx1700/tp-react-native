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

var moment = require('moment');

export default class Diary extends Component {

    render() {
        var diary = this.props.diary;
        const img = diary.photoUrl ? 
            (<Image style={styles.photo} resizeMode="cover" source={{uri: diary.photoUrl}} />) 
            : null;

        return (
            <TouchableHighlight onPress={() => this.props.onPress && this.props.onPress(diary)} underlayColor="#ebf9ff">
                <View>
                    <View style={{ paddingVertical: 12, paddingHorizontal: 18, flexDirection: "row" }}>
                        <Image style={styles.user_icon} source={{uri: diary.user.iconUrl}} />
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <View style={{ flexDirection: "row", paddingBottom: 5, alignItems: "flex-end" }}>
                                <Text style={{ fontWeight: 'bold', color: '#333' }}>{diary.user.name}</Text>
                                <Text>《{diary.notebook_subject}》</Text>
                                <Text style={{fontSize: 12}}>{moment(diary.created).format('H:m')}</Text>
                            </View>
                            <Text style={{ flex: 1, lineHeight: 20, color: '#333' }} numberOfLines={5}>{diary.content}</Text>
                            {img}
                            <View>
                            <Text style={{fontSize: 12, marginTop: 2}}>{diary.comment_count} 回复</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 1, backgroundColor: "rgba(211, 214, 219, 0.5)", marginHorizontal: 20}}></View>
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
  user_icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  photo: {
    height: 144, 
    width: 144, 
    marginVertical: 5,
    backgroundColor : "rgba(211, 214, 219, 0.2)",
    borderColor: "rgba(211, 214, 219, 0.2)",
    borderWidth: 1,
  }
});