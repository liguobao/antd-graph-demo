/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import { Card, Col, Input, Row, Select } from 'antd';
import { useLocation, history } from 'umi';
import Graphin, { Behaviors, TooltipValue, Components, Utils } from '@antv/graphin';
const { ZoomCanvas, Hoverable } = Behaviors;
const { Tooltip, ContextMenu, MiniMap } = Components;
import {
  TrademarkCircleFilled,
  ChromeFilled,
  BranchesOutlined,
  ApartmentOutlined,
  AppstoreFilled,
  CopyrightCircleFilled,
  CustomerServiceFilled,
  ShareAltOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, { ProFormSelect, QueryFilter } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import { NodeOneClick } from '@/components/KNodeOneClick';
import { ContextKNodeMenu, NodeDoubleClick } from '../kNoneHelper';

const iconMap = {
  'graphin-force': <ShareAltOutlined />,
  random: <TrademarkCircleFilled />,
  concentric: <ChromeFilled />,
  circle: <BranchesOutlined />,
  force: <AppstoreFilled />,
  dagre: <ApartmentOutlined />,
  grid: <CopyrightCircleFilled />,
  radial: <ShareAltOutlined />,
};

const SelectOption = Select.Option;
const LayoutSelector = (props: any) => {
  const { value, onChange, options } = props;
  // 包裹在graphin内部的组件，将获得graphin提供的额外props

  return (
    <div
    // style={{ position: 'absolute', top: 10, left: 10 }}
    >
      <Select style={{ width: '200px' }} value={value} onChange={onChange}>
        {options.map((item: any) => {
          const { type } = item;
          const iconComponent = iconMap[type] || <CustomerServiceFilled />;
          return (
            <SelectOption key={type} value={type}>
              {iconComponent} &nbsp;
              {type}
            </SelectOption>
          );
        })}
      </Select>
    </div>
  );
};


const GraphInLayouts = [
  {
    type: 'graphin-force',
  },
  {
    type: 'dagre',
    rankdir: 'LR', // 可选，默认为图的中心
    // align: 'DL', // 可选
    // nodesep: 20, // 可选
    // ranksep: 50, // 可选
    // controlPoints: true, // 可选
  },
  {
    type: 'mindmap',
  },
  {
    type: 'circular',
    // center: [200, 200], // 可选，默认为图的中心
    // radius: null, // 可选
    // startRadius: 10, // 可选
    // endRadius: 100, // 可选
    // clockwise: false, // 可选
    // divisions: 5, // 可选
    // ordering: 'degree', // 可选
    // angleRatio: 1, // 可选
  },
  {
    type: 'force',
    preventOverlap: true,
    // center: [200, 200], // 可选，默认为图的中心
    linkDistance: 50, // 可选，边长
    nodeStrength: 30, // 可选
    edgeStrength: 0.8, // 可选
    collideStrength: 0.8, // 可选
    nodeSize: 30, // 可选
    alpha: 0.9, // 可选
    alphaDecay: 0.3, // 可选
    alphaMin: 0.01, // 可选
    forceSimulation: null, // 可选
    onTick: () => {
      // 可选
      console.log('ticking');
    },
    onLayoutEnd: () => {
      // 可选
      console.log('force layout done');
    },
  },
  {
    type: 'gForce',
    linkDistance: 150, // 可选，边长
    nodeStrength: 30, // 可选
    edgeStrength: 0.1, // 可选
    nodeSize: 30, // 可选
    onTick: () => {
      // 可选
      console.log('ticking');
    },
    onLayoutEnd: () => {
      // 可选
      console.log('force layout done');
    },
    workerEnabled: false, // 可选，开启 web-worker
    gpuEnabled: false, // 可选，开启 GPU 并行计算，G6 4.0 支持
  },
  {
    type: 'concentric',
    maxLevelDiff: 0.5,
    sortBy: 'degree',
    // center: [200, 200], // 可选，

    // linkDistance: 50, // 可选，边长
    // preventOverlap: true, // 可选，必须配合 nodeSize
    // nodeSize: 30, // 可选
    // sweep: 10, // 可选
    // equidistant: false, // 可选
    // startAngle: 0, // 可选
    // clockwise: false, // 可选
    // maxLevelDiff: 10, // 可选
    // sortBy: 'degree', // 可选
    // workerEnabled: false, // 可选，开启 web-worker
  },
];

const layouts = GraphInLayouts;

export default () => {
  const [type, setLayout] = React.useState('graphin-force');
  const handleChange = (value: any) => {
    console.log('value', value);
    setLayout(value);
  };
  const pageLocation = useLocation();
  const [kNodeData, setKNodeData] = useState<any>({});

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const [currentRow, setCurrentRow] = useState<any>();

  const [tab, setTab] = useState('tab1');

  useEffect(() => {
    const fetchData = async () => {
      const graphData = Utils.mock(10).circle().graphin();
      setKNodeData(graphData);
    };
    fetchData();
  }, [pageLocation]);

  const defaultNodeStatusStyle = {
    status: {
      hover: {
        halo: {
          animate: {
            attrs: (ratio: any) => {
              const startR = 20;
              const diff = 26 - startR;
              return {
                r: startR + diff * ratio,
                opacity: 0.5 + 0.5 * ratio,
              };
            },
            duration: 200,
            easing: 'easeCubic',
            delay: 0,
            repeat: false,
          },
        },
      },
    },
  };

  const tooltipStyle = {
    background: '#fff',
    width: '500px',
    // heigh: '300px',
  };

  const [parentId, setParentId] = useState<Number>(0);

  const ParentSelectChange = {
    onChange: (val: Number) => {
      setParentId(val);
      console.log('onChange,val:', val);
      if (val) {
        history.push('/ck/graph-in?node_id=' + val);
      }
    },
  };

  // 属性扩展信息转换成Div列表
  const parseExtendDataToDivList = function (attrItem: any) {
    var extendData = attrItem.extend_data;
    var dataList = extendData.split(RegExp('\n|,|;')).filter((i: string) => i.length > 0);
    var displayText = dataList.join('\n');
    return [<pre>{displayText}</pre>];
  };

  var divList = parseExtendDataToDivList({ "extend_data": "1;2;3;4;5;6;7;8;9;10" });

  const layout = layouts.find((item: any) => item.type === type);
  return (
    <PageContainer
      title="社区知识图谱"
      extra={
        <LayoutSelector
          options={layouts}
          value={type}
          onChange={handleChange}
          defaultNodeStatusStyle={defaultNodeStatusStyle}
        />
      }
    >
      <Row style={{ height: '90%' }}>
        <Col span={20}>
          <ProCard>
            <QueryFilter layout="vertical" span={6} split={true}>
              <ProForm.Group key="p_group_1">
                <ProFormSelect
                  name="parent_id_1"
                  label="一级知识节点"
                  showSearch
                  fieldProps={ParentSelectChange}
                />
                <ProFormSelect
                  name="parent_id_2"
                  label="二级知识节点"
                  dependencies={['parent_id_1']}
                  fieldProps={ParentSelectChange}
                />
                <ProFormSelect
                  name="parent_id_3"
                  label="三级知识节点"
                  dependencies={['parent_id_2']}
                  fieldProps={ParentSelectChange}
                />
                <ProFormSelect
                  name="parent_id_4"
                  label="四级知识节点"
                  dependencies={['parent_id_3']}
                  fieldProps={ParentSelectChange}
                />
              </ProForm.Group>

              <ProFormSelect
                name="archive_id"
                label="稿件"
                showSearch
                colSize={12}
                fieldProps={ParentSelectChange}
              />
            </QueryFilter>

            <Graphin data={kNodeData as any} layout={layout}>
              <NodeDoubleClick />
              <NodeOneClick
                onOneClick={async (val: any) => {
                  setCurrentRow({ "test": "124" });
                  debugger
                  setShowDetail(true);
                }}
              />
              <ZoomCanvas />
              <Hoverable bindType="node" />
              <Tooltip bindType="node" placement={'top'} style={tooltipStyle}>
                {(value: TooltipValue) => {
                  // if (value.model) {
                  //   const { model } = value;
                  //   setCurrentRow(model.data);
                  //   return null;
                  // }
                  return null;
                }}
              </Tooltip>
              <ContextMenu style={{ background: '#fff' }} bindType="node">
                {(value) => {
                  return <ContextKNodeMenu {...value} />;
                }}
              </ContextMenu>
              <MiniMap />
            </Graphin>
          </ProCard>
        </Col>
        <Col span={4} style={{ border: '0px solid transparent', borderLeftWidth: 4 }}>
          <div>{currentRow && <ProCard
            title={"Test"}
            // extra={attrItem.attr}
            tooltip={"Test123"}
            style={{ maxWidth: 600 }}
            size="small"
          >
            <ProCard.TabPane key="12333" tab={"TestTab"}>
              <div style={{ overflow: 'auto', height: '480px' }}>{divList}</div>
            </ProCard.TabPane>
          </ProCard>}</div>
        </Col>
      </Row>
    </PageContainer>
  );
};
