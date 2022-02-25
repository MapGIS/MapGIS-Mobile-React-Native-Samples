import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles';
import {
  MGSceneView,
  ObjectManager
} from '@mapgis/uniform-core-react-native';
import Slider from '@react-native-community/slider';

export default class SceneViewSetParams extends Component {
  static navigationOptions = { title: '场景参数设置' };

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.widthControls}>
          <View style={styles.control}>
            <Text style={styles.label}>设置场景视图的背景色</Text>
            <Slider style={styles.slider}
              minimumValue={0}
              maximumValue={160}
              onValueChange={async value => {
                await this.sceneView.setBackGroundColor('rgba(' + value + ', ' + value + ', ' + value + ', 0.5)');
              }}
            />
          </View>
          <View style={styles.control}>
            <Text style={styles.label}>设置环境光颜色</Text>
            <Slider style={styles.slider}
              minimumValue={0}
              maximumValue={255}
              onValueChange={async value => {
                await this.sceneView.setAmbientLightColor('rgba(' + value + ', ' + value + ', ' + value + ', 0.5)');
              }}
            />
          </View>
          <View style={styles.control}>
            <Text style={styles.label}>设置模拟光照时间</Text>
            <Slider style={styles.slider}
              minimumValue={0}
              maximumValue={12}
              onValueChange={async value => {
                await this.sceneView.setSunTime(2017, 5, 31, value + 12);
              }}
            />
          </View>
        </View>
        <MGSceneView
          ref='sceneView'
          onGetInstance={this.onGetInstance}
          style={styles.sceneView}
        />
      </View>
    );
  }
}
