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
    Easing,
    Dimensions,
    Modal,
    InteractionManager,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    ActionSheetIOS,
    TouchableWithoutFeedback,
    CameraRoll
} from 'react-native';

import {
    NavigationBar,
    LabelButton,
    NotificationCenter,
    TPColors,
    TimeHelper,
} from '../common'

import * as Api from '../Api'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Icon from 'react-native-vector-icons/Ionicons'
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer'
import Toast from 'react-native-root-toast';
import NotebookAddPage from './NotebookAddPage'
import Notebook from './Notebook'


var moment = require('moment');
var locale = require('moment/locale/zh-cn');
var Fabric = require('react-native-fabric');
var { Answers } = Fabric;
const dismissKeyboard = require('dismissKeyboard');

export default class WritePage extends Component {

    constructor(props) {
        super(props);
        const diary = props.diary;
        this.state = {
            selectBookId: diary == null ? 0 : diary.notebook_id,
            modalVisible: false,
            books: [],
            content: diary == null ? '' : diary.content,
            loading: false,
            photoUri: null,
            photoSource: null,
            loadBookError: false,
            bookEmptyError: false,
            fadeAnimOpacity: new Animated.Value(0),
            fadeAnimHeight: new Animated.Value(0),
            topic: props.topic,
        };
    }

