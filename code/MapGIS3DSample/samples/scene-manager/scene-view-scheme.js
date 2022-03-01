import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import {
  SHP_FILE_PATH1,
  SHP_FILE_PATH2,
  STYLE_FILE_PATH,
  STYLE_FILE_PATH1
} from '../utils';
import {
  MGSceneView,
  ServerLayer3D,
  DriverType,
  SRSType,
  Scene,
  SunLightingMode,
  VectorLayer3D,
  Dot3D,
  Viewpoint,
  ObjectManager
} from '@mapgis/mobile-react-native';

export default class SceneViewScheme extends Component {
  static navigationOptions = { title: '专题图功能展示' };

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    await this.sceneView.setSunLightingMode(SunLightingMode.NONE);
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  scheme1 = async () => {
    let scene = await Scene.createInstance();

    let serverLayer3D = await ServerLayer3D.createInstance();

    await serverLayer3D.setName('Google');
    await serverLayer3D.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer3D.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer3D.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    await scene.addLayer(serverLayer3D);

    let vectorLayer3D = await VectorLayer3D.createInstance();

    await vectorLayer3D.setDriverType(DriverType.Driver_Type_OGR);
    await vectorLayer3D.setURL(SHP_FILE_PATH2);
    await vectorLayer3D.setConfigFile(STYLE_FILE_PATH);

    await scene.addLayer(vectorLayer3D);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      let dot3d = await Dot3D.createInstance(114.336677, 30.546778, 0);
      let viewPoint = await Viewpoint.createInstanceByParam(dot3d, 0, -45, 4000)
      await this.sceneView.jumptoViewPoint(viewPoint, 1);
    }
  };

  scheme2 = async () => {
    let scene = await Scene.createInstance();

    let serverLayer3D = await ServerLayer3D.createInstance();

    await serverLayer3D.setName('Google');
    await serverLayer3D.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer3D.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer3D.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    await scene.addLayer(serverLayer3D);

    let vectorLayer3D = await VectorLayer3D.createInstance();

    await vectorLayer3D.setDriverType(DriverType.Driver_Type_OGR);
    await vectorLayer3D.setURL(SHP_FILE_PATH1);
    await vectorLayer3D.setConfigFile(STYLE_FILE_PATH1);

    await scene.addLayer(vectorLayer3D);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      let dot3d = await Dot3D.createInstance(114.65, 30.170, 3000);
      let viewPoint = await Viewpoint.createInstanceByParam(dot3d, 0, -60, 0)
      await this.sceneView.jumptoViewPoint(viewPoint, 1);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <MGSceneView
          ref='sceneView'
          onGetInstance={this.onGetInstance}
          style={styles.sceneView}
        />

        <View style={styles.buttons}>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.scheme1();
              }}
            >
              <Text style={styles.text}>专题图1</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.scheme2();
              }}
            >
              <Text style={styles.text}>专题图2</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}