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
    Modal,
    InteractionManager,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import Page from './Page'
import * as Api from '../Api'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import NavigationBar from 'NavigationBar'
import LabelButton from '../common/LabelButton'
import NotificationCenter from '../common/NotificationCenter'
import ImagePicker from 'react-native-image-picker'
import TPColor from '../common/TPColors'
import Icon from 'react-native-vector-icons/Ionicons'
import ImageResizer from 'react-native-image-resizer'
import NotebookAddPage from './NotebookAddPage'
var Fabric = require('react-native-fabric');
var { Answers } = Fabric;

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
            photoInfo: null,
        };
    }

    componentWillMount(){
        InteractionManager.runAfterInteractions(() => {
            this._loadBooks();
        });
    }

    componentDidMount() {
        this.refs.contentInput.focus();
    }

    async _loadBooks() {
        let books = [];
        try {
            books = await Api.getSelfNotebooks();
        } catch(err) {
            console.log(err);
            Alert.alert('错误', '日记本加载失败');
            return;
        }
        const abooks = books.filter(it => !it.isExpired);
        if (abooks.length == 0) {
            Alert.alert('提示','没有可用日记本,无法写日记',[
                {text: '取消', onPress: () =>  this.props.navigator.pop()},
                {text: '创建一个', onPress: () => this._createBook()}
            ]);
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
        if (this.state.selectBookId == 0) {
            Alert.alert('提示','日记本列表加载失败');
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
        if(photoUri) {
            if (this.state.photoInfo.fileSize > 1024 * 1024) {
                photoUri = await this.resizePhoto(photoUri);
            }
        }
        let r = null;
        try {
            r = this.props.diary == null
                ? await Api.addDiary(this.state.selectBookId,
                                    this.state.content,
                                    photoUri)
                : await Api.updateDiary(this.props.diary.id,
                                    this.state.selectBookId,
                                    this.state.content);
            console.log('write:', r);
        } catch (err) {
            console.log(err);
            Alert.alert('错误', '日记保存失败');
            return;
        } finally {
            this.setState({loading: false});
        }


        if (r) {
            this.props.navigator.pop();
            NotificationCenter.trigger('onWriteDiary');
            const type = photoUri == null ? 'text' : 'photo';
            Answers.logCustom('WriteDiary', { type: type })
        }
    }

    async resizePhoto(uri) {
        //图片最大 1440 * 900 像素
        let width = 0;
        let height = 0;
        let oWidth = this.state.photoInfo.width;
        let oHeight = this.state.photoInfo.height;
        let maxPixel = 1440 * 900;
        let oPixel = oWidth * oHeight;
        if (oPixel > maxPixel) {
            width = Math.sqrt(oWidth * maxPixel / oHeight);
            height = Math.sqrt(oHeight * maxPixel / oWidth);
        } else {
            width = this.state.photoInfo.width;
            height = this.state.photoInfo.height;
        }
        console.log('resize to :', width, height);
        const newUri = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 75)
        return 'file://' + newUri;
    }

    _cancelPress() {
        //TODO:增加取消确认
        //关闭键盘
        this.refs.contentInput.setNativeProps({'editable':false});
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

    _createBook() {
        this.setState({modalVisible: false});
        this.props.navigator.push({
            name: 'NotebookAddPage',
            component: NotebookAddPage,
            params: {
                onCreated: this._setCreatedBook.bind(this)
            }
        })
    }

    _setCreatedBook(book) {
        const books = [book].concat(this.state.books);
        this.setState({
            selectBookId: book.id,
            books: books,
        });
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
                    photoInfo: {
                        fileSize: response.fileSize,
                        width: response.width,
                        height: response.height,
                        isVertical: response.isVertical
                    }
                });
            }
        });
    }

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
                        <ActivityIndicator animating={true} color={TPColor.light} />
                    </View>
                </Modal>
                {this.renderSelectBook()}
                <NavigationBar
                    title={this.props.diary == null ? '写日记' : '修改日记'}
                    rightButton={{ title: "保存", handler: this._writePress.bind(this) }}
                    leftButton={{ title: "取消", handler: this._cancelPress.bind(this) }}
                />
                <TextInput
                    ref="contentInput"
                    style={{flex: 1, padding: 15, fontSize: 14}}
                    autoCorrect={false}
                    autoFocus={false}
                    maxLength={500}
                    multiline={true}
                    placeholder="记录点滴生活"
                    value={this.state.content}
                    onChangeText={(text) => this.setState({ content: text })}
                />
                <View style={styles.comment_box}>
                    {bookButton}
                    <View style={{flex: 1}} />
                    {this.renderPhotoButton()}
                </View>
                <KeyboardSpacer />
            </View>
        );
    }

    renderSelectBook() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => { }}>
                <View style={{ flex: 1}}>
                    <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }} />
                    <View style={{height: 250, backgroundColor: '#fff'}}>
                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity onPress={ this._createBook.bind(this) } style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>新添日记本</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={ this.closeModal.bind(this) } style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>确定</Text>
                            </TouchableOpacity>
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
        );
    }

    renderPhotoButton() {
        if (this.props.diary != null) {
            return null;
        }
        const content = this.state.photoSource != null
            ? (<Image source={this.state.photoSource}
                      style={{width: 30, height: 30}} />)
            : (<Icon name="ios-image-outline" size={30} style={{paddingTop: 4}} color={TPColor.light} />);
        return (
            <TouchableOpacity
                style={{width: 30, height: 30, alignItems: "center", justifyContent: 'center'}}
                onPress={this._imagePress.bind(this)}>
                {content}
            </TouchableOpacity>
        );
    }
}

WritePage.propTypes = {
    diary: React.PropTypes.object,
};

WritePage.defaultProps = {
    diary: null,
};


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
        color: TPColor.light,
    }
});