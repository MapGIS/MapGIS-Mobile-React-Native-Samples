import React, { Component } from 'react';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import {
  MGSceneView,
  Scene,
  ServerLayer3D,
  DriverType,
  MapServer,
  SRSType,
  SunLightingMode,
  VectorLayer3D,
  ModelCacheLayer3D,
  Viewpoint,
  Dot3D,
  TerrainLayer3D,
  LayerState,
  ObjectManager
} from '@mapgis/uniform-core-react-native';
import {
  MCJ_FILE_JINGGUAN_PATH,
  OP_FILE_PATH1,
  SHP_FILE_PATH,
  TERRAIN_FILE_PATH,
  TIF_FILE_PATH
} from '../utils';

export default class SceneViewData extends Component {
  static navigationOptions = { title: '场景数据加载' };

  constructor() {
    super();
    this.state = {
      data: [
        {
          id: 'IGServer三维服务',
        },
        {
          id: 'IGServer瓦片',
        },
        {
          id: 'IGServer矢量',
        },
        {
          id: '在线高德地图',
        },
        {
          id: '在线WMS',
        },
        {
          id: '在线WFS',
        },
        {
          id: '影像tif数据',
        },
        {
          id: '三维矢量',
        },
        {
          id: '倾斜摄影',
        },
        {
          id: '三维地形',
        },
        {
          id: '本地M3D',
        },
        {
          id: '在线M3D',
        },
      ],
      selectedId: '',
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  setSelect = (item) => {
    this.setState({ selectedId: item.id })
    if (item.id == 'IGServer三维服务') {
      this.igserver3d();
    } else if (item.id == 'IGServer瓦片') {
      this.tileIGServer();
    } else if (item.id == 'IGServer矢量') {
      this.vectorIGServer();
    } else if (item.id == '在线高德地图') {
      this.amap();
    } else if (item.id == '在线WMS') {
      this.wms();
    } else if (item.id == '在线WFS') {
      this.wfs();
    } else if (item.id == '影像tif数据') {
      this.tif3d();
    } else if (item.id == '三维矢量') {
      this.vectorlayer3d();
    } else if (item.id == '倾斜摄影') {
      this.modle3d();
    } else if (item.id == '三维地形') {
      this.terrainLayer3d();
    } else if (item.id == '本地M3D') {
      this.localM3dLayer();
    } else if (item.id == '在线M3D') {
      this.serverM3dLayer();
    }
  }

  igserver3d = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();

    let mapServer3D = await ServerLayer3D.createMapServer(ServerLayer3D.MapServerType.MAPSERVER_TYPE_IGSERVER_SCENE);
    await mapServer3D.setName('IGServer3D');
    await mapServer3D.setURL('http://develop.smaryun.com:6163/igs/rest/g3d/WorldJWScene');

    await serverLayer.setMapServer(mapServer3D);
    await serverLayer.setDriverType(DriverType.Driver_Type_MapGIS_3D);

    await scene.addLayer(serverLayer);

    await this.sceneView.setSceneAsync(scene);
  };

  tileIGServer = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();

    let mapServerIGS = await ServerLayer3D.createMapServer(MapServer.MapServerType.MAPSERVER_TYPE_IGSERVER_TILE);
    await mapServerIGS.setName('IGServerTitle');
    await mapServerIGS.setURL('http://develop.smaryun.com:6163/igs/rest/mrms/tile/JWWORLDTILE');

    await serverLayer.setMapServer(mapServerIGS);
    await serverLayer.setDriverType(DriverType.Driver_Type_MapGIS_Map);
    await scene.addLayer(serverLayer);

    await this.sceneView.setSceneAsync(scene);
  };

  vectorIGServer = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();

    let mapServerVector = await ServerLayer3D.createMapServer(MapServer.MapServerType.MAPSERVER_TYPE_IGSERVER_VECTOR);
    await mapServerVector.setName('gdal_tiff');
    await mapServerVector.setURL('http://develop.smaryun.com:6163/igs/rest/mrms/docs/WorldJWVector');

    await serverLayer.setMapServer(mapServerVector);
    await serverLayer.setDriverType(DriverType.Driver_Type_MapGIS_Map);
    await serverLayer.setSRSByString(SRSType.SRS_Type_Global);

    await scene.addLayer(serverLayer);

