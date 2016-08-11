import React, {Component} from 'react';
import {
    StyleSheet,
    ToolbarAndroid,
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
import TPColors from '../common/TPColors'
var GridView = require('../common/GridView');

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
        }
    }

    componentWillMount(){
        InteractionManager.runAfterInteractions(() => {
            this._loadBooks();
        });
    }

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
        console.log(books);
    }

    render() {
        return (
            <GridView
                itemsPerRow={2}
                renderFooter={null}
                onEndReached={null}
                scrollEnabled={true}
                renderSeparator={null}
                items={this.state.books}
                fillIncompleteRow={false}
                renderItem={this._renderBook}
                //renderSectionHeader={this._renderHeader}
                automaticallyAdjustContentInsets={false}
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
        return (
            <TouchableOpacity key={book.id} style={{flex: 1, alignItems:'center', paddingBottom: 15}}>
                <View style={{borderWidth:StyleSheet.hairlineWidth, borderColor: '#e5e5e5', backgroundColor: '#f8f8f8', alignItems:'center', paddingBottom: 5}}>
                    <Image style={{width: 140, height: 105}} source={{uri: book.coverUrl}} />
                    <View style={{alignItems: 'center', justifyContent: 'center', padding: 5, height: 55}}>
                        <Text>{book.subject}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: TPColors.inactiveText}}>{book.created} 创建</Text>
                    <Text style={{ fontSize: 10, color: TPColors.inactiveText}}>{book.expired} 过期</Text>
                </View>
            </TouchableOpacity>
        )
    }
}