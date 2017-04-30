import React from 'react';
import { TouchableOpacity, TouchableWithoutFeedback, View, Dimensions } from 'react-native';
import { Text, Icon } from 'native-base';
import stringToColor from './colorGenerator';

const GroupList = ({ _handleChangePage, userGroups, deleteGroup, uid }) => {
  return (
    <View style={{ marginLeft: 13, marginRight: 12 }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        {userGroups.map((group, i) => {
          return (
            <View
              key={i}
              style={{
                shadowColor: 'black',
                borderRadius: 15,
                backgroundColor: stringToColor(group),
                marginTop: 10,
                justifyContent: 'space-between',
                width: Dimensions.get('window').width * 0.452,
                height: Dimensions.get('window').height * 0.20,
                padding: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => _handleChangePage(group || '')}
              >
                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: '600',
                    color: 'white',
                  }}
                >{group}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteGroup(uid, group)}
              >
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 50,
                    backgroundColor: 'white',
                  }}
                >
                  <Icon
                    name={'trash'}
                    style={{
                      color: 'red',
                      position: 'absolute',
                      bottom: 6,
                      right: 13,
                      fontSize: 23,
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          );
        },
        )
        }
      </View>
    </View>
  );
};

GroupList.propTypes = {
  _handleChangePage: React.PropTypes.func.isRequired,
  userGroups: React.PropTypes.array.isRequired,
  deleteGroup: React.PropTypes.func.isRequired,
  uid: React.PropTypes.string.isRequired,
};

export default GroupList;
