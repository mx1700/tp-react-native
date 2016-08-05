import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  TabBarIOS,
  Text,
} from 'react-native';
import HomeDiaryList from './HomeDiaryList'
import FollowDiaryList from './FollowDiaryList'
import UserPage from './UserPage'
import Icon from 'react-native-vector-icons/Ionicons';
import WritePage from './WritePage'
import TPColors from '../common/TPColors'
import TPButton from '../common/TPButton';
import MessagePage from './MessagePage'
import NotificationCenter from '../common/NotificationCenter'

export default class HomePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'home',
        tipCount: null,
    };

    this.updateTipCount = this.updateTipCount.bind(this);
  }

    componentDidMount() {
        NotificationCenter. addLister('tipCount', this.updateTipCount)
    }

    componentWillUnmount() {
        NotificationCenter.removeLister('tipCount', this.updateTipCount)
    }

    updateTipCount(count) {
        this.setState({
            tipCount: count > 0 ? count : null
        });
    }

  render() {
    const titleConfig = {
      title: '胶囊日记'
    };

    console.log(this.state);

    return (
      <TabBarIOS translucent={false}>

        <Icon.TabBarItemIOS
          title="首页"
          iconName="ios-home-outline"
          selectedIconName="ios-home"
          selected={this.state.selectedTab == 'home'}
          onPress={() => {
            this.setState({
              selectedTab: 'home'
            });
          }}>
          <HomeDiaryList navigator={this.props.navigator} />
        </Icon.TabBarItemIOS>

        <Icon.TabBarItemIOS
          title="关注"
          iconName="ios-heart-outline"
          selectedIconName="ios-heart"
          selected={this.state.selectedTab == 'follow'}
          onPress={() => {
            this.setState({
              selectedTab: 'follow'
            });
          }}>
          <FollowDiaryList navigator={this.props.navigator} />
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
          <UserPage navigator={this.props.navigator} myself={true} />
        </Icon.TabBarItemIOS>

      </TabBarIOS>
    );
  }
}
