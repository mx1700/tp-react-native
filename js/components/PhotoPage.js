import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import ZoomImage from '../common/react-native-transformable-image/TransformableImage';

export default class PhotoPage extends Component {
    render() {
        return (
            <TouchableOpacity activeOpacity={1} style={{flex: 1, backgroundColor: '#000'}} onPress={() => this.props.navigator.pop()}>
                <ZoomImage style={{flex: 1}} onPress={() => this.props.navigator.pop()}
                    source={this.props.source}/>
                </TouchableOpacity>
        )
    }
}