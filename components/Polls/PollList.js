import React, { Component } from 'react';
import { ListView, View, TextInput, TouchableOpacity } from 'react-native';
import { Container, Content, Text, Button, ListItem, Icon } from 'native-base';
import { firebaseDB } from '../../firebase/firebaseHelpers';
import Poll from './Poll';

export default class PollList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      group: this.props.groupName,
      input: '',
      polls: [],
    };
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.addPoll = this.addPoll.bind(this);
    this.removePoll = this.removePoll.bind(this);
    this.pollsRef = firebaseDB.ref(`/groups/${this.state.group}/polls/`);
  }

  componentWillMount() {
    this.getPolls();
  }

  componentWillUnmount() {
    this.pollsRef.off();
  }

  getPolls() {
    firebaseDB.ref(`/groups/${this.state.group}/polls/`)
    .on('value', (snapshot) => {
      if (snapshot.val() !== null) {
        this.setState({
          polls: snapshot.val(),
        });
      }
    });
  }

  addPoll() {
    const pollRef = firebaseDB.ref(`/groups/${this.state.group}/polls/`).push();
    pollRef.set({
      text: this.state.input,
      id: pollRef.key,
    }, (error) => {
      if (error) {
        console.log('Add Poll failed:', error);
      }
    }).then(() => {
      this.setState({
        input: '',
      });
    });
  }

  removePoll(pollID) {
    const pollRef = firebaseDB.ref(`/groups/${this.state.group}/polls/${pollID}`);
    pollRef.remove()
      .then(() => {
        console.log('Remove Poll succeeded.');
      })
      .catch((error) => {
        console.log('Remove Poll failed: ' + error.message);
      });
  }

  showPoll(poll) {
    this.props.navigator.push({
      component: Poll,
      title: poll.text,
      passProps: {
        pollID: poll.id,
        pollTxt: poll.text,
        groupName: this.state.group,
      },
    });
  }

  render() {
    return (
      <Container>
        <Content>
          <View style={{ flex: 1, paddingTop: 0, height: 500 }}>
            <ListView
              enableEmptySections
              dataSource={this.ds.cloneWithRows(this.state.polls)}
              renderRow={(rowData) =>
                <ListItem id={rowData.id}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                    onPress={() => this.showPoll(rowData)}>
                    <Text>
                      {rowData.text}
                    </Text>
                  </TouchableOpacity>
                  <Icon
                    name={'trash'}
                    style={{ color: 'red' }}
                    onPress={() => this.removePoll(rowData.id)}
                  />
                </ListItem>
              }
            />

          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: 'lightgrey',
            }}
          >
            <View style={{ flex: 3, height: 50 }}>
              <TextInput
                style={{
                  flex: 1,
                  borderColor: 'grey',
                  borderWidth: 1,
                  paddingLeft: 10,
                  margin: 10,
                }}
                value={this.state.input}
                onChangeText={(t) => {
                  this.setState({ input: t });
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 10,
              }}
            >
              <Button small onPress={this.addPoll} disabled={this.state.input.length < 1}>
                <Text style={{ color: 'white' }}>Add Poll</Text>
              </Button>
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}

PollList.propTypes = {
  groupName: React.PropTypes.string.isRequired,
  navigator: React.PropTypes.object.isRequired,
};
