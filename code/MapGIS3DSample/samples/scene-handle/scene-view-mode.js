import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles';
import {
  MGSceneView,
  SunLightingMode,
  SceneMode,
  AtmosphereEffectMode,
  ObjectManager
} from '@mapgis/uniform-core-react-native';
import { Switch } from '../common';

export default class SceneViewMode extends Component {
  static navigationOptions = { title: '场景模式' };

  constructor() {
    super();
    this.state = {
      sceneModeSelected: false,
      atmosphereSelected: false,
      sunlightingmodeSelected: false,
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    await this.sceneView.setSunLightingMode(SunLightingMode.NONE);
    let sceneMode = await this.sceneView.getMode();
    if (sceneMode == SceneMode.GLOBE) {
      this.setState({ sceneModeSelected: true });
    };
    if (await this.sceneView.getAtmosphereEffectMode() == AtmosphereEffectMode.RELISTIC) {
      this.setState({ atmosphereSelected: true });
    }
    if (await this.sceneView.getSunLightingMode() == SunLightingMode.LIGHT) {

    }
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  setScenemodeSelected = async () => {
    if (await this.sceneView.getMode() == SceneMode.GLOBE) {
      await this.sceneView.setMode(SceneMode.LOCAL);
      this.setState({ sceneModeSelected: false });
    } else {
      await this.sceneView.setMode(SceneMode.GLOBE);
      this.setState({ sceneModeSelected: true });
    }
  };

  setAtmosphereSelected = async () => {
    if (await this.sceneView.getAtmosphereEffectMode() == AtmosphereEffectMode.NONE) {
      await this.sceneView.setAtmosphereEffectMode(AtmosphereEffectMode.RELISTIC);
      this.setState({ atmosphereSelected: true });
    } else {
      await this.sceneView.setAtmosphereEffectMode(AtmosphereEffectMode.NONE);
      this.setState({ atmosphereSelected: false });
    }
  };

  setSunlightingmodeSelected = async () => {
    if (await this.sceneView.getSunLightingMode() == SunLightingMode.LIGHT) {
      await this.sceneView.setSunLightingMode(SunLightingMode.NONE);
      this.setState({ sunlightingmodeSelected: false });
    } else {
      await this.sceneView.setSunLightingMode(SunLightingMode.LIGHT);
      this.setState({ sunlightingmodeSelected: true });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controls}>
          <View style={styles.control}>
            <Text style={styles.label}>场景模式</Text>
            <Switch style={styles.switch}
              onValueChange={async sceneModeSelected => {
                this.setState({ sceneModeSelected });
                this.setScenemodeSelected();
              }}
              value={this.state.sceneModeSelected}
            />
          </View>
          <View style={styles.control}>
            <Text style={styles.label}>大气效果模式</Text>
            <Switch style={styles.switch}
              onValueChange={async atmosphereSelected => {
                this.setState({ atmosphereSelected });
                this.setAtmosphereSelected();
              }}
              value={this.state.atmosphereSelected}
            />
          </View>
          <View style={styles.control}>
            <Text style={styles.label}>光照模式</Text>
            <Switch style={styles.switch}
              onValueChange={async sunlightingmodeSelected => {
                this.setState({ sunlightingmodeSelected });
                this.setSunlightingmodeSelected();
              }}
              value={this.state.sunlightingmodeSelected}
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
