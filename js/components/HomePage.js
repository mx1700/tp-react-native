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
import Icon from 'react-native-vector-icons/FontAwesome';
import WritePage from './WritePage'

export default class HomePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'home'
    }
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
          iconName="home"
          iconSize={26}
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
          iconName="eye"
          iconSize={28}
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
          iconName="pencil-square"
          iconSize={33}
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
          iconName="bell-o"
          iconSize={24}
          selected={this.state.selectedTab == 'tips'}
          onPress={() => {
              this.setState({
                  selectedTab: 'tips'
              });
          }}>
          <View style={{backgroundColor: 'white', flex: 1}}>
              <Text>未完成</Text>
          </View>
        </Icon.TabBarItemIOS>

        <Icon.TabBarItemIOS
          title="我的"
          iconName="user"
          iconSize={25}
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
