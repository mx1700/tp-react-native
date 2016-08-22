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
    TouchableOpacity,
    Alert,
    Switch
} from 'react-native';
import Page from './Page'
import * as Api from '../Api'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import NavigationBar from '../common/NavigationBar'
import NotificationCenter from '../common/NotificationCenter'
import ImagePicker from 'react-native-image-picker'
import TPColors from '../common/TPColors'
import Icon from 'react-native-vector-icons/Ionicons';

export default class NotebookAddPage extends Component {

    constructor(props) {
        super(props);
        const today = new Date();
        const date = new Date();
        date.setMonth(today.getMonth() + 1);
        const start = new Date();
        start.setMonth(today.getMonth() + 1);
        const end = new Date();
        end.setFullYear(today.getFullYear() + 1);
        end.setDate(end.getDate() - 1);

        this.state = {
            subject: '',
            date: date,
            pub: true,
            modalVisible: false,
            start: start,
            end: end,
            loading: false,
        }
    }

    createPress() {
        if (this.state.subject.length == 0) {
            Alert.alert('提示', '请填写主题');
            return;
        }
        if (this.state.subject.length > 10) {
            Alert.alert('提示', '主题不能超过10个字');
            return;
        }
        this.createBook();
    }

    async createBook() {
        this.setState({loading: true});
        const date = this.state.date;
        const dateString = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        let book = null;
        try {
            book = await Api.createNotebook(this.state.subject, '', dateString, this.state.pub ? 10 : 1);
            //console.log(book);
        } catch (err) {
            console.log(err);
            Alert.alert('错误', '创建日记本失败');
        } finally {
            this.setState({loading: false});
        }

        if (book) {
            this.props.navigator.pop();
            if (this.props.onCreated) {
                this.props.onCreated(book);
            }
        }
    }

    openModal() {
        this.setState({modalVisible: true});
    }

    closeModal() {
        this.setState({modalVisible: false});
    }

    render() {
        const date = this.state.date;
        const dateString = `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;

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
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => { }}>
                    <View style={{ flex: 1}}>
                        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }} />
                        <View style={{height: 250, backgroundColor: '#fff'}}>
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
                        </View>
                    </View>
                </Modal>
                <NavigationBar
                    title="创建日记本"
                    back="取消"
                    backPress={() => {
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
                            style={{flex: 1, fontSize: 16}}
                            placeholder="主题"
                            value={this.state.subject}
                            onChangeText={(text) => this.setState({subject: text})}
                            autoCorrect={false}
                            autoFocus={true}
                        />
                    </View>
                    <View style={styles.line} />
                    <View style={styles.item}>
                        <Text style={styles.title}>过期时间</Text>
                        <TouchableOpacity onPress={this.openModal.bind(this)}>
                            <Text style={{fontSize:16, color: TPColors.light}}>
                                {dateString}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.line} />
                    <View style={styles.item}>
                        <Text style={styles.title}>公开日记本</Text>
                        <Switch
                            value={this.state.pub}
                            onValueChange={(v) => this.setState({pub: v})}
                        />
                    </View>
                </View>
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