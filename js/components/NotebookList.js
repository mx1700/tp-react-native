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
import Notebook from './Notebook'

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
        //console.log('render books')
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
                style={this.props.style}
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
        return <Notebook book={book} onPress={() => this._bookPress(book)} />
    }
}