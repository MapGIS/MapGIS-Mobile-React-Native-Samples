import React, { Component } from 'react';
import { View } from 'react-native';
import styles from '../styles';
import { TILE_MAPX_PATH, TILE_FILE_PATH } from '../utils';
import { Rect, MGMapView, Document, ImageLayer, MapServer, Map } from '@mapgis/mobile-react-native';

export default class OfflineTileMap extends Component {
  static navigationOptions = { title: '离线瓦片地图' };
  onGetInstance = mapView => {
    this.mapView = mapView;
    //方法1
    this.openMap1();
    // //方法2
    // this.openMap2();
    // //方法3
    // this.openMap3();
    // //方法4
    // this.openMap4();
  };

  openMap1 = async () => {
    await this.mapView.loadFromFile(TILE_MAPX_PATH);
    // //缩放地图到指定范围
    // let mapRange = await Rect.createInstance(
    //   9447553.589026,
    //   113305.17237,
    //   14274321.311746,
    //   7728872.023773
    // );
    // await this.mapView.zoomToRange(mapRange, false);
  };

  openMap2 = async () => {
    //创建document对象
    let doc = await Document.createInstance();
    //打开数据
    await doc.open(TILE_MAPX_PATH);

    //同步方法
    await this.mapView.loadFromDocument(doc, 0);
  };

  openMap3 = async () => {
    //创建document对象
    let doc = await Document.createInstance();
    //打开数据
    await doc.open(TILE_MAPX_PATH);
    //获取地图集
    let maps = await doc.getMaps();
    //获取第一个map
    let map = await maps.getMap(0);

    //同步方法：为mapview设置map
    await this.mapView.setMap(map);
  };

  openMap4 = async () => {
    //创建服务图层
    let serverLayer = await ImageLayer.createInstance();
    //创建地图服务
    let mapserver = await ImageLayer.createMapServer(
      MapServer.MapServerType.MAPSERVER_TYPE_TDF,
    );
    //为地图服务设置URL：tdf瓦片文件路径
    await mapserver.setURL(TILE_FILE_PATH);
    //为服务图层设置地图服务
    await serverLayer.setMapServer(mapserver);

    let map = await Map.createInstance();
    await map.append(serverLayer);

    //同步方法
    await this.mapView.setMap(map);
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