    await this.sceneView.setSceneAsync(scene);
  };

  amap = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();

    await serverLayer.setName('AMap');
    await serverLayer.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);
    await serverLayer.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');
    await scene.addLayer(serverLayer);

    await this.sceneView.setSceneAsync(scene);
  };

  wms = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();

    await serverLayer.setDriverType(DriverType.Driver_Type_WMS);
    let mapServer = await ServerLayer3D.createMapServer(MapServer.MapServerType.MAPSERVER_TYPE_OGC_WMS);
    await serverLayer.setMapServer(mapServer);
    await serverLayer.setURL('http://develop.smaryun.com:6163/igs/rest/ogc/layer/WorldJWVectLayer/WMSServer');
    await scene.addLayer(serverLayer);

    await this.sceneView.setSceneAsync(scene);
  };

  wfs = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();

    await serverLayer.setName('wfs');
    await serverLayer.setDriverType(DriverType.Driver_Type_WFS);
    let mapServer = await ServerLayer3D.createMapServer(ServerLayer3D.MapServerType.MAPSERVER_TYPE_OGC_WFS)
    await serverLayer.setMapServer(mapServer);
    await serverLayer.setURL('http://gisserver.tianditu.gov.cn/TDTService/wfs');

    let isValid = await serverLayer.isValid();
    if (isValid) {
      let count = await serverLayer.getLayerCount();
      for (let i = 0; i < count; i++) {
        let layer = await serverLayer.getLayer(i);
        let name = await layer.getName();
        if (name == 'TDTService:BOUL') {
          await layer.setState(LayerState.Visible);
        }
      }

      await scene.addLayer(serverLayer);

      await this.sceneView.setSunLightingMode(SunLightingMode.NONE);
      await this.sceneView.setScene(scene);
    }

  };

  tif3d = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();

    await serverLayer.setName('gdal_tiff');
    await serverLayer.setDriverType(DriverType.Driver_Type_GDAL);
    await serverLayer.setURL(TIF_FILE_PATH);

    await scene.addLayer(serverLayer);

    await this.sceneView.setSceneAsync(scene);
  };

  vectorlayer3d = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await VectorLayer3D.createInstance();

    await serverLayer.setDriverType(DriverType.Driver_Type_OGR);
    await serverLayer.setURL(SHP_FILE_PATH);

    await scene.addLayer(serverLayer);

    await this.sceneView.setSceneAsync(scene);
  };

  modle3d = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();
    let modelCacheLayer3D = await ModelCacheLayer3D.createInstance();

    await serverLayer.setName('Google');
    await serverLayer.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    await modelCacheLayer3D.setDriverType(DriverType.Driver_Type_Model_MapGIS_OP);
    await modelCacheLayer3D.setURL(OP_FILE_PATH1);

    await scene.addLayer(serverLayer);
    await scene.addLayer(modelCacheLayer3D);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      let viewpoint5 = await Viewpoint.createInstance();
      let dot3D = await Dot3D.createInstance(108.959624, 34.219806, -0.000005);
      await viewpoint5.setFocalPoint(dot3D);
      await viewpoint5.setHeadingDeg(0.75804232150415196);
      await viewpoint5.setPitchDeg(-16.093499328460833);
      await viewpoint5.setRange(1000);
      await this.sceneView.jumptoViewPoint(viewpoint5, 2.0);
    }
  };

  terrainLayer3d = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();
    let terrainLayer3D = await TerrainLayer3D.createInstance();

    await serverLayer.setName('google');
    await serverLayer.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    await terrainLayer3D.setDriverType(DriverType.Driver_Type_GDAL);
    await terrainLayer3D.setURL(TERRAIN_FILE_PATH);

    await scene.addLayer(serverLayer);
    await scene.addLayer(terrainLayer3D);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      let terrainViewpoint = await Viewpoint.createInstance();
      let dot3D = await Dot3D.createInstance(86.4783, 27.5004, 2909);
      await terrainViewpoint.setFocalPoint(dot3D);
      await terrainViewpoint.setHeadingDeg(19.72459976);
      await terrainViewpoint.setPitchDeg(-41.6339);
      await terrainViewpoint.setRange(126331);
      await this.sceneView.jumptoViewPoint(terrainViewpoint, 2.0);
    }
  };

  localM3dLayer = async () => {
    let scene = await Scene.createInstance();

    let serverLayer = await ServerLayer3D.createInstance();
    await serverLayer.setName('google');
    await serverLayer.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    let cacheLayer = await ModelCacheLayer3D.createInstance();
    await cacheLayer.setDriverType(DriverType.Driver_Type_Model_MapGIS_M3D);
    await cacheLayer.setURL(MCJ_FILE_JINGGUAN_PATH);

    await scene.addLayer(serverLayer);
    await scene.addLayer(cacheLayer);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      let dot3d = await Dot3D.createInstance(108.961100, 34.220175, 0);
      let viewpoint = await Viewpoint.createInstanceByParam(dot3d, 0.75804232150415196, -16.093499328460833, 2000);
      await this.sceneView.jumptoViewPoint(viewpoint, 2.0);
    }
  };

  serverM3dLayer = async () => {
    let scene = await Scene.createInstance();

    let serverLayer = await ServerLayer3D.createInstance();
    await serverLayer.setName('google');
    await serverLayer.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    let m3dServerLayer3D = await ServerLayer3D.createInstance();
    let mapServer = await ServerLayer3D.createMapServer(ServerLayer3D.MapServerType.MAPSERVER_TYPE_IGSERVER_SCENE);
    await mapServer.setURL('http://develop.smaryun.com:6163/igs/rest/g3d/jingguan');

    await m3dServerLayer3D.setMapServer(mapServer);

    await scene.addLayer(serverLayer);
    await scene.addLayer(m3dServerLayer3D);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      let dot3d = await Dot3D.createInstance(108.961100, 34.220175, 0);
      let viewpoint = await Viewpoint.createInstanceByParam(dot3d, 0.75804232150415196, -16.093499328460833, 2000);
      await this.sceneView.jumptoViewPoint(viewpoint, 2.0);
    }
  };

  renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        this.setSelect(item)
      }}
    >
      <View style={styles.listItem}>
        <Text style={{
          fontSize: 16,
          color: item.id == this.state.selectedId ? ('#ffff00') : ('#fff'),
        }}>{item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={styles.container}>
        <MGSceneView
          ref='sceneView'
          onGetInstance={this.onGetInstance}
          style={styles.sceneView}
        />
        <FlatList
          style={styles.list}
          keyExtractor={(item) => item.id}
          data={this.state.data}
          extraData={this.state.selectedId}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}
