import { ContextMenuValue } from '@antv/graphin';
import { Menu } from 'antd';
import { useContext, useEffect } from 'react';
import { history } from 'umi';
import { INode, NodeConfig } from '@antv/g6';
import Graphin, { IG6GraphEvent, GraphinContext } from '@antv/graphin';

// 属性扩展信息转换成Div列表
export const parseExtendDataToDivList = function (attrItem: any) {
  var extendData = attrItem.extend_data;
  var dataList = extendData.split(RegExp('\n|,|;')).filter((i: string) => i.length > 0);
  var itemList = dataList.slice(0, 20);

  if (attrItem.attr == 'links') {
    return itemList?.map((v: any) => {
      var oidArray = v.split('|');
      var linkURL = oidArray.length > 1 ? oidArray[1] : '#';
      return (
        <p key={v}>
          <a href={linkURL} target="_blank">
            {oidArray[0]}
          </a>
        </p>
      );
    });
  }
  var displayText = dataList.join('\n');
  return [<pre>{displayText}</pre>];
};

// 扩展信息转换成数组
export const parseExtendDataToList = function (attrItem: any) {
  var extendData = attrItem.extend_data;
  var dataList = extendData.split(RegExp('\n|,|;')).filter((i: string) => i.length > 0);
  return dataList?.map((v: any) => {
    return {
      id: v,
      href: '#',
    };
  });
};

export const ContextKNodeMenu = (value: ContextMenuValue) => {
  const handleClick = (e: { key: unknown }) => {
    const { onClose, id } = value;
    var itemNodeData: any = {};
    if (value.item?.getModel().data) {
      itemNodeData = value.item?.getModel().data;
    }
    // message.info(`${e.key}:${id}`);
    // if (e.key == 'editNode') {
    //   history.push('/ck/c-knowledge-page?id=' + id);
    // }
    // if (e.key == 'addNode') {
    //   history.push('/ck/c-knowledge-page?parent_id=' + itemNodeData.parent_id);
    // }
    if (e.key == 'showChildrenNode') {
      history.push('/ck/graph-in?node_id=' + id);
    }
    if (e.key == 'showParentNode') {
      history.push('/ck/graph-in?node_id=' + itemNodeData.parent_id);
    }
    onClose();
  };

  const { id } = value;
  const itemNodeData: any = value.item?.getModel()?.data;

  return (
    <Menu onClick={handleClick}>
      <Menu.Item key="editNodeNew">
        <a href={'/community-knowledge-graph/ck/c-knowledge-page?id=' + id} target="_blank">
          编辑节点
        </a>
      </Menu.Item>
      <Menu.Item key="addNodeNew">
        <a
          href={'/community-knowledge-graph/ck/c-knowledge-page?parent_id=' + itemNodeData?.id}
          target="_blank"
        >
          添加子节点
        </a>
      </Menu.Item>
      <Menu.Item key="showChildrenNode">展开子节点</Menu.Item>
      <Menu.Item key="showParentNode">回溯父节点</Menu.Item>
    </Menu>
  );
};

// 双击
export const NodeDoubleClick = () => {
  const { graph, apis } = useContext(GraphinContext);
  useEffect(() => {
    const handleDoubleClick = (evt: IG6GraphEvent) => {
      const node = evt.item as INode;
      const model = node.getModel() as NodeConfig;
      apis.focusNodeById(model.id);
      if (model.data) {
        var itemNodeData: any = model.data;
        history.push('/ck/graph-in?node_id=' + itemNodeData.id);
      }
    };

    // graph.on('node:click', handleClick);
    // 双击展开节点
    graph.on('node:dblclick', handleDoubleClick);
    return () => {
      graph.off('node:dblclick', handleDoubleClick);
    };
  }, []);
  return null;
};
