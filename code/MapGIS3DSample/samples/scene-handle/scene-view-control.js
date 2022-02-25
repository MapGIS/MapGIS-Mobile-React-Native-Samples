import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles';
import {
  MGSceneView,
  Viewpoint,
  ObjectManager
} from '@mapgis/uniform-core-react-native';
import Slider from '@react-native-community/slider';

export default class SceneViewControl extends Component {
  static navigationOptions = { title: '场景视图控制' };

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    this.viewPoint = await Viewpoint.createInstance();
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
        <View style={styles.controls}>
          <View style={styles.control}>
            <Text style={styles.label}>相机航向角</Text>
            <Slider style={styles.slider}
              minimumValue={0}
              maximumValue={360}
              onSlidingStart={async () => {
                await this.sceneView.getCurrentViewPoint(this.viewPoint);
              }}
              onValueChange={async value => {
                await this.viewPoint.setHeadingDeg(value)
                await this.sceneView.jumptoViewPoint(this.viewPoint, 0);
              }}
            />
          </View>
          <View style={styles.control}>
            <Text style={styles.label}>相机俯仰角</Text>
            <Slider style={styles.slider}
              minimumValue={0}
              maximumValue={80}
              onSlidingStart={async () => {
                await this.sceneView.getCurrentViewPoint(this.viewPoint);
              }}
              onValueChange={async value => {
                await this.viewPoint.setPitchDeg(value - 90)
                await this.sceneView.jumptoViewPoint(this.viewPoint, 0);
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
