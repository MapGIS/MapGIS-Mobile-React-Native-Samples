import React, { PureComponent } from 'react';
import { TouchableOpacity, View } from 'react-native';

export default class RadioView extends PureComponent {

  static propTypes = {};

  constructor(props) {
      super(props);
      this.state = {
          bgc: '#ff0000',
      }
  }


  render() {

      let color = this.props.checked ? this.state.bgc : '#fff';

      return (
          <View style={{justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 10}}>

              <TouchableOpacity
                  onPress={this.pressed.bind(this)}
                  style={{backgroundColor: color, width: 12, height: 12, borderRadius: 26, borderColor: '#d9d9d9', borderWidth: 1}}>
              </TouchableOpacity>
          </View>
      )
  }

  pressed() {
      let {id, onCheck} = this.props;
      onCheck(id);
  }
}
