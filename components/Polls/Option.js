import React, { Component } from 'react';
import { View } from 'react-native';
import { ListItem, Body, Text, CheckBox, Icon } from 'native-base';
import { getCurrentUserId } from '../../firebase/firebaseHelpers';

export default class Option extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text,
      votes: this.props.votes,
      id: this.props.id,
      responses: this.props.responses,
      checked: this.props.responses[getCurrentUserId()] || false,
    };
  }

  toggleChecked() {
    this.setState({
      checked: !this.state.checked,
    }, () => {
      if (this.state.checked) {
        this.setState({
          votes: this.state.votes + 1,
        }, () => {
          this.props.updateOption({
            text: this.state.text,
            votes: this.state.votes,
            id: this.state.id,
          });
        });
      } else {
        this.setState({
          votes: this.state.votes - 1,
        }, () => {
          this.props.updateOption({
            text: this.state.text,
            votes: this.state.votes,
            id: this.state.id,
          });
        });
      }
    });
  }

  // Set so you can click the ListItem OR the CheckBox
  render() {
    return (
      <ListItem onPress={() => this.toggleChecked()}>
        <Body
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <CheckBox checked={this.state.checked} onPress={() => this.toggleChecked()} />
          <Text
            style={{
              flex: 4,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              fontSize: 16,
            }}
          >
            {this.state.text}
          </Text>
          <Text
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              fontSize: 20,
              fontWeight: '600',
            }}
          >
            {this.state.votes}
          </Text>
          <Icon
            name={'trash'}
            style={{ color: 'red' }}
            onPress={() => this.props.removeOption({
              text: this.state.text,
              id: this.state.id,
            })}
          />
        </Body>
      </ListItem>
    );
  }
}

Option.propTypes = {
  text: React.PropTypes.string.isRequired,
  votes: React.PropTypes.number.isRequired,
  id: React.PropTypes.string.isRequired,
  responses: React.PropTypes.object.isRequired,
};