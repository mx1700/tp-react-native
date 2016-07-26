import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
var Lightbox = require('react-native-lightbox');

export default class PhotoPage extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Lightbox navigator={this.props.navigator}>
        <Image
          style={{ height: 300 }}
          source={{ uri: this.props.uri }}
        />
      </Lightbox>
    );
  }

}

const styles = StyleSheet.create({

});
