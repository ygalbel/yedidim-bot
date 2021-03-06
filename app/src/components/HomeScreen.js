import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import LoginScreen from "./LoginScreen";
import MainScreen from "./MainScreen";
import { checkUserAuth } from "../actions/dataSourceActions";


class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {showNewVersionAlert: false};
  }

  componentWillMount() {
    this.props.checkUserAuth();
  }

  componentWillReceiveProps(nextProps) {
    //Check that the app version is the latest
    if (nextProps.newVersionExists && !this.state.showNewVersionAlert){
      this.reloadNewVersion();
    }
  }

  reloadNewVersion() {
    this.setState({showNewVersionAlert: true});
    Alert.alert(
      'עדכון גירסא',
      'בבקשה עדכן גירסא חדשה',
      [
        {text: 'עדכן', onPress: () => Expo.Util.reload()},
      ],
      { cancelable: false }
    )
  }
  render() {
    //Check that the app version is the latest
    if (this.props.newVersionExists){
      return (<Expo.AppLoading />);
    }

    //User authentication was not checked it
    if (!this.props.user) {
      return (<Expo.AppLoading />)
    }
    //There is no log in user
    if (!this.props.user.id) {
      return (<LoginScreen/>);
    }
    //Events data was not loaded yet
    if (!this.props.events) {
      return (<Expo.AppLoading />)
    }
    return (<MainScreen/>)
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    checkUserAuth: () => {
      dispatch(checkUserAuth());
    }
  };
};

const mapStateToProps = (state) => {
  return {
    newVersionExists: state.dataSource.newVersionExists,
    user: state.dataSource.user,
    events: state.dataSource.events
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

HomeScreen.propTypes = {
  user: PropTypes.object};