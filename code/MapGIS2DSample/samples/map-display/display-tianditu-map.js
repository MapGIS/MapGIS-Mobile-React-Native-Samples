import React, { Component } from 'react';
import { View, ToastAndroid } from 'react-native';
import styles from '../styles';
import {
  MGMapView,
  Map,
  MapServer,
  ImageLayer,
  Rect,
} from '@mapgis/uniform-core-react-native';
import { TIANDITU_VECTOR_PATH, TIANDITU_ANNO_PATH } from '../utils';

/**
 * @content 天地图示例
 * @author xiaoying 2019-11-25
 */
export default class DisplayTianDiTuMap extends Component {
  static navigationOptions = { title: '天地图' };
  onGetInstance = mapView => {
    this.mapView = mapView;
    this.showMap();
  };

  showMap = async () => {
    this.map = await Map.createInstance();

    // 天地图矢量
    let mapServer = await ImageLayer.createMapServer(
      MapServer.MapServerType.MAPSERVER_TYPE_TIANDITU,
    );
    await mapServer.setName('Tianditu_vec');
    await mapServer.setAuthentication('tk', 'ad6c6a0bd9b1fa421dfd77ba49e70ecf');
    await mapServer.setURL(TIANDITU_VECTOR_PATH);

    let serverLayerObj = await ImageLayer.createInstance();
    await serverLayerObj.setMapServer(mapServer);
    await this.map.append(serverLayerObj);
    // 天地图注记
    let mapServerAnno = await ImageLayer.createMapServer(
      MapServer.MapServerType.MAPSERVER_TYPE_TIANDITU,
    );
    await mapServerAnno.setName('Tianditu_cva');
    await mapServerAnno.setAuthentication(
      'tk',
      'ad6c6a0bd9b1fa421dfd77ba49e70ecf'
    );
    await mapServerAnno.setURL(TIANDITU_ANNO_PATH);

    let serverLayerAnnoObj = await ImageLayer.createInstance();
    await serverLayerAnnoObj.setMapServer(mapServer);
    await this.map.append(serverLayerAnnoObj);

    let isFinish = await this.mapView.setMapAsync(this.map);
    if (isFinish) {
      ToastAndroid.show('地图加载完成', ToastAndroid.SHORT);
      let rectObj = await Rect.createInstance(
        113.702281,
        29.969077,
        115.082573,
        31.36126
      );

      await this.mapView.zoomToRange(rectObj, false);
    } else {
      ToastAndroid.show(
        '在线地图加载失败，请确保网络已连接',
        ToastAndroid.SHORT
      );
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <MGMapView
          ref="mapView"
          onGetInstance={this.onGetInstance}
          style={styles.mapView}
        />
      </View>
    );
  }
}
