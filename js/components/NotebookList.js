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
} from 'react-native';
import * as Api from '../Api'
import NotebookPage from './NotebookPage'
import TPColors from '../common/TPColors'
var GridView = require('../common/GridView');
import NotificationCenter from '../common/NotificationCenter'

export default class NotebookList extends Component {

    static propTypes = {
        userId: React.PropTypes.number,
        mySelf: React.PropTypes.bool,
    };

    static defaultProps = {

    };

    constructor(props) {
        super(props);
        this.state = {
            books: [],
            refreshing: false,
        };
        this._onAddNotebook = this._onAddNotebook.bind(this);
    }

    componentDidMount(){
        //InteractionManager.runAfterInteractions(() => {
            this._loadBooks();
        //});
        if (this.props.mySelf) {
            NotificationCenter.addLister('onAddNotebook', this._onAddNotebook)
        }
    }

    componentWillUnmount() {
        if (this.props.mySelf) {
            NotificationCenter.removeLister('onAddNotebook', this._onAddNotebook)
        }
    }

    _onAddNotebook() {
        InteractionManager.runAfterInteractions(() => {
            this._loadBooks().done();
        });
    }

    // init() {
    //     if (!this.loadingOnes) {
    //         this._onRefresh();
    //     }
    //     this.loadingOnes = true;
    // }

    _onRefresh() {
        this._loadBooks();
    }

    async _loadBooks() {
        this.setState({
            refreshing: true
        });
        let books;
        try {
            books = this.props.mySelf
                ? await Api.getSelfNotebooks()
                : await Api.getUserNotebooks(this.props.userId);
        } catch(err) {
            console.log(err);   //TODO:友好提示
            this.setState({
                refreshing: false,
            });
        }

        this.setState({
            books: books,
            refreshing: false,
        });
        //console.log(books);
    }

    _bookPress(book) {
        this.props.navigator.push({
            name: 'NotebookPage',
            component: NotebookPage,
            params: {
                notebook: book
            }
        })
    }

    render() {
        console.log('render books')
        return (
            <GridView
                itemsPerRow={2}
                renderFooter={null}
                onEndReached={null}
                scrollEnabled={true}
                renderSeparator={null}
                items={this.state.books}
                fillIncompleteRow={false}
                renderItem={this._renderBook.bind(this)}
                //renderSectionHeader={this._renderHeader}
                automaticallyAdjustContentInsets={false}
                removeClippedSubviews={false}
                style={[{paddingTop: 15}, this.props.style]}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        colors={[TPColors.light]}
                        tintColor={TPColors.light} />
                }
            />
        );
    }

    _renderBook(book) {
        const exp = book.isExpired ? '已过期' : '未过期';
        const label = book.isPublic ? null : (
            <Text style={{height: 14, fontSize: 10, padding: 2, marginRight: 10, backgroundColor: 'red', color: 'white', opacity: 0.75}}>私密</Text>
        );
        return (
            <TouchableOpacity key={book.id} onPress={() => this._bookPress(book)} style={{flex: 1, alignItems:'center', paddingBottom: 15}}>
                <View style={{
                    width: 140,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 0 },
                    backgroundColor: '#fff',
                    alignItems:'center',
                    paddingBottom: 5,
                }}>
                    <Image style={{width: 140, height: 105, flexDirection: 'row', justifyContent: 'flex-end'}} source={{uri: book.coverUrl}}>
                        {label}
                    </Image>
                    <View style={{alignItems: 'center', justifyContent: 'center', padding: 5, height: 55}}>
                        <Text style={{textAlign: 'center', fontWeight: 'bold', color: TPColors.contentText}}>{book.subject}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: TPColors.inactiveText}}>{exp}</Text>
                    <Text style={{ fontSize: 10, color: TPColors.inactiveText}}>{book.created}至{book.expired}</Text>
                </View>
            </TouchableOpacity>
        )
    }
}