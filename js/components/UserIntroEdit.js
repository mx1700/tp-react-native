import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ToolbarAndroid,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Modal
} from 'react-native';
import Page from './Page'
import NavigationBar from 'NavigationBar'
import * as Api from '../Api'
import Icon from 'react-native-vector-icons/Ionicons';
import TPColors from '../common/TPColors'
import NotificationCenter from '../common/NotificationCenter'
import ImagePicker from 'react-native-image-picker'
import LoadingModal from '../common/LoadingModal'
import ImageResizer from 'react-native-image-resizer'

export default class UserIntroEdit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            loading: false,
        };
        this._updateUserInfo = this._updateUserInfo.bind(this);
    }

    componentWillMount(){
        this._loadUser().done();
    }

    componentDidMount() {
        NotificationCenter.addLister('updateUserInfo', this._updateUserInfo)
    }

    componentWillUnmount() {
        NotificationCenter.removeLister('updateUserInfo', this._updateUserInfo)
    }

    _updateUserInfo() {
        this._loadUser().done();
    }

    async _loadUser() {
        const user = await Api.getSelfInfoByStore();
        this.setState({user: user});
    }

    _editIcon() {
        var options = {
            title: '修改头像',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: '拍照',
            chooseFromLibraryButtonTitle: '从相册选择',
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        ImagePicker.showImagePicker(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else {
                const source = Platform.OS === 'ios'
                    ? {uri: response.uri.replace('file://', ''), isStatic: true}
                    : {uri: response.uri, isStatic: true};
                //
                // this.setState({
                //     photoSource: source,
                //     photoUri: response.uri,
                //     photoInfo: {
                //         fileSize: response.fileSize,
                //         width: response.width,
                //         height: response.height,
                //         isVertical: response.isVertical
                //     }
                // });

                this._uploadIcon(response.uri, response.width, response.height)
            }
        });
    }

    async _uploadIcon(uri, width, height) {
        const newUri = await this.resizePhoto(uri, width, height);
        this.setState({loading: true});
        let user;
        try {
            user = await Api.updateUserIcon(newUri);
        } catch (err) {
            console.log(err);
             Alert.alert('更新失败', err.message);
        } finally {
            this.setState({loading: false})
        }

        if (user) {
            await Api.updateUserInfoStore(user);
            await this._loadUser();
            NotificationCenter.trigger('updateUserInfo');
            Alert.alert('提示', '头像修改成功')
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
        console.log('resize to :', width, height);
        const newUri = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 75)
        return 'file://' + newUri;
    }

    _editName() {
        this.props.navigator.push({
            name: 'UserIntroEditName',
            component: UserIntroEditName,
            params: {
                user: this.state.user
            }
        })
    }

    _editIntro() {
        this.props.navigator.push({
            name: 'UserIntroEditIntro',
            component: UserIntroEditIntro,
            params: {
                user: this.state.user
            }
        })
    }

    render() {
        let content;
        if (!this.state.user) {
            content = null;
        } else {
            const user = this.state.user;
            content = (
                <View style={styles.group}>
                    <TouchableOpacity style={styles.item} onPress={this._editIcon.bind(this)}>
                        <Text style={styles.title}>头像</Text>
                        <View style={styles.right}>
                            <Image source={{uri: user.iconUrl}} style={{width: 28, height: 28, borderRadius: 14}} />
                            <Icon name="ios-arrow-forward" style={styles.arrow} size={18}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <TouchableOpacity style={styles.item} onPress={this._editName.bind(this)}>
                        <Text style={styles.title}>名字</Text>
                        <View style={styles.right}>
                            <Text style={styles.value}>{user.name}</Text>
                            <Icon name="ios-arrow-forward" style={styles.arrow} size={18}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <TouchableOpacity style={styles.item} onPress={this._editIntro.bind(this)}>
                        <Text style={styles.title}>个人简介</Text>
                        <Icon name="ios-arrow-forward" style={styles.arrow} size={18}/>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
                <LoadingModal loading={this.state.loading} />
                <NavigationBar
                    title="修改个人信息"
                    backPress={() => { this.props.navigator.pop() }}
                />
                {content}
            </View>
        );
    }
}

const styles = StyleSheet.create({
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
    right: {
        flexDirection:'row',
        alignItems: 'center'
    },
    arrow: {
        paddingTop: 1,
        color: TPColors.inactiveText,
        paddingLeft: 15,
    },
    value: {
        fontSize: 16,
        color: TPColors.inactiveText,
    },
    button: {
        flex: 1,
        textAlign: 'center',
        color: '#d9534f',
        fontSize: 16,
    }
});


class UserIntroEditName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.user.name,
            loading: false,
        }
    }

    _savePress() {
        const len = this.state.name.length;
        if (len == 0) {
            Alert.alert('提示', '名字不能为空');
            return;
        } else if (len > 10) {
            Alert.alert('提示', '名字不能超过10个字');
            return;
        }

        this.save().done();
    }

    async save() {
        this.setState({loading: true});
        let user;
        try {
            user = await Api.updateUserInfo(this.state.name, this.props.user.intro)
        } catch (err) {
            Alert.alert('保存失败', err.message);
        } finally {
            this.setState({loading: false});
        }

        if (user) {
            this.props.navigator.pop();
            await Api.updateUserInfoStore(user);
            NotificationCenter.trigger('updateUserInfo');
        }
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
                <LoadingModal loading={this.state.loading} />
                <NavigationBar
                    title="修改名字"
                    backPress={() => { this.props.navigator.pop() }}
                    rightButton={{ title: "保存", handler: this._savePress.bind(this) }}
                />
                <View style={styles.group}>
                    <View style={styles.item}>
                        <Text style={styles.title}>名字</Text>
                        <TextInput
                            value={this.state.name}
                            onChangeText={(text) => this.setState({name: text})}
                            style={{flex: 1, fontSize: 16, marginLeft: 15, paddingTop: 2, color: TPColors.contentText}}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

class UserIntroEditIntro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            intro: props.user.intro,
            loading: false,
        }
    }

    _savePress() {
        const len = this.state.intro.length;
        if (len == 0) {
            Alert.alert('提示', '简介不能为空');
            return;
        } else if (len > 500) {
            Alert.alert('提示', '简介不能超过500个字');
            return;
        }

        this.save().done();
    }

    async save() {
        this.setState({loading: true});
        let user;
        try {
            user = await Api.updateUserInfo(this.props.user.name, this.state.intro)
        } catch (err) {
            Alert.alert('保存失败', err.message);
        } finally {
            this.setState({loading: false});
        }

        if (user) {
            this.props.navigator.pop();
            await Api.updateUserInfoStore(user);
            NotificationCenter.trigger('updateUserInfo');
        }
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#EFEFF4'}}>
                <LoadingModal loading={this.state.loading} />
                <NavigationBar
                    title="修改个人简介"
                    backPress={() => { this.props.navigator.pop() }}
                    rightButton={{ title: "保存", handler: this._savePress.bind(this) }}
                />
                <View style={styles.group}>
                        <TextInput
                            value={this.state.intro}
                            onChangeText={(text) => this.setState({intro: text})}
                            multiline={true}
                            style={{flex: 1, fontSize: 16, margin: 15, color: TPColors.contentText, height: 320}}
                        />
                </View>
            </View>
        );
    }
}