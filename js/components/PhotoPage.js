import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Text,
} from 'react-native';
import ZoomImage from '../common/react-native-transformable-image/TransformableImage';

export default class PhotoPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    handleLoadStart() {
        this.setState({
            loading: true
        });
    }

    handleProgress(event) {
        const progress = event.nativeEvent.loaded / event.nativeEvent.total;
        // RN is a bit buggy with these events, sometimes a loaded event and then a few
        // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
        // actually means the image is no longer loading
        // if (progress !== this.state.progress && this.state.progress !== 1) {
        //     this.setState({
        //         loading: progress < 1,
        //         progress: progress,
        //     });
        // }
    }

    handleError() {
        alert('图片加载失败')
    }

    handleLoad() {
        this.setState({
            loading: false
        });
    }

    render() {
        const loading = this.state.loading ? (
            <ActivityIndicator />
        ) : null;
        //console.log(this.props.source);
        //onProgress={this.handleProgress.bind(this)}

        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{flex: 1, backgroundColor: '#000'}}
                onPress={() => this.props.navigator.pop()}
            >
                <ZoomImage
                    style={{flex: 1}}
                    onPress={() => this.props.navigator.pop()}
                    source={this.props.source}
                    onLoadStart={this.handleLoadStart.bind(this)}
                    onError={this.handleError.bind(this)}
                    onLoad={this.handleLoad.bind(this)}>
                    {loading}
                </ZoomImage>
            </TouchableOpacity>
        )
    }
}