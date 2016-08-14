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
            loading: false,
            progress: 0,
        };
    }

    handleLoadStart() {
        this.setState({
            loading: true
        });
    }

    handleProgress(event) {
        const progress = Math.floor(event.nativeEvent.loaded / event.nativeEvent.total * 100);
        if (progress > this.state.progress) {
            this.setState({
                progress: progress,
                loading: progress < 100,
            });

            //console.log(progress);
        }
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
        const progress = this.state.progress > 0 ? this.state.progress + '%' : '';
        const loading = this.state.loading ? (
            <View>
                <ActivityIndicator />
                <Text style={{color: 'white', padding: 5, fontSize: 10}}>{progress}</Text>
            </View>
        ) : null;
        //console.log(this.props.source);
        //onProgress={this.handleProgress.bind(this)}
//                    onLoadStart={this.handleLoadStart.bind(this)}

        //                    onLoad={this.handleLoad.bind(this)}>

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
                    onProgress={this.handleProgress.bind(this)}
                    onLoad={this.handleLoad.bind(this)}
                    onError={this.handleError.bind(this)}
                    >
                    {loading}
                </ZoomImage>
            </TouchableOpacity>
        )
    }
}