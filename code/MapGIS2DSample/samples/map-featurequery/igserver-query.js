import React, { Component } from 'react';
import {
  View,
  ToastAndroid,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import styles from '../styles';
import { IGSERVER_BASE_URL } from '../utils';
import { IGSERVER_DOC_WUHAN_PATH } from '../utils';
import {
  Rect,
  MGMapView,
  FeatureQuery,
  QueryDef,
  ImageLayer,
  GraphicText,
  GeoMultiPoint,
  Map,
  Dot,
} from '@mapgis/uniform-core-react-native';

/**
 * @content IGServer服务地图查询
 * @author  2019-10-25 下午2:52:36
 */
export default class MapIGServerQuery extends Component {
  static navigationOptions = { title: 'IGServer服务地图查询' };

  constructor() {
    super();
    this.state = {
      result: [],
    };
  }

  onGetInstance = mapView => {
    this.mapView = mapView;
    this.openMap();
  };

  openMap = async () => {
    //创建mapserver
    let mapServer = await ImageLayer.createMapServer('MapGISIGServerVector');
    //为mapserver设置URL地址
    await mapServer.setURL(IGSERVER_DOC_WUHAN_PATH);

    let sLayer = await ImageLayer.createInstance();
    //为服务图层设置地图服务
    await sLayer.setMapServer(mapServer);
    await sLayer.setName('服务图层');

    let map = await Map.createInstance();
    await map.append(sLayer);
    let isFinish = await this.mapView.setMapAsync(map);
    if (isFinish) {
      ToastAndroid.show('地图加载完成', ToastAndroid.SHORT);
      let mapRange = await Rect.createInstance(
        12705276.572663,
        3542912.332349,
        12746062.17078,
        3607262.942711
      );
      await this.mapView.zoomToRange(mapRange, false);
    }
  };

  _featureQuery = async () => {
    let query = await FeatureQuery.createInstanceByIGSDoc(
      IGSERVER_BASE_URL,
      'WuHan',
      0,
      11
    );
    let condition = "Name like '%公园%'";
    let queryDef = await QueryDef.createInstance();
    await queryDef.setFilter(condition);
    await queryDef.setPagination(0, 100);
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await query.setQueryDef(queryDef);

    let featurePagedResult = await query.query();
    let getTotalFeatureCount = await featurePagedResult.getTotalFeatureCount();
    let graphicArry = [];
    let result = [];
    this.graphicsOverlay = await this.mapView.getGraphicsOverlay();
    let featureLst = await featurePagedResult.getPage(1);
    for (let i = 0; i < featureLst.length; i++) {
      let feature = await featureLst[i];
      let attributes = await feature.getAttributes();
      let attrName = attributes.Name;
      let attrAddr = attributes.Address;
      result.push({ name: attrName, key: i.toString() });
      result.push({ name: attrAddr, key: (-i).toString() });

      let graphicList = await feature.toGraphics(true);
      for (let j = 0; j < graphicList.length; j++) {
        graphicArry.push(graphicList[j]);
      }
      //获取要素的几何信息（默认查询点要素）
      let fGeometry = await feature.getGeometry();
      let featureType = await fGeometry.getType();

      if (featureType === 2) {
        let geoPoints = new GeoMultiPoint();
        geoPoints.ObjId = fGeometry.ObjId;
        let size = await geoPoints.length();
        for (let k = 0; k < size; k++) {
          let dot3D = await geoPoints.get(k);
          let dot3DX = await dot3D.getX();
          let dot3DY = await dot3D.getY();
          let dot = await Dot.createInstance(dot3DX, dot3DY);
          this.graphicText = await GraphicText.createInstance();
          await this.graphicText.setColor('rgba(0, 255, 255, 1)');
          await this.graphicText.setPoint(dot);
          await this.graphicText.setText(attrName);
          await this.graphicText.setFontSize(22);
          await this.graphicsOverlay.addGraphic(this.graphicText);
        }
      }
    }

    this.setState({ result });

    await this.graphicsOverlay.addGraphics(graphicArry);
    await this.mapView.refresh();
    ToastAndroid.show(
      '查询结果总数为：' + getTotalFeatureCount,
      ToastAndroid.SHORT
    );
  };

  //此处的item相当于listview中的一行中的一列的item,如果一列要显示几个信息在这个里面布局。(一行显示几个item，直接绑定每个item要显示的数据,构造的数据一个{}对应一个item--目前理解的每个item布局是一样)
  renderItem = ({ item }) => (
    <View style={localStyles.item}>
      {<Text style={localStyles.itemValue}>{item.name}</Text>}
    </View>
  );

  _separator = () => {
    return <View style={{ height: 1, backgroundColor: 'black' }} />;
  };

  _header = () => {
    return (
      <View style={localStyles.itemHeader}>
        <Text style={localStyles.itemHeaderValue}>名称</Text>
        <Text style={localStyles.itemHeaderValue}>地址</Text>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <MGMapView
          ref="mapView"
          onGetInstance={this.onGetInstance}
          style={styles.mapView}
        />
        <View style={styles.buttons}>
          <View style={styles.button}>
            <TouchableOpacity onPress={this._featureQuery}>
              <Text style={styles.text}>查询</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          style={localStyles.items}
          ListHeaderComponent={this._header}
          data={this.state.result}
          renderItem={this.renderItem}
          ItemSeparatorComponent={this._separator}
          numColumns={2}
        />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  items: {
    flex: 1,
    backgroundColor: '#292c36',
  },
  item: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
  },
  itemValue: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontSize: 16,
  },
  itemHeader: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  itemHeaderValue: {
    textAlign: 'center',
    textAlignVertical: 'center',
    flex: 1,
    color: 'rgba(245,83,61,0.8)',
    fontSize: 16,
  },
});
