import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import { SET_USER, REMOVE_USER, SET_CALLS, SET_CALL, ADD_CALL } from '../constants/actionTypes';
import { initMessaging, deleteToken } from './messagingActions';

import { objectToArray } from '../common/utils';

const firebaseConfig = {
  sandbox: {
    apiKey: "AIzaSyDp5-02CpUQ5gyquZt2ZHSfnRjCKY5lZis",
    authDomain: "yedidim-sandbox.firebaseapp.com",
    databaseURL: "https://yedidim-sandbox.firebaseio.com",
    projectId: "yedidim-sandbox",
    storageBucket: "yedidim-sandbox.appspot.com",
    messagingSenderId: "918819260524"
  },
  sandbox2: {
    apiKey: "AIzaSyAwKEsWodtnrprOhYXA5tFb9zbUnLqOBk4",
    authDomain: "yedidim-sandbox-2.firebaseapp.com",
    databaseURL: "https://yedidim-sandbox-2.firebaseio.com",
    projectId: "yedidim-sandbox-2",
    storageBucket: "yedidim-sandbox-2.appspot.com",
    messagingSenderId: "1011917548573"
  },
  production: {
    apiKey: "AIzaSyC6bf7YfKoompBlyjw382AJZOzTvLaY7P0",
    authDomain: "yedidim-production.firebaseapp.com",
    databaseURL: "https://yedidim-production.firebaseio.com",
    projectId: "yedidim-production",
    storageBucket: "yedidim-production.appspot.com",
    messagingSenderId: "33558411934"
  }
};

const firebaseUIConfig = {
  'callbacks': {
    'signInSuccess': function(user) {
      handleSignedInUser(user);
      // Do not redirect.
      return false;
    }
  },
  'signInFlow': 'popup',
  'signInOptions': [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
    }
  ],
  'tosUrl': 'https://www.google.com'
};

const firebaseApp = firebase.initializeApp(firebaseConfig.sandbox2);
const firebaseuiAuth = new firebaseui.auth.AuthUI(firebaseApp.auth());

export function checkUserAuth() {
  return (dispatch => {
    firebaseApp.auth().onAuthStateChanged(function(user) {
      if (user && user.providerData[0].providerId === 'password'){
        dispatch(handleSignedInUser({uid: user.uid, email: user.email}));
      }
      else {
        dispatch(handleSignedOutUser());
      }
    });
  });
}

export function signOutUser() {
  return (dispatch => {
    firebaseApp.auth().signOut().then(() => {
      dispatch(handleSignedOutUser());
    });
  });
}

export function addNewCall(call) {
  return (dispatch => {
    call.key = firebase.database().ref().child('calls').push().key;
    firebase.database().ref('calls/' + call.key).set(call, (err) => {
      if (err) {
        // dispatch(setError({title:"Failed to update!", message: err}));
      } else {
        dispatch(setCall(call));
      }
    });
  });
}

export function updateCallStatus(call, status) {
  const updatedCall = Object.assign({}, call, {status});
  return (dispatch => {
    firebase.database().ref('calls/' + call.key).set(updatedCall, (err) => {
      if (err) {
        // dispatch(setError({title:"Failed to update!", message: err}));
      } else {
        dispatch(setCall(updatedCall));
      }
    });
  });
}

function handleSignedInUser(user) {
  // setConnectionTime(user);
  return (dispatch => {
    dispatch(loadUserData(user));
    dispatch(initMessaging());
    dispatch(loadCalls());
  });
}

function handleSignedOutUser() {
  return (dispatch => {
    dispatch(deleteToken());
    dispatch(removeUser());
    firebaseuiAuth.reset();
    firebaseuiAuth.start('#firebaseui-auth-container', firebaseUIConfig);
  });
}

function loadUserData(user) {
  return (dispatch => {
    const key = user.email.split('@')[0];
    firebaseApp.database().ref('/dispatchers').child(key).once('value')
        .then((snapshot) => {
        const data = snapshot.val();
        user.name = data.name;
        dispatch(setUser(user));
      })
      .catch(() => {
        user.name = user.email;
        dispatch(user);
      });
  });
}

function loadCalls() {
  return (dispatch => {
    firebaseApp.database().ref('/calls').once('value')
      .then((snapshot) => {
        let calls = objectToArray(snapshot.val());
        calls.sort((c1, c2) => {
          if (c1.timestamp > c2.timestamp)
            return -1;
          if (c1.timestamp < c2.timestamp)
            return 1;
          return 0;
        });
        dispatch(setCalls(calls));
        const timestamp = calls.length > 0 ? calls[0].timestamp + 1 : 0;
        firebaseApp.database().ref('/calls').orderByChild('timestamp').startAt(timestamp).on('child_added', (data) => {
          let call = data.val();
          call.key = data.key;
          dispatch(addCall(call));
        });
        firebaseApp.database().ref('/calls').on('child_changed', (data) => {
          let call = data.val();
          call.key = data.key;
          dispatch(setCall(call));
        });
      })
      .catch(err => {
        if (err) {
          // dispatch(setError({title:"Failed to load data!", message: err}));
        }
      });
  });
}

function setUser(user){
  return {
    type: SET_USER,
    user,
  };
}

function removeUser(){
  return {
    type: REMOVE_USER
  };
}

function setCalls(calls){
  return {
    type: SET_CALLS,
    calls,
  };
}

function setCall(call){
  return {
    type: SET_CALL,
    call,
  };
}

function addCall(call){
  return {
    type: ADD_CALL,
    call,
  };
}