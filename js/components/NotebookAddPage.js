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
    TouchableOpacity,
    Alert,
    Switch,
    InteractionManager,
    ActionSheetIOS,
    TouchableWithoutFeedback
} from 'react-native';
import * as Api from '../Api'
import {
    NotificationCenter,
    NavigationBar,
    TPColors,
    LoadingModal,
    TimeHelper,
} from '../common'
import ImagePicker from 'react-native-image-crop-picker'
import ImageResizer from 'react-native-image-resizer'
import Toast from 'react-native-root-toast';

const dismissKeyboard = require('dismissKeyboard');

export default class NotebookAddPage extends Component {

    constructor(props) {
        super(props);
        const today = TimeHelper.now();
        const date = TimeHelper.now();
        date.setMonth(today.getMonth() + 1);
        const start = TimeHelper.now();
        start.setMonth(today.getMonth() + 1);
        const end = TimeHelper.now();
        end.setFullYear(today.getFullYear() + 1);
        end.setDate(end.getDate() - 1);

        this.state = {
            subject: this.props.notebook ? this.props.notebook.subject : '',
            date: date,
            pub: this.props.notebook ? this.props.notebook.isPublic : true,
            modalVisible: false,
            start: start,
            end: end,
            loading: false,
            fadeAnimOpacity: new Animated.Value(0),
            fadeAnimHeight: new Animated.Value(0),
        }
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            if (!this.props.notebook && this.refs.subjectInput) {
                this.refs.subjectInput.focus();
            }
        });
    }

    createPress() {
        if (this.state.subject.length == 0) {
            Toast.show("请填写主题", {
                duration: 2000,
                position: 250,
                shadow: false,
                hideOnPress: true,
            });
            return;
        }
        if (this.state.subject.length > 20) {
            Toast.show("主题不能超过20个字", {
                duration: 2000,
                position: 250,
                shadow: false,
                hideOnPress: true,
            });
            return;
        }
        this.createBook();
    }

    async createBook() {
        const date = this.state.date;
        const dateString = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        let book, error;
        try {
            this.setState({loading: true});
            if (!this.props.notebook) {
                book = await Api.createNotebook(this.state.subject, '', dateString, this.state.pub ? 10 : 1);
            } else {
                book = await Api.updateNotebook(this.props.notebook.id, this.state.subject,
                    this.props.notebook.description, this.state.pub ? 10 : 1)
            }
            this.setState({loading: false});
            //console.log(book);
        } catch (err) {
            this.setState({loading: false});
            console.log(err);
            error = err;
        } finally {

        }

        InteractionManager.runAfterInteractions(() => {
            if (book) {
                dismissKeyboard();
                this.props.navigator.pop();
                if (this.props.onCreated) {
                    this.props.onCreated(book);
                }
                if (this.props.onSaved) {
                    this.props.onSaved(book);
                }
                NotificationCenter.trigger('onAddNotebook');
                Toast.show(!this.props.notebook ? '创建完成' : '保存完成', {
                    duration: 2000,
                    position: -80,
                    shadow: false,
                    hideOnPress: true,
                });
            } else {
                let msg = (!this.props.notebook ? '创建日记本失败' : '修改日记本失败') + "\n" + error.message;
                Toast.show(msg, {
                    duration: 2000,
                    position: 250,
                    shadow: false,
                    hideOnPress: true,
                });
            }
        });
    }

    openModal() {
        this.setState({modalVisible: true});
    }

    closeModal() {
        Animated.parallel([
            Animated.timing(
                this.state.fadeAnimOpacity,
                {toValue: 0, duration: 350, easing: Easing.out(Easing.cubic)}
            ),
            Animated.timing(
                this.state.fadeAnimHeight,
                {toValue: 0, duration: 350, easing: Easing.out(Easing.cubic)}
            )
        ]).start(() => {
            this.setState({modalVisible: false});
        });
    }

    _editCover() {
        ActionSheetIOS.showActionSheetWithOptions({
            options: ['拍照', '从相册选择', '取消'],
            cancelButtonIndex: 2,
            title: '设置封面'
        }, (index) => {
            if (index == 2) {
                console.log('cancel')
            } else {
                let imageOption = {
                    width: 640,
                    height: 480,
                    cropping: true
                };
                let imageSelect = index == 0
                    ? ImagePicker.openCamera(imageOption) : ImagePicker.openPicker(imageOption);
                imageSelect.then(image => {
                    setTimeout(() => {  //这个 sleep 没有实际意义，只为解决 modal 不消失的 bug
                        this._uploadIcon(image.path, image.width, image.height)
                    }, 500);
                })
            }
        });
    }

    async _uploadIcon(uri, width, height) {
        const newUri = await this.resizePhoto(uri, width, height);
        let book, error;
        try {
            this.setState({loading: true});
            book = await Api.updateNotebookCover(this.props.notebook.id, newUri);
        } catch (err) {
            console.log(err);
            error = err;
        }
        this.setState({loading: false});

        if (book) {
            Toast.show("封面保存成功", {
                duration: 2000,
                position: -80,
                shadow: false,
                hideOnPress: true,
            });
            if (this.props.onCreated) {
                this.props.onCreated(book);
            }
            if (this.props.onSaved) {
                this.props.onSaved(book);
            }
            NotificationCenter.trigger('onAddNotebook');
        } else {
            Toast.show("封面保存失败\n" + error.message, {
                duration: 2000,
                position: 250,
                shadow: false,
                hideOnPress: true,
            });
        }
    }

    async resizePhoto(uri, oWidth, oHeight) {
        //图片最大 1440 * 900 像素
        let width = 0;
        let height = 0;
        let maxPixel = 640 * 640;
        let oPixel = oWidth * oHeight;
        if (oPixel > maxPixel) {
            width = Math.sqrt(oWidth * maxPixel / oHeight);
            height = Math.sqrt(oHeight * maxPixel / oWidth);
        } else {
            width = oWidth;
            height = oHeight;
        }
        //console.log('resize to :', width, height);
        const newUri = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 75)
        return 'file://' + newUri;
    }

    _deleteBook() {
        Api.deleteNotebook(this.props.notebook.id)
            .then(() => {
                NotificationCenter.trigger('onAddNotebook');
                Alert.alert('提示', '日记本已删除', [{text: '好', onPress: () =>  {
                    this.props.navigator.popToTop();
                }}]);
            })
            .catch((err) => {
                Alert.alert('删除失败', err.message)
            });
    }

    render() {
        const date = this.state.date;
        const dateString = `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
        const title = !this.props.notebook ? '创建日记本' : '修改日记本';

        const dataSelect = this.props.notebook ? null : (
          <View>
              <View style={styles.item}>
                  <Text style={styles.title}>过期时间</Text>
                  <TouchableOpacity onPress={this.openModal.bind(this)}>
                      <Text style={{fontSize:16, color: TPColors.light}}>
                          {dateString}
                      </Text>
                  </TouchableOpacity>
              </View>
              <View style={styles.line} />
          </View>
        );

        const setCoverView = !this.props.notebook ? null : (
            <View style={styles.group}>
                <TouchableOpacity style={styles.item} onPress={this._editCover.bind(this)}>
                    <Text style={{flex: 1, textAlign: 'center', color: TPColors.light, fontSize: 16}}>设置封面</Text>
                </TouchableOpacity>
            </View>
        );

        const deleteView = !this.props.notebook ? null : (
            <View>
                <View style={styles.group}>
                    <TouchableOpacity style={styles.item} onPress={this._deleteBook.bind(this)}>
                        <Text style={{flex: 1, textAlign: 'center', color: '#d9534f', fontSize: 16}}>删除</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{fontSize: 12, padding: 10, paddingTop: 8, color: TPColors.inactiveText}}>提示：有日记的日记本不能被删除</Text>
            </View>
        );

        //console.log(dataSelect);
//                <LoadingModal loading={this.state.loading} />

        //console.log('this.state.loading',this.state.loading);
        return (
            <View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
                <Modal
                    visible={this.state.loading}
                    transparent={true}
                    onRequestClose={() => {}}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.8)" }}>
                        <ActivityIndicator animating={true} color={TPColors.light} />
                    </View>
                </Modal>
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => { }}
                    onShow={() => {
                        Animated.parallel([
                            Animated.timing(
                                this.state.fadeAnimOpacity,
                                {toValue: 0.4, duration: 350, easing: Easing.out(Easing.cubic)}
                            ),
                            Animated.timing(
                                this.state.fadeAnimHeight,
                                {toValue: 250, duration: 350, easing: Easing.out(Easing.cubic)}
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
                                <TouchableOpacity onPress={ this.closeModal.bind(this) } style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>确定</Text>
                                </TouchableOpacity>
                            </View>
                            <DataPicker
                                value={this.state.date}
                                start={this.state.start}
                                end={this.state.end}
                                onChange={(v) => { this.setState({date: v}) }}
                            />
                        </Animated.View>
                    </View>
                </Modal>
                <NavigationBar
                    title={title}
                    backPress={() => {
                        dismissKeyboard();
                        this.props.navigator.pop()
                    }}
                    rightButton={{
                        title: "保存",
                        handler: this. createPress.bind(this)
                    }}
                />
                <View style={styles.group}>
                    <View style={styles.item}>
                        <TextInput
                            ref="subjectInput"
                            style={{flex: 1, fontSize: 16}}
                            placeholder="主题"
                            value={this.state.subject}
                            onChangeText={(text) => this.setState({subject: text})}
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.line} />
                    {dataSelect}
                    <View style={styles.item}>
                        <Text style={styles.title}>公开日记本</Text>
                        <Switch
                            value={this.state.pub}
                            onValueChange={(v) => this.setState({pub: v})}
                        />
                    </View>
                </View>
                {setCoverView}
                {deleteView}
            </View>
        );
    }
}

function DataPicker(props) {
    const value = new Date(props.value.getTime());
    const start = new Date(props.start.getTime());
    const end = new Date(props.end.getTime());

    const year = value.getFullYear();
    const month = value.getMonth() + 1;
    const day = value.getDate();

    const years = range(start.getFullYear(), end.getFullYear());
    let months = null;
    let days = null;

    let monthStart = 1, monthEnd = 12;
    if (year == start.getFullYear()) {
        monthStart = start.getMonth() + 1;
    }
    if (year == end.getFullYear()) {
        monthEnd = end.getMonth() + 1;
    }
    months = range(monthStart, monthEnd);

    let dayStart = 1, dayEnd = new Date(year, month, 0).getDate();
    if (year == start.getFullYear() && month == start.getMonth() + 1) {
        dayStart = start.getDate();
    } else if (year == end.getFullYear() && month == end.getMonth() + 1) {
        dayEnd = end.getDate();
    }
    days = range(dayStart, dayEnd);

    return (
        <View style={{flexDirection: 'row'}}>
            <Picker
                style={{ flex: 1}}
                selectedValue={year}
                onValueChange={(v) => {
                    value.setFullYear(v);
                    let r = value;
                    if (value < start) r = start;
                    if (value > end) r = end;
                    props.onChange(r)
                }}>
                {years.map((year) => (
                    <Picker.Item key={year} label={`${year}年`} value={year} />
                ))}
            </Picker>
            <Picker
                style={{ flex: 1}}
                selectedValue={month}
                onValueChange={(v) => {
                    const monthDays = new Date(value.getFullYear(), v, 0).getDate();
                    let day = value.getDate();
                    if (day > monthDays) {
                        day = monthDays;
                    }
                    value.setDate(day);
                    value.setMonth(v - 1);
                    let r = value;
                    if (value < start) r = start;
                    if (value > end) r = end;
                    props.onChange(r)
                }}>
                {months.map((month) => (
                    <Picker.Item key={month} label={`${month}月`} value={month} />
                ))}
            </Picker>
            <Picker
                style={{ flex: 1}}
                selectedValue={day}
                onValueChange={(v) => {
                    value.setDate(v);
                    let r = value;
                    if (value < start) r = start;
                    if (value > end) r = end;
                    props.onChange(r)
                }}>
                {days.map((day) => (
                    <Picker.Item key={day} label={`${day}日`} value={day} />
                ))}
            </Picker>
        </View>
    );
}

function range(start, end) {
    let ret = [];
    for(let i = start; i <= end; i++) {
        ret.push(i)
    }
    return ret;
}

const styles = StyleSheet.create({
    closeButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
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
    },
    group: {
        marginTop: 30,
        backgroundColor: 'white',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#c8c7cc'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 45,
    },
    title: {
        fontSize: 16,
        color: '#222222',
    },
    line: {
        marginLeft: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#c8c7cc'
    },
    arrow: {
        paddingTop: 1,
        color: TPColors.inactiveText,
    },
    button: {
        flex: 1,
        textAlign: 'center',
        color: '#d9534f',
        fontSize: 16,
    }
});