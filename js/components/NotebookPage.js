import React, {Component} from 'react';
import {
    StyleSheet,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Text,
    InteractionManager,
    View,
    Image,
    TouchableOpacity,
    ListView
} from 'react-native';
import * as Api from '../Api'
import TPColors from '../common/TPColors'
import Diary from './Diary'
import NavigationBar from 'NavigationBar'
import ErrorView from '../common/ErrorListView'
import DiaryPage from './DiaryPage'
var moment = require('moment');

export default class NotebookPage extends Component {
    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
        });
        this.state = {
            diaries: {},
            diariesDateSource: ds,
            page: 1,
            page_size: 20,
            more: false,
            loading_more: false,
            refreshing: false,
            emptyList: false,
            errorPage: false,
            loadMoreError: false,
        };
    }

    componentWillMount(){
        InteractionManager.runAfterInteractions(() => {
            this._loadDiaries(this.state.page).done();
        });
    }

    _onRefresh() {
        this._loadDiaries(1).done()
    }

    _onEndReached() {
        this._loadDiaries(1).done()
    }

    async _loadDiaries(page) {
        if (page === 1 && this.state.refreshing === false) {
            this.setState({refreshing: true});
        }
        if (page > 1) {
            this.setState({ loading_more: true });
        }
        let data = null;
        try {
            data = await Api.getNotebookTodayDiaries(this.props.notebook.id, page, this.state.page_size);
        } catch(e) {
            console.log(e);
        }

        if (data) {
            if (page === 1) {
                this.state.diaries = {};
            }

            const today = moment().format('YYYY年M月D日');
            const diaries = data.items.reduce((list, item) => {
                const [year, month, day] =
                    item.created.substr(0, 10).split('-')
                    .map(it => Number.parseInt(it));

                let date = `${year}年${month}月${day}日`;
                if (date == today) {
                    date = '今天';
                }
                if (list[date] === undefined) {
                    list[date] = [];
                }
                list[date].push(item);
                return list;
            }, this.state.diaries);

            this.setState({
                diaries: diaries,
                diariesDateSource: this.state.diariesDateSource.cloneWithRowsAndSections(diaries),
                page: data.page,
                more: data.items.length === this.state.page_size,
                refreshing: false,
                loading_more: false,
                emptyList: page === 1 && data.items.length == 0,
                errorPage: false,
                loadMoreError: false,
            });
        } else {
            if (page == 1) {
                diaries = {};
                this.setState({
                    diaries: diaries,
                    diariesDateSource: this.state.diariesDateSource.cloneWithRowsAndSections(diaries),
                    page: 1,
                    more: false,
                    refreshing: false,
                    loading_more: false,
                    emptyList: false,
                    errorPage: true,
                    loadMoreError: false,
                });
            } else {
                this.setState({
                    refreshing: false,
                    loading_more: false,
                    loadMoreError: true,
                });
            }
        }
    }

    _onEndReached() {
        if(this.state.refreshing || this.state.loading_more || !this.state.more) {
            return;
        }
        this._loadDiaries(this.state.page + 1);
    }

    _onDiaryPress(diary) {
        this.props.navigator.push({
            name: 'DiaryPage',
            component: DiaryPage,
            params: {
                diary: diary
            }
        })
    }

    _onActionPress(diary) {
        alert('action')
    }

    render() {
        const navAttrs = {
            leftButton: {
                title: "后退",
                handler: () => {
                    this.props.navigator.pop()
                }
            }
        };

        const title = `《${this.props.notebook.subject}》`;

        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <NavigationBar
                    title={title}
                    {...navAttrs}
                />
                {this.renderList()}
            </View>
        );
    }

    renderList() {
        return (
            <ListView
                dataSource={this.state.diariesDateSource}
                renderRow={(rowData) =>
                    <Diary data={rowData}
                           onPress={this._onDiaryPress.bind(this)}
                           editable={this.props.editable}
                           showBookSubject={false}
                           deletable={this.props.deletable}
                           onActionPress={this._onActionPress.bind(this)}
                           navigator={this.props.navigator} />
                }
                renderSectionHeader={(s, id) =>
                    <View style={{backgroundColor: '#f5f5f5', paddingHorizontal: 15, paddingVertical: 8}}>
                        <Text style={{color: TPColors.contentText}}>{id}</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        enabled={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        colors={[TPColors.light]}
                        tintColor={TPColors.light} />
                }
                onEndReached={this._onEndReached.bind(this)}
                onEndReachedThreshold={200}
                renderFooter={this.renderFooter.bind(this)}
                enableEmptySections={true}
                automaticallyAdjustContentInsets={false}
                //renderHeader={() => <View style={{height: 4}}></View>}
                // onScroll={(event) => console.log(event.nativeEvent)}
                style={this.props.style}
            />
        );
    }

    renderFooter() {
        if (this.state.errorPage) {
            return <ErrorView text="日记加载失败了 :(" button="重试一下" onButtonPress={this._onRefresh.bind(this)}/>
        }

        if (this.state.emptyList) {
            return (<ErrorView text="没有日记"/>);
        }

        if (!this.state.loading_more && this.state.loadMoreError) {
            return (
                <View style={{height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                    <TouchableOpacity style={{marginTop: 15}} onPress={this._onEndReached.bind(this)}>
                        <Text style={{color: TPColors.light}}>加载失败,请重试</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (this.state.refreshing || Object.getOwnPropertyNames(this.state.diaries).length == 0) {
            return null;
        }
        var content = this.state.more ?
            (<ActivityIndicator animating={true} color={TPColors.light} size="small"/>) :
            (<Text style={{color: TPColors.inactiveText, fontSize: 12}}>—— THE END ——</Text>);

        return (
            <View style={{height: 100, justifyContent: "center", alignItems: "center", paddingBottom: 5}}>
                {content}
            </View>
        );
    }
}