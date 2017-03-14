import React, { Component } from 'react';
import { View, Dimensions, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { Fab, Icon, Button } from 'native-base';
import { firebaseDB, updateUserLocation } from '../../firebase/firebaseHelpers';
import { getUserLocation } from '../../location/locationHelpers';
import duckYellow from '../../images/duck_emoji_smaller.png';
import duckBlue from '../../images/duck_emoji_smaller_blue.png';
import duckGreen from '../../images/duck_emoji_smaller_green.png';
import duckPurple from '../../images/duck_emoji_smaller_purple.png';
import duckRed from '../../images/duck_emoji_smaller_red.png';
import Search from '../Search/Search';


export default class MapDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currLoc: '',
      markersArray: [],
      user: props.user,
      chirping: props.chirping,
      userLocation: props.userLocation,
      active: false,
    };

    this.goToSearch = this.goToSearch.bind(this);
    this.playChirp = this.playChirp.bind(this);
    this.chirp = this.chirp.bind(this);
  }

  componentWillMount() {
    this.getMemberLocations(this.props.groupName);
    getUserLocation().then((response) => {
      this.setState({
        currLoc: response,
      });
    });
  }

  componentDidMount() {
    const map = this.refs.mymap;
    const context = this;

    this._fitToSuppliedMarkers = setTimeout(() => {
      const markers = context.state.markersArray.map(marker => marker.displayName);
      map.fitToSuppliedMarkers(markers, true);
    }, 2500);

    this._updateUserLocation = setInterval(() => {
      updateUserLocation(this.props.groupName);
    }, 15000);

    this._updateMemberLocations = setInterval(() => {
      this.getMemberLocations(this.props.groupName);
    }, 10000);

  }

  componentWillUnmount() {
    clearInterval(this._updateUserLocation);
    clearInterval(this._updateMemberLocations);
    clearTimeout(this._fitToSuppliedMarkers);
  }

  getMemberLocations(activeGroup) {
    const markersArray = [];
    firebaseDB.ref(`groups/${activeGroup}/members/`).once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        // if a member is chirping, call chirp function
        if (childSnapshot.val().chirp === true) {
          this.playChirp(childSnapshot.val().displayName, childSnapshot.val().location.coords);
        }
        markersArray.push({ coordinate: {
          latitude: childSnapshot.val().location.coords.latitude,
          longitude: childSnapshot.val().location.coords.longitude,
        },
          displayName: childSnapshot.val().displayName,
        });
      });
      this.setState({ markersArray });
    });
  }

  goToSearch() {
    this.props.navigator.push({
      component: Search,
      title: 'Explore',
      passProps: {
        groupName: this.props.groupName,
      },
    });
  }

  chirp() {
    const userId = this.state.user.uid;
    const activeGroup = this.props.groupName;
    const member = firebaseDB.ref(`groups/${activeGroup}/members/${userId}`);
    member.update({
      chirp: true,
    })
    .then(Alert.alert('Chirp sent!'))
    .catch((error) => { console.log(`error ${error}`); });
    setTimeout(() => {
      member.update({
        chirp: false,
      })
      .catch((error) => { console.log(`error ${error}`); });
    }, 10000);
  }

  goToChirp(memberLocation) {
    console.log('GO TO CHIRP CALLED');
    const map = this.refs.mymap;
    map.animateToCoordinate(memberLocation, 2);
  }

  playChirp(memberName, memberLocation) {
    if (memberName != this.state.user.displayName) {
      Alert.alert(
        'Chirp!',
        `${memberName} is chirping!`,
        [
          { text: `Go to ${memberName}`,
            onPress: () => {
              this.goToChirp(memberLocation);
              console.log('gotoChirp send');
            },
          },
          { text: 'Dismiss' },
        ],
      );
    }
  }

  render() {
    console.log('RENDER CALLED');
    const { width, height } = Dimensions.get('window');
    const emojis = [duckYellow, duckBlue, duckGreen, duckPurple, duckRed];

    return (
      <View>
        <MapView
          ref="mymap"
          style={{ width, height: height - 114 }}
          initialRegion={{
            latitude: this.state.currLoc ? this.state.currLoc[0] : 50,
            longitude: this.state.currLoc ? this.state.currLoc[1] : -135,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
        >
          {this.state.markersArray.map((marker, i) => (
            <MapView.Marker
              key={i}
              title={marker.displayName}
              identifier={marker.displayName}
              coordinate={{ latitude: marker.coordinate.latitude,
                longitude: marker.coordinate.longitude }}
              image={emojis[(5 + i) % 5]}
            />
          ),
          )
        }
        </MapView>
        <Fab
          position={'bottomRight'}
          active={this.state.active}
          style={{ backgroundColor: '#DD5144' }}
          direction={'left'}
          onPress={() => { this.setState({ active: !this.state.active }); }}
        >
          <Icon name={'add'} />
          <Button
            style={{ backgroundColor: '#0066cc' }}
            onPress={this.goToSearch}
          >
            <Icon name={'search'} />
          </Button>
          <Button
            style={{ backgroundColor: '#ff9900' }}
            onPress={this.chirp}
          >
            <Icon name={'ios-megaphone'} />
          </Button>
        </Fab>
      </View>
    );
  }
}


MapDisplay.propTypes = {
  groupName: React.PropTypes.string.isRequired,
  navigator: React.PropTypes.object.isRequired,
};