    // componentWillMount(){
    //
    // }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._loadBooks();
            if (!this.props.diary) {
                this._loadTempDraftAndDraft();
            }
            if (this.refs.contentInput) {
                this.refs.contentInput.focus();
            }
            this._autoSaveTempDraft();
        });
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    goBack = () => {
        Api.clearTempDraft();
        this.props.navigator.pop();
    };

    async _loadTempDraftAndDraft() {
        const tempDraft = await Api.getTempDraft();
        if (tempDraft && tempDraft.length > 0) {
            Alert.alert('恢复日记', '之前写的日记未发布成功，是否恢复？\n 取消将丢失日记内容', [
                {text: '取消', style: 'destructive', onPress:() => { Api.clearTempDraft(); this._loadDraft(); }},
                {
                    text: '恢复',
                    onPress: () => {
                        this.setState({
                            content: tempDraft,
                        });
                        Api.clearTempDraft();
                    }
                }
            ]);
        } else {
            this._loadDraft();
        }
    }

    async _loadDraft() {
        const draft = await Api.getDraft();
        if (draft && draft.length > 0) {
            Alert.alert('提示', '有一篇日记草稿，是否加载？\n加载后将会清空草稿箱', [
                {text: '取消'},
                {
                    text: '加载草稿',
                    onPress: () => {
                        this.setState({
                            content: draft,
                        });
                        Api.clearDraft();
                    }
                }
            ]);
        }
    }

    async _loadBooks() {
        let books = [];
        try {
            books = await Api.getSelfNotebooks();
        } catch(err) {
            console.log(err);
            Alert.alert('日记本加载失败', err.message);
            this.state.loadBookError = true;
            return;
        }
        const abooks = books.filter(it => !it.isExpired);
        //const abooks = [];
        if (abooks.length == 0) {
            Alert.alert('提示','没有可用日记本,无法写日记',[
                {text: '取消', onPress: () =>  this.goBack()},
                {text: '创建一个', onPress: () => this._createBook()}
            ]);
            this.state.bookEmptyError = true;
            return;
        }
        if (this.props.diary == null) {
            this.setState({
                books: abooks,
                selectBookId: abooks.length > 0 ? abooks[0].id : 0
            })
        } else {
            this.setState({
                books: abooks,
            })
        }
    }

    _writePress() {
        if (this.state.loadBookError) {
            Alert.alert('失败','日记本列表加载失败');  //TODO:提供重新加载功能
            return;
        }

        if (this.state.bookEmptyError) {
            Alert.alert('失败','没有可用的日记本');
            return;
        }

        if (this.state.content.length == 0) {
            Alert.alert('提示','请填写日记内容');
            return;
        }

        this.write();
    }

    async write() {
        this.setState({loading: true});

        let photoUri = this.state.photoUri;
        let r = null;
        try {
            const  topic = this.props.topic ? 1 : 0;
            r = this.props.diary == null
                ? await Api.addDiary(this.state.selectBookId,
                this.state.content,
                photoUri, topic)
                : await Api.updateDiary(this.props.diary.id,
                this.state.selectBookId,
                this.state.content);
        } catch (err) {
            //Alert.alert('日记保存失败', err.message);
            Toast.show("保存失败\n" + err.message, {
                duration: 2000,
                position: -80,
                shadow: false,
                hideOnPress: true,
            });
            return;
        } finally {
            this.setState({loading: false});
        }


        if (r) {
            Toast.show("日记保存完成", {
                duration: 2000,
                position: -80,
                shadow: false,
                hideOnPress: true,
            });
            this.goBack();

            InteractionManager.runAfterInteractions(() => {
                NotificationCenter.trigger('onWriteDiary');
                if (this.props.topic) {
                    NotificationCenter.trigger('onWriteTopicDiary');
                }
                const type = photoUri == null ? 'text' : 'photo';
                Answers.logCustom('WriteDiary', {type: type});
                if (this.props.onSuccess) {
                    this.props.onSuccess(r);
                }
            });
        }
    }

    async resizePhoto(uri, width, height) {
        //图片最大 1440 * 900 像素
        let oWidth = width;
        let oHeight = height;
        let maxPixel = 1440 * 900;
        let oPixel = oWidth * oHeight;
        if (oPixel > maxPixel) {
            width = Math.sqrt(oWidth * maxPixel / oHeight);
            height = Math.sqrt(oHeight * maxPixel / oWidth);
        }
        console.log('resize to :', width, height);
        const newUri = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 75);
        return 'file://' + newUri;
    }

    _cancelPress() {
        dismissKeyboard();

        if (this.state.content.length == 0 || this.props.diary) {
            this.backPage();
            return;
        }
        InteractionManager.runAfterInteractions(() => {
            Alert.alert('提示', '日记还未保存，确认删除并退出?\n保存草稿将会覆盖之前草稿', [
                {
                    text: '删除日记', style: 'destructive', onPress: () => this.backPage()
                },
                {
                    text: '保存草稿', onPress: () => {
                        Api.saveDraft(this.state.content);
                        this.backPage();
                    }
                },
                {
                    text: '取消'
                },
            ]);
        });
    }

    backPage() {
        setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
                this.goBack()
            });
        }, 350);
    }

    openModal() {
        dismissKeyboard();
        this.setState({modalVisible: true});
    }

    closeModal(showKeyboard = true) {
        Animated.parallel([
            Animated.timing(
                this.state.fadeAnimOpacity,
                {toValue: 0, duration: 350, easing: Easing.out(Easing.cubic)}
            ),
            Animated.timing(
                this.state.fadeAnimHeight,
                {toValue: 1, duration: 350, easing: Easing.out(Easing.cubic)}   //toValue: 1 为解决 RN 0.36-rc.1 奇怪的闪退 bug
            )
        ]).start(() => {
            this.setState({modalVisible: false});
            if (showKeyboard) {
                this.refs.contentInput.focus();
            }
        });
    }

    _imagePress() {
        //TODO:当选择照片后,再次点击,放大图片,里边有取消按钮
        this.selectPhoto();
    }

    _createBook() {
        this.closeModal(false);
        InteractionManager.runAfterInteractions(() => {
            this.props.navigator.push({
                name: 'NotebookAddPage',
                component: NotebookAddPage,
                params: {
                    onCreated: this._setCreatedBook.bind(this)
                }
            });
        });
    }

    _setCreatedBook(book) {
        const books = [book].concat(this.state.books);
        this.setState({
            selectBookId: book.id,
            books: books,
            bookEmptyError: false,
            loadBookError: false,
        });
    }

    async selectPhoto() {
        // const photoUri = CameraRoll.getPhotos({first: 1})
        // console.log(photoUri);
        let options, deleteIndex, cancelIndex;
        if (this.state.photoUri !== null) {
            options = ['拍照','从相册选择', '删除照片', '取消'];
            deleteIndex = 2;
            cancelIndex = 3
        } else {
            options = ['拍照','从相册选择', '取消'];
            deleteIndex = -1;
            cancelIndex = 2;
        }
        ActionSheetIOS.showActionSheetWithOptions({
            options: options,
            cancelButtonIndex: cancelIndex,
            destructiveButtonIndex: deleteIndex,
            title: '添加照片'
        }, (index) => {
                if (index == deleteIndex) {
                    this.setState({
                        photoSource: null,
                        photoUri: null,
                    });
                } else if (index == cancelIndex) {
                    console.log('cancel');
                } else {
                    let imageSelect = index == 0
                        ? ImagePicker.openCamera({cropping: false}) : ImagePicker.openPicker({cropping: false});
                    imageSelect.then(image => {
                        console.log(image);

                        if (index == 0) {
                            CameraRoll.saveToCameraRoll(image.path);
                        }

                        if (image.size > 1024 * 1024 * 2) {
                            this.resizePhoto(image.path, image.width, image.height).then(newUri => {
                                this.setState({
                                    photoSource: {uri: newUri, isStatic: true},
                                    photoUri: newUri,
                                });
                            });
                        } else {
                            this.setState({
                                photoSource: {uri: image.path, isStatic: true},
                                photoUri: image.path,
                            });
                        }
                    });
                }
            });
    }

    _onChangeText = (text) => {
        if(!this.tempDraft) {
            this.tempDraft = text;
        } else if(Math.abs(text.length - this.tempDraft.length) > 10) {
            Api.saveTempDraft(text);
            this.tempDraft = text;
        }
        this.setState({ content: text });
    };

    _autoSaveTempDraft = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            if (this.state.content.length > 0) {
                Api.saveTempDraft(this.state.content).then(this._autoSaveTempDraft);
            } else {
                this._autoSaveTempDraft()
            }
        }, 10 * 1000)
    };

    render() {
        //console.log(this.state);

        const selectedBook = this.state.books.length > 0
            ? this.state.books.filter(it => it.id == this.state.selectBookId).pop()
            : null;

        const bookButton = selectedBook
            ? (<LabelButton text={selectedBook.subject} icon="ios-book-outline"
                onPress={this.openModal.bind(this)} />)
            : null;

        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <Modal
                    visible={this.state.loading}
                    transparent={true}
                    onRequestClose={() => {}}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.8)" }}>
                        <ActivityIndicator animating={true} color={TPColors.light} />
                    </View>
                </Modal>
                {this.renderSelectBook()}
                <NavigationBar
                    title={this.renderTitle()}
                    rightButton1={{ title: "保存", handler: this._writePress.bind(this) }}
                    leftButton1={{ title: "取消", handler: this._cancelPress.bind(this) }}
                    leftButton={<NavigationBar.Icon name="md-close"
                                                    onPress={this._cancelPress.bind(this)} />}
                    rightButton={<NavigationBar.Icon name="md-checkmark"
                                                     onPress={this._writePress.bind(this)} />}
                />
                <TextInput
                    ref="contentInput"
                    style={{flex: 1, padding: 15, paddingTop: 10, fontSize: 15, lineHeight: 24, color: TPColors.contentText}}
                    autoCorrect={false}
                    maxLength={5000}
                    multiline={true}
                    placeholder="记录点滴生活"
                    value={this.state.content}
                    onChangeText={this._onChangeText}
                />
                <View style={styles.comment_box}>
                    {bookButton}
                    <View style={{flex: 1}} />
                    {this.renderTopicButton()}
                    {this.renderPhotoButton()}
                </View>
                <KeyboardSpacer />
            </View>
        );
    }

    renderTitle() {
        if (this.props.diary) {
            return '修改日记';
        }
        var local = moment.locale('zh-cn');
        const now = TimeHelper.now();
        const time = moment(now);

        return (
            <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 12, color: '#777', paddingBottom: 2}}>{time.format('LL')}</Text>
                <Text style={{fontSize: 11, color: '#777'}}>{time.format('dddd')}</Text>
            </View>

        );

    }

    renderSelectBook() {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={this.state.modalVisible}
                onShow={() => {
                    Animated.parallel([
                        Animated.timing(
                            this.state.fadeAnimOpacity,
                            {toValue: 0.4, duration: 350, easing: Easing.out(Easing.cubic)}
                        ),
                        Animated.timing(
                            this.state.fadeAnimHeight,
                            {toValue: 245, duration: 350, easing: Easing.out(Easing.cubic)}
                        )
                    ]).start();
                }}
            >
                <View style={{ flex: 1}}>
                    <TouchableWithoutFeedback onPress={this.closeModal.bind(this)} style={{flex: 1}}>
                        <Animated.View style={{ flex: 1, backgroundColor: "black", opacity: this.state.fadeAnimOpacity }} />
                    </TouchableWithoutFeedback>
                    <Animated.View style={{height: this.state.fadeAnimHeight, backgroundColor: '#fff'}}>
                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity onPress={this._createBook.bind(this)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>新添</Text>
                            </TouchableOpacity>
                            <Text style={{padding: 10, color: TPColors.contentText}}>选择日记本</Text>
                            <TouchableOpacity onPress={this.closeModal.bind(this)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>取消</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal={true}
                                    contentContainerStyle={{padding: 10, paddingRight: 0}}
                                    keyboardDismissMode="on-drag"
                                    keyboardShouldPersistTaps={true}
                                    automaticallyAdjustInsets={false}
                                    decelerationRate={0}
                                    snapToAlignment="start"
                                    snapToInterval={300}
                                    showsHorizontalScrollIndicator={true}
                        >
                            {this.state.books.map((book) => (
                                <Notebook
                                    key={book.id}
                                    book={book}
                                    style={{paddingRight: 10}}
                                    onPress={() => {
                                        this.setState({selectBookId: book.id});
                                        this.closeModal();
                                    }} />
                            ))}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        );
    }

    renderPhotoButton() {
        if (this.props.diary != null) {
            return null;
        }
        const content = this.state.photoSource != null
            ? (<Image source={this.state.photoSource}
                      style={{width: 30, height: 30}} />)
            : (<Icon name="ios-image-outline" size={30} style={{paddingTop: 4}} color={TPColors.light} />);
        return (
            <TouchableOpacity
                style={{width: 45, height: 40, alignItems: "center", justifyContent: 'center'}}
                onPress={this._imagePress.bind(this)}>
                {content}
            </TouchableOpacity>
        );
    }

    renderTopicButton() {
        if (!this.state.topic) {
            return null;
        }

        return (
            <TouchableOpacity>
                <Text style={{color: TPColors.light, fontSize: 15, paddingRight: 15}}>#{this.state.topic.title}</Text>
            </TouchableOpacity>
        )
    }
}

WritePage.propTypes = {
    diary: React.PropTypes.object,
    onSuccess: React.PropTypes.func,
    topic: React.PropTypes.object,
};

WritePage.defaultProps = {
    diary: null,
    topic: null,
};


const styles = StyleSheet.create({
    comment_box: {
        height: 50,
        backgroundColor: '#fff',
        elevation: 3,
        borderColor: '#bbb',
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingLeft: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    closeButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopColor: '#e2e2e2',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e2e2e2',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    closeButton: {
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    closeButtonText: {
        color: TPColors.light,
        fontSize: 15,
    }
});