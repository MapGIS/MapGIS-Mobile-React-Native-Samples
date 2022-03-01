import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import styles from '../styles';
import {
  AltitudeMode,
  Dot,
  Dot3D,
  DriverType,
  GeoVarLine,
  GraphicPlaceMarker,
  GraphicPolyline3D,
  MGSceneView,
  ObjectManager,
  Scene,
  ServerLayer3D,
  SRSType,
  TerrainAnalysis,
  TerrainLayer3D,
  Viewpoint,
} from '@mapgis/mobile-react-native';
import {
  IMG_FILE_PATH_ENDPOINT,
  IMG_FILE_PATH_STARTPOINT,
  TERRAIN_FILE_PATH
} from '../utils';

export default class SceneTerrianMeasureDistance extends Component {
  static navigationOptions = { title: '地表距离量测' };

  constructor() {
    super();
    this.state = {
      showLoading: false,
      disResultVisible: false,
      locationList: [],
      terrianDis: 0.0,
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    this.setState({ showLoading: true });

    let serverLayer3D = await ServerLayer3D.createInstance();
    await serverLayer3D.setName('Google');
    await serverLayer3D.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer3D.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer3D.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    this.scene = await Scene.createInstance();
    await this.scene.addLayer(serverLayer3D);

    let terrainLayer3D = await TerrainLayer3D.createInstance();
    await terrainLayer3D.setDriverType(DriverType.Driver_Type_GDAL);
    await terrainLayer3D.setURL(TERRAIN_FILE_PATH);
    await this.scene.addLayer(terrainLayer3D);

    await this.sceneView.setAutoClipPlaneEnabled(true);

    let success = await this.sceneView.setSceneAsync(this.scene);
    if (success) {
      this.height = await this.sceneView.getHeight();
      await this.addGraphic();
    }
    this.setState({ showLoading: false });
  };

  componentWillUnmount = () => {
    this.disposeMap();

    this.sceneTapListener.remove();
  };

  componentDidMount() {
    this.sceneTapListener = DeviceEventEmitter.addListener(
      'com.mapgis.RN.SceneView.SingleTapEvent',
      res => {
        this.tapSceneView(res.x, res.y);
      }
    );
  }

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  tapSceneView = async (x, y) => {
    let dot = await Dot.createInstance(x, (this.height - y));
    let dot3d = await this.sceneView.screenToLocation(dot);

    this.state.locationList.push(dot3d);

    let locationSize = this.state.locationList.length;

    if (this.state.locationList.length === 1) {
      await this.terrainStartPlaceMarker.setPosition(this.state.locationList[0]);
    }
    else if (this.state.locationList.length > 1) {
      await this.terrainGraphicPolyline3D.setPoints(this.state.locationList);
      await this.terrainEndPlaceMarker.setPosition(this.state.locationList[locationSize - 1]);

      // 计算并量测结果
      this.calAndShowMeasureDistance();
    }
  };

  addGraphic = async () => {
    let graphic3DsOverlay = await this.sceneView.getDefaultGraphics3DOverlay();
    if (this.terrainStartPlaceMarker === null || this.terrainStartPlaceMarker === undefined) {
      this.terrainStartPlaceMarker = await GraphicPlaceMarker.createInstance();
      await this.terrainStartPlaceMarker.setImagePath(IMG_FILE_PATH_STARTPOINT);
      await this.terrainStartPlaceMarker.setAttributeValue('name', 'Start');
      await this.terrainStartPlaceMarker.setColor('rgba(255, 255, 0, 255)');
      await graphic3DsOverlay.addGraphic(this.terrainStartPlaceMarker);
    }

    if (this.terrainEndPlaceMarker === null || this.terrainEndPlaceMarker === undefined) {
      this.terrainEndPlaceMarker = await GraphicPlaceMarker.createInstance();
      await this.terrainEndPlaceMarker.setImagePath(IMG_FILE_PATH_ENDPOINT);
      await this.terrainEndPlaceMarker.setAttributeValue('name', 'End');
      await this.terrainEndPlaceMarker.setColor('rgba(0, 0, 255, 255)');
      await graphic3DsOverlay.addGraphic(this.terrainEndPlaceMarker);
    }

    if (this.terrainGraphicPolyline3D === null || this.terrainGraphicPolyline3D === undefined) {
      this.terrainGraphicPolyline3D = await GraphicPolyline3D.createInstance();
      await this.terrainGraphicPolyline3D.setAttributeValue('name', 'MeasureDistancePolyline3D');
      await this.terrainGraphicPolyline3D.setColor('rgba(255, 0, 0, 255)');
      await this.terrainGraphicPolyline3D.setLineWidth(10);
      await this.terrainGraphicPolyline3D.setAltitudeMode(AltitudeMode.CLAMPTOTERRAIN);
      await graphic3DsOverlay.addGraphic(this.terrainGraphicPolyline3D);
    }
  };

  startMeasure = async () => {
    let dot3d = await Dot3D.createInstance(86.489263, 27.362036, 1431.808927);
    let pointView = await Viewpoint.createInstanceByParam(dot3d, 19.72459976, -13.083570, 22140.095865);
    await this.sceneView.jumptoViewPoint(pointView, 2);

    if (this.state.locationList.length === 0) {
      await this.sceneView.registerTapListener();
      this.setState({ disResultVisible: true });
      this.addGraphic();
    }
  };

  stopMeasure = async () => {
    await this.reset();
    this.sceneView.unregisterTapListener();
    this.setState({ disResultVisible: false });
    // 结束量测
  };

  calAndShowMeasureDistance = async () => {
    let distance = 0.0;
    if (this.state.locationList.length !== 0) {
      let geoVarLine = await GeoVarLine.createInstance();
      for (let i = 0; i < this.state.locationList.length; i++) {
        let x = await this.state.locationList[i].getX();
        let y = await this.state.locationList[i].getY();
        let dot = await Dot.createInstance(x, y);
        await geoVarLine.append2D(dot);
      }

      distance = await TerrainAnalysis.calculateSurfaceDistance(this.scene, geoVarLine);
    }

    this.setState({ terrianDis: distance.toFixed(6) + '米' });
  };

  reset = async () => {
    this.setState({ locationList: [], terrianDis: '0.0米' });

    let graphic3DsOverlay = await this.sceneView.getDefaultGraphics3DOverlay();
    await graphic3DsOverlay.removeAllGraphics();
    this.terrainGraphicPolyline3D = null;
    this.terrainStartPlaceMarker = null;
    this.terrainEndPlaceMarker = null;
  };

  showInfo = () => (
    this.state.disResultVisible ?
      <View style={style.itemView}>
        <Text style={style.itemKey}>地形表面距离</Text>
        <Text style={style.itemValue}>
          {this.state.terrianDis}
        </Text>
      </View> :
      null
  );

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
                this.startMeasure();
              }}
            >
              <Text style={styles.text}>开始量测</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.stopMeasure();
              }}
            >
              <Text style={styles.text}>结束量测</Text>
            </TouchableOpacity>
          </View>
        </View>

        {this.showInfo()}

        <View style={style.leftBottomView}>
          <Text style={style.itemValue}>
            操作步骤：
            {'\n'}
            1、开始量测
            {'\n'}
            2、点击地图绘制线（会显示多个点）后，会显示量测距离
            {'\n'}
            3、若结束量测，不可再量测，需从第1步开始
          </Text>
        </View>

        <ActivityIndicator
          animating={this.state.showLoading}
          style={[styles.centering, { height: 80 }]}
          size='large' />
      </View>
    );
  }
}

const style = StyleSheet.create({
  itemView: {
    width: 180,
    position: 'absolute',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: '#292c36aa',
    paddingLeft: 10,
    paddingRight: 10,
  },
  leftBottomView: {
    width: 180,
    position: 'absolute',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: '#292c36aa',
    bottom: 30,
    paddingLeft: 10,
    paddingRight: 10,
  },
  itemKey: {
    fontSize: 14,
    color: '#rgba(245,83,61,0.8)',
  },
  itemValue: {
    fontSize: 14,
    color: '#fff',
  },
});
