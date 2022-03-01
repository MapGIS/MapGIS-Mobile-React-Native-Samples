import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import {
  MGSceneView,
  Scene,
  ServerLayer3D,
  TerrainLayer3D,
  DriverType,
  SRSType,
  Viewpoint,
  Dot,
  ObjectManager
} from '@mapgis/mobile-react-native';
import { TERRAIN_FILE_PATH } from '../utils';

export default class SceneViewListen extends Component {
  static navigationOptions = { title: '场景监听' };

  constructor() {
    super();
    this.state = {
      locationToScreenText: '',
      screenToLocationText: '',
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    let scene = await Scene.createInstance();
    let serverLayer3D = await ServerLayer3D.createInstance();
    await serverLayer3D.setName('tian di tu');
    await serverLayer3D.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer3D.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);
    await serverLayer3D.setURL('http://t[01234567].tianditu.com/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&FORMAT=tiles&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=716aa73dba52f2a560e1a64f9b404bfd');
    await scene.addLayer(serverLayer3D);

    let terrainLayer3D = await TerrainLayer3D.createInstance();
    await terrainLayer3D.setDriverType(DriverType.Driver_Type_GDAL);
    await terrainLayer3D.setSRSByString(SRSType.SRS_Type_Global);
    await terrainLayer3D.setURL(TERRAIN_FILE_PATH);
    await scene.addLayer(terrainLayer3D);

    await this.sceneView.setSceneAsync(scene);
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  locationToScreen = async () => {
    let viewPoint = await Viewpoint.createInstance();
    await this.sceneView.getCurrentViewPoint(viewPoint);
    let dot3D = await viewPoint.getFocalPoint();
    let dot = await this.sceneView.locationToScreen(dot3D);

    let dot3dX = await dot3D.getX();
    let dot3dY = await dot3D.getY();
    let dotX = await dot.getX();
    let dotY = await dot.getY();

    let str = '场景地理坐标（dot3d）:\n' + dot3dX + '\n' + dot3dY + '\n' + '屏幕坐标:\n' + dotX + '\n' + dotY;
    this.setState({ locationToScreenText: str });
  };

  screenToLocation = async () => {
    let width = await this.sceneView.getWidth();
    let height = await this.sceneView.getHeight();
    let screenPoint = await Dot.createInstance(width / 2, height / 2);
    let dot3D = await this.sceneView.screenToLocation(screenPoint);

    let dotX = await screenPoint.getX();
    let dotY = await screenPoint.getY();
    let dot3dX = await dot3D.getX();
    let dot3dY = await dot3D.getY();
    let dot3dZ = await dot3D.getZ();

    let str = '屏幕坐标:\n' + dotX + '\n' + dotY + '\n' + '地理坐标:\n' + dot3dX + '\n' + dot3dY + '\n' + dot3dZ;
    this.setState({ screenToLocationText: str });
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
                this.locationToScreen();
              }}
            >
              <Text style={styles.text}>地理坐标转屏幕坐标</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.screenToLocation();
              }}
            >
              <Text style={styles.text}>屏幕坐标转地图坐标</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>{this.state.locationToScreenText}</Text>
          <Text style={styles.description}>{this.state.screenToLocationText}</Text>
        </View>
      </View>
    );
  }
}
