import React, { Component } from 'react';
import {
  View,
  TabBarIOS,
} from 'react-native';
import Page from './Page'
import HomeDiaryList from './HomeDiaryList'
import FollowDiaryList from './FollowDiaryList'
import UserPage from './UserPage'
import Icon from 'react-native-vector-icons/Ionicons';
import WritePage from './WritePage'
import MessagePage from './MessagePage'
import NotificationCenter from '../common/NotificationCenter'
var PureRenderMixin = require('react-addons-pure-render-mixin');

export default class HomePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'tips',  //提前让提醒页面初始化
        tipCount: null,
    };

    this.updateTipCount = this.updateTipCount.bind(this);
      this._onWriteDiary = this._onWriteDiary.bind(this);
      this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

    componentDidMount() {
        NotificationCenter. addLister('tipCount', this.updateTipCount);
        NotificationCenter. addLister('onWriteDiary', this._onWriteDiary);
        this.setState({
            selectedTab: 'home'
        })
    }

    componentWillUnmount() {
        NotificationCenter.removeLister('tipCount', this.updateTipCount);
        NotificationCenter.removeLister('onWriteDiary', this._onWriteDiary);
    }

    updateTipCount(count) {
        this.setState({
            tipCount: count > 0 ? count : null
        });
    }

    _onWriteDiary() {
        this.setState({
            selectedTab: 'my'
        })
    }

  render() {
    const titleConfig = {
      title: '胶囊日记'
    };

    return (
      <TabBarIOS translucent={false} barTintColor="#F9F9F9">

        <Icon.TabBarItemIOS
          title="首页"
          iconName="ios-home-outline"
          selectedIconName="ios-home"
          selected={this.state.selectedTab == 'home'}
          onPress={() => {
              if (this.state.selectedTab == 'home') {
                  this.refs.homeList.refresh();
                  return;
              }
            this.setState({
              selectedTab: 'home'
            });
          }}>
          <HomeDiaryList ref="homeList" navigator={this.props.navigator} />
        </Icon.TabBarItemIOS>

        <Icon.TabBarItemIOS
          title="关注"
          iconName="ios-heart-outline"
          selectedIconName="ios-heart"
          selected={this.state.selectedTab == 'follow'}
          onPress={() => {
              if (this.state.selectedTab == 'follow') {
                  this.refs.followList.refresh();
                  return;
              }
            this.setState({
              selectedTab: 'follow'
            });
          }}>
          <FollowDiaryList ref="followList" navigator={this.props.navigator} />
        </Icon.TabBarItemIOS>

        <Icon.TabBarItemIOS
          title="写日记"
          iconName="ios-create-outline"
          selectedIconName="ios-create"
          selected={false}
          onPress={() => {
              this.props.navigator.push({
                  name: 'WritePage',
                  component: WritePage
              })
          }}>
          <View />
        </Icon.TabBarItemIOS>

        <Icon.TabBarItemIOS
          title="提醒"
          iconName="ios-notifications-outline"
          selectedIconName="ios-notifications"
          selected={this.state.selectedTab == 'tips'}
          badge={this.state.tipCount}
          onPress={() => {
              this.setState({
                  selectedTab: 'tips'
              });
          }}>
          <MessagePage navigator={this.props.navigator} />
        </Icon.TabBarItemIOS>

        <Icon.TabBarItemIOS
          title="我的"
          iconName="ios-contact-outline"
          selectedIconName="ios-contact"
          selected={this.state.selectedTab == 'my'}
          onPress={() => {
            this.setState({
              selectedTab: 'my'
            });
          }}>
          <UserPage navigator={this.props.navigator} myself={true} selectedIndex={1} />
        </Icon.TabBarItemIOS>

      </TabBarIOS>
    );
  }
}
