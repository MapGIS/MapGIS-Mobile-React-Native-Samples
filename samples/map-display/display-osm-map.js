import React, { Component } from 'react';
import { View, ToastAndroid } from 'react-native';
import styles from '../styles';
import {
  MGMapView,
  Map,
  MapServer,
  ServerLayer,
  Rect,
} from '@mapgis/mobile-react-native';

/**
 * @content OSM地图示例
 * @author xiaoying 2019-11-25
 */
export default class DisplayOSMMap extends Component {
  static navigationOptions = { title: 'OSM地图' };
  onGetInstance = mapView => {
    this.mapView = mapView;
    this.showMap();
  };

  showMap = async () => {
    let mapObj = new Map();
    this.map = await mapObj.createObj();

    let mapServer = await ServerLayer.createMapServer(
      MapServer.MapServerType.MAPSERVER_TYPE_OPENSTREET_STANDARD
    );
    await mapServer.setName('OpenStreetStandard');

    let serverLayer = new ServerLayer();
    let serverLayerObj = await serverLayer.createObj();
    await serverLayerObj.setMapServer(mapServer);
    await this.map.append(serverLayerObj);
    let isFinish = await this.mapView.setMapAsync(this.map);
    if (isFinish) {
      ToastAndroid.show('地图加载完成', ToastAndroid.SHORT);
      let rect = new Rect();
      let rectObj = await rect.createObj(
        12657279.9729537,
        3499575.59914544,
        12810933.4755397,
        3679755.0409897
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
