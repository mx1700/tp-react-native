var React = require('react');
var {
    PropTypes,
} = React;
var {
    View,
    Modal,
    StyleSheet,
    ActivityIndicator,
} = require('react-native');
import TPColors from './TPColors'

function LoadingModal(props) {
    return (
        <Modal
            visible={props.loading}
            transparent={true}
            onRequestClose={() => {}}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.8)" }}>
                <ActivityIndicator animating={true} color={TPColors.light} />
            </View>
        </Modal>
    );
}

module.exports = LoadingModal;