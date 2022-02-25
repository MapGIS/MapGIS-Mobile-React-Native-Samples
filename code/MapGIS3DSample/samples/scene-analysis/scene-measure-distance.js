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
  DistanceMeasurement,
  Dot,
  Dot3D,
  DriverType,
  GraphicPlaceMarker,
  GraphicPolyline3D,
  MeasurementChangedEvent,
  MGSceneView,
  ObjectManager,
  Scene,
  ServerLayer3D,
  SRSType,
  TerrainLayer3D,
  Viewpoint
} from '@mapgis/uniform-core-react-native';
import {
  IMG_FILE_PATH2,
  IMG_FILE_PATH_ENDPOINT,
  IMG_FILE_PATH_STARTPOINT,
  TERRAIN_FILE_PATH
} from '../utils';

export default class SceneMeasureDistance extends Component {
  static navigationOptions = { title: '距离量测' };

  constructor() {
    super();
    this.state = {
      showLoading: false,
      disResultVisible: false,
      aboutVisible: true,
      locationList: [],
      mapInfo: new Map(),
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

    let scene = await Scene.createInstance();
    await scene.addLayer(serverLayer3D);

    let terrainLayer3D = await TerrainLayer3D.createInstance();
    await terrainLayer3D.setDriverType(DriverType.Driver_Type_GDAL);
    await terrainLayer3D.setURL(TERRAIN_FILE_PATH);
    await scene.addLayer(terrainLayer3D);

    await this.sceneView.setAutoClipPlaneEnabled(true);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      this.height = await this.sceneView.getHeight();
    }
    this.setState({ showLoading: false });
  };

  componentWillUnmount = () => {
    this.disposeMap();

    this.sceneTapListener.remove();
    this.measureChangedListener.remove();
  };

  componentDidMount() {
    this.sceneTapListener = DeviceEventEmitter.addListener(
      'com.mapgis.RN.SceneView.SingleTapEvent',
      res => {
        this.tapSceneView(res.x, res.y);
      }
    );
    this.measureChangedListener = DeviceEventEmitter.addListener(
      'com.mapgis.RN.DistanceMeasurement.MeasurementChangedEvent',
      res => {
        this.changeMeasureDistance(res.ObjId);
      }
    );
  }

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  tapSceneView = async (x, y) => {
    let list = this.state.locationList;
    if (list.length === 0) {
      await this.reset();
    }

    let dot = await Dot.createInstance(x, this.height - y);
    let dot3d = await this.sceneView.screenToLocation(dot);

    list.push(dot3d);

    if (list.length === 1) {
      await this.startPlaceMarker.setPosition(list[0]);
      await this.distanceMeasurement.setStartLocation(list[0]);
    }
    else if (list.length === 2) {
      await this.graphicPolyline3D.setPoints(list);
      await this.endPlaceMarker.setPosition(list[list.length - 1]);
      await this.showVertexPlaceMarkerAndPolyline();
      await this.distanceMeasurement.setEndLocation(list[list.length - 1]);

      list = [];
    }
    this.setState({ locationList: list });
  };

  changeMeasureDistance = async (ObjId) => {
    let changedEvent = new MeasurementChangedEvent();
    changedEvent.ObjId = ObjId;

    let directDisValue = await changedEvent.getDirectDistance();
    let horizontalDisValue = await changedEvent.getHorizontalDistance();
    let verticalDisValue = await changedEvent.getVerticalDistance();
    this.setMeasureDistanceResult(directDisValue, horizontalDisValue, verticalDisValue);
  };

  startMeasureDistance = async () => {
    if (this.distanceMeasurement === null || this.distanceMeasurement === undefined) {
      this.distanceMeasurement = await DistanceMeasurement.createInstance();
    }
    await this.distanceMeasurement.registerMeasurementChangedListener();

    let dot3d = await Dot3D.createInstance(86.330098, 27.456859, 1968.211503);
    let pointView = await Viewpoint.createInstanceByParam(dot3d, 121.72459976, 9.083570, 7041.722985);
    await this.sceneView.jumptoViewPoint(pointView, 2);

    await this.sceneView.registerTapListener();

    this.setState({ disResultVisible: true });

    if (this.state.locationList.length !== 0) {
      this.reset();
    }
  };

  setMeasureDistanceResult = (directDisValue, horizontalDisValue, verticalDisValue) => {
    let info = this.state.mapInfo;
    info.set('directDis', directDisValue.toFixed(6) + '米');
    info.set('horizontalDis', horizontalDisValue.toFixed(6) + '米');
    info.set('verticalDis', verticalDisValue.toFixed(6) + '米');
    this.setState({ mapInfo: info });
  };

  stopMeasureDistance = async () => {
    // 停止量测
    this.sceneView.unregisterTapListener();
    this.setState({ disResultVisible: false });
    await this.removeGraphic();

    this.setMeasureDistanceResult(0.0, 0.0, 0.0);
    this.distanceMeasurement.unregisterMeasurementChangedListener();
  };

  reset = async () => {
    let info = this.state.mapInfo;
    info.set('directDis', '0.0米');
    info.set('horizontalDis', '0.0米');
    info.set('verticalDis', '0.0米');

    this.setState({ locationList: [], mapInfo: info });

    await this.removeGraphic();

    this.addGraphic();
  };

  removeGraphic = async () => {
    let graphic3DsOverlay = await this.sceneView.getDefaultGraphics3DOverlay();
    await graphic3DsOverlay.removeAllGraphics();
    this.startPlaceMarker = null;
    this.endPlaceMarker = null;
    this.vertexPlaceMarker = null;
    this.graphicPolyline3D = null;
    this.horizontalPolyline3D = null;
    this.verticalPolyline3D = null;
  };

  showVertexPlaceMarkerAndPolyline = async () => {
    let startDot3d = this.state.locationList[0];
    let endDot3d = this.state.locationList[1];
    let vertextDot3d = await Dot3D.createInstance();
    let verticalPolylinePoints = new Array(2);
    let horizontalPolylinePoints = new Array(2);

    let startDot3dZ = await startDot3d.getZ();
    let endDot3dZ = await endDot3d.getZ();
    if (startDot3dZ > endDot3dZ) {
      let endDot3dX = await endDot3d.getX();
      let endDot3dY = await endDot3d.getY();
      await vertextDot3d.setX(endDot3dX);
      await vertextDot3d.setY(endDot3dY);
      await vertextDot3d.setZ(startDot3dZ);

      verticalPolylinePoints[0] = endDot3d;
      verticalPolylinePoints[1] = vertextDot3d;

      horizontalPolylinePoints[0] = vertextDot3d;
      horizontalPolylinePoints[1] = startDot3d;
    }
    else {
      let startDot3dX = await startDot3d.getX();
      let startDot3dY = await startDot3d.getY();
      await vertextDot3d.setX(startDot3dX);
      await vertextDot3d.setY(startDot3dY);
      await vertextDot3d.setZ(endDot3dZ);

      verticalPolylinePoints[0] = startDot3d;
      verticalPolylinePoints[1] = vertextDot3d;

      horizontalPolylinePoints[0] = vertextDot3d;
      horizontalPolylinePoints[1] = endDot3d;
    }

    await this.vertexPlaceMarker.setPosition(vertextDot3d);
    await this.verticalPolyline3D.setPoints(verticalPolylinePoints);
    await this.horizontalPolyline3D.setPoints(horizontalPolylinePoints);

  };

  addGraphic = async () => {
    let graphic3DsOverlay = await this.sceneView.getDefaultGraphics3DOverlay();
    if (this.startPlaceMarker === null || this.startPlaceMarker === undefined) {
      this.startPlaceMarker = await GraphicPlaceMarker.createInstance();
      await this.startPlaceMarker.setImagePath(IMG_FILE_PATH_STARTPOINT);
      await this.startPlaceMarker.setAttributeValue('name', 'Start');
      await this.startPlaceMarker.setColor('rgba(255, 255, 0, 255)');
      await graphic3DsOverlay.addGraphic(this.startPlaceMarker);
    }

    if (this.endPlaceMarker === null || this.endPlaceMarker === undefined) {
      this.endPlaceMarker = await GraphicPlaceMarker.createInstance();
      await this.endPlaceMarker.setImagePath(IMG_FILE_PATH_ENDPOINT);
      await this.endPlaceMarker.setAttributeValue('name', 'End');
      await this.endPlaceMarker.setColor('rgba(0, 0, 255, 255)');
      await graphic3DsOverlay.addGraphic(this.endPlaceMarker);
    }

    if (this.vertexPlaceMarker === null || this.vertexPlaceMarker === undefined) {
      this.vertexPlaceMarker = await GraphicPlaceMarker.createInstance();
      await this.vertexPlaceMarker.setImagePath(IMG_FILE_PATH2);
      await this.vertexPlaceMarker.setAttributeValue('name', 'Vertex');
      await this.vertexPlaceMarker.setColor('rgba(0, 0, 255, 255)');
      await this.vertexPlaceMarker.setAltitudeMode(AltitudeMode.NONE);
      await graphic3DsOverlay.addGraphic(this.vertexPlaceMarker);
    }

    if (this.graphicPolyline3D === null || this.graphicPolyline3D === undefined) {
      this.graphicPolyline3D = await GraphicPolyline3D.createInstance();
      await this.graphicPolyline3D.setAttributeValue('name', 'MeasureDistancePolyline3D');
      await this.graphicPolyline3D.setColor('rgba(255, 0, 0, 255)');
      await this.graphicPolyline3D.setLineWidth(10);
      await this.graphicPolyline3D.setAltitudeMode(AltitudeMode.NONE);
      await graphic3DsOverlay.addGraphic(this.graphicPolyline3D);
    }

    if (this.verticalPolyline3D === null || this.verticalPolyline3D === undefined) {
      this.verticalPolyline3D = await GraphicPolyline3D.createInstance();
      await this.verticalPolyline3D.setAttributeValue('name', 'VertexToStartPolyline3D');
      await this.verticalPolyline3D.setColor('rgba(255, 255, 0, 255)');
      await this.verticalPolyline3D.setLineWidth(10);
      await this.verticalPolyline3D.setAltitudeMode(AltitudeMode.NONE);
      await graphic3DsOverlay.addGraphic(this.verticalPolyline3D);
    }

    if (this.horizontalPolyline3D === null || this.horizontalPolyline3D === undefined) {
      this.horizontalPolyline3D = await GraphicPolyline3D.createInstance();
      await this.horizontalPolyline3D.setAttributeValue('name', 'VertexToEndPolyline3D');
      await this.horizontalPolyline3D.setColor('rgba(0, 0, 255, 255)');
      await this.horizontalPolyline3D.setLineWidth(10);
      await this.horizontalPolyline3D.setAltitudeMode(AltitudeMode.NONE);
      await graphic3DsOverlay.addGraphic(this.horizontalPolyline3D);
    }
  };

  showInfo = () => (
    this.state.disResultVisible ?
      <View style={style.itemView}>
        <Text style={style.itemKey}>直接距离</Text>
        <Text style={style.itemValue}>
          {this.state.mapInfo.get('directDis')}
        </Text>

        <Text style={style.itemKey}>水平距离</Text>
        <Text style={style.itemValue}>
          {this.state.mapInfo.get('horizontalDis')}
        </Text>

        <Text style={style.itemKey}>垂直距离</Text>
        <Text style={style.itemValue}>
          {this.state.mapInfo.get('verticalDis')}
        </Text>
      </View> :
      <View style={style.leftBottomView}>
        <Text style={style.itemValue}>
          操作步骤：
          {'\n'}
          1、开始量测
          {'\n'}
          2、点击地图绘制线（只会显示两个点）后，会显示量测距离
          {'\n'}
          3、若结束量测，不可再量测，需从第1步开始
        </Text>
      </View>
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
                this.startMeasureDistance();
              }}
            >
              <Text style={styles.text}>开始量测</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.stopMeasureDistance();
              }}
            >
              <Text style={styles.text}>结束量测</Text>
            </TouchableOpacity>
          </View>
        </View>

        {this.showInfo()}

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
