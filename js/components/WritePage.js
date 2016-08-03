/**
 * Created by lizhaoguang on 16/8/1.
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Platform,
    ActivityIndicator,
    Text,
    TextInput,
    Picker,
    Animated,
    Dimensions,
    TouchableHighlight,
    Modal,
    InteractionManager,
    TouchableOpacity,
    Image,
    CameraRoll,
} from 'react-native';
import * as Api from '../Api'
import DiaryPage from './DiaryPage'
import DiaryList from './DiaryList'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import NavigationBar from 'NavigationBar'
import LabelButton from '../common/LabelButton'
import NotificationCenter from '../common/NotificationCenter'
var ImagePicker = require('react-native-image-picker');
import TPColor from '../common/TPColors'

export default class WritePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectBookId: 0,
            modalVisible: false,
            books: [],
            content: '',
            loading: false,
            photoUri: null,
            photoSource: null,
        }
    }

    componentWillMount(){
        InteractionManager.runAfterInteractions(() => {
            this._loadBooks();
        });
    }

    async _loadBooks() {
        const books = await Api.getSelfNotebooks();
        const abooks = books.filter(it => !it.isExpired);
        this.setState({
            books: abooks,
            selectBookId: abooks.length > 0 ? abooks[0].id : 0
        })
    }

    _writePress() {
        if (this.state.selectBookId == 0) {
            alert('日记本列表加载失败');     //TODO:更换更友好的提示
            return;
        }

        if (this.state.content.length == 0) {
            alert('请填写日记内容');
            return;
        }

        // this.refs.contentInput.setNativeProps({'editable':false});
        // this.refs.contentInput.setNativeProps({'editable':true});
        //this.openModal();
        this.write();
    }

    async write() {
        this.setState({loading: true});
        let r = null;
        try {
            r = await Api.addDiary(this.state.selectBookId, this.state.content, this.state.photoUri);
            console.log('write:', r);
        } catch (err) {
            console.log(err);   //TODO:友好提示
            return;
        } finally {
            this.setState({loading: false});
        }


        if (r) {
            this.props.navigator.pop();
            NotificationCenter.trigger('onWriteDiary')
        }
    }

    _cancelPress() {
        //TODO:增加取消确认
        this.props.navigator.pop();
    }

    openModal() {
        this.setState({modalVisible: true});
    }

    closeModal() {
        this.setState({modalVisible: false});
    }

    _imagePress() {
        //TODO:当选择照片后,再次点击,放大图片,里边有取消按钮
        this.selectPhoto();
    }

    async selectPhoto() {
        // const photoUri = CameraRoll.getPhotos({first: 1})
        // console.log(photoUri);
        const customButtons = this.state.photoUri !== null
            ?{
                '取消照片选择': 'delete',
            }
            : null;
        var options = {
            title: '添加照片',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: '拍照',
            chooseFromLibraryButtonTitle: '从相册选择',
            customButtons: customButtons,
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                this.setState({
                    photoSource: null,
                    photoUri: null,
                });
            }
            else {
                // You can display the image using either data...
                //const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};
                // or a reference to the platform specific asset location
                const source = Platform.OS === 'ios'
                    ? {uri: response.uri.replace('file://', ''), isStatic: true}
                    : {uri: response.uri, isStatic: true};

                this.setState({
                    photoSource: source,
                    photoUri: response.uri,
                });
            }
        });
    }

    render() {
        const selectedBook = this.state.books.length > 0
            ? this.state.books.filter(it => it.id == this.state.selectBookId).pop()
            : null;

        const bookButton = selectedBook
            ? (<LabelButton text={selectedBook.subject} icon="bookmark"
                onPress={this.openModal.bind(this)} />)
            : null;

        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <Modal
                    visible={this.state.loading}
                    transparent={true}
                    onRequestClose={() => {}}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                        <ActivityIndicator animating={true} color={TPColor.light} />
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => { }}>
                    <View style={{ flex: 1}}>
                        <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.7)" }} />
                        <View style={{height: 250, backgroundColor: '#fff'}}>
                            <View style={styles.closeButtonContainer}>
                                <TouchableHighlight onPress={ this.closeModal.bind(this) } underlayColor="transparent" style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>确定</Text>
                                </TouchableHighlight>
                            </View>
                            <Picker
                                style={{ flex: 1}}
                                selectedValue={this.state.selectBookId}
                                onValueChange={(id) => this.setState({selectBookId: id})}>
                                {this.state.books.map((book) => (
                                    <Picker.Item key={book.id} label={book.subject} value={book.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </Modal>
                <NavigationBar
                    title="写日记"
                    rightButton={{ title: "发布", handler: this._writePress.bind(this) }}
                    leftButton={{ title: "取消", handler: this._cancelPress.bind(this) }}
                />
                <TextInput
                    ref="contentInput"
                    style={{flex: 1, padding: 15, fontSize: 14}}
                    autoCorrect={false}
                    autoFocus={true}
                    maxLength={500}
                    multiline={true}
                    placeholder="记录点滴生活"
                    onChangeText={(text) => this.setState({ content: text })}
                />
                <View style={styles.comment_box}>
                    {bookButton}
                    <View style={{flex: 1}} />
                    <TouchableOpacity onPress={this._imagePress.bind(this)}>
                        <Image source={this.state.photoSource} style={{width: 30, height: 30, backgroundColor: '#eee'}} />
                    </TouchableOpacity>
                </View>
                <KeyboardSpacer />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    comment_box: {
        height: 50,
        backgroundColor: '#fff',
        elevation: 3,
        borderColor: '#bbb',
        borderTopWidth: StyleSheet.hairlineWidth,
        padding: 10,
        flexDirection: 'row'
    },
    closeButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopColor: '#e2e2e2',
        borderTopWidth: 1,
        borderBottomColor: '#e2e2e2',
        borderBottomWidth:1
    },
    closeButton: {
        paddingHorizontal: 15,
        paddingVertical: 10
    }
});