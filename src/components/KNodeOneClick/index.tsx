import { useContext, useEffect } from 'react';
import { INode, NodeConfig } from '@antv/g6';
import { IG6GraphEvent, GraphinContext } from '@antv/graphin';

// 单击
export type NodeOneClickAttr = {
  nodeDetail?: Partial<any>;
  onOneClick: (values?: any) => Promise<void>;
};

// 单击
export const NodeOneClick: React.FC<NodeOneClickAttr> = (props) => {
  const { graph, apis } = useContext(GraphinContext);
  useEffect(() => {
    const handleClick = (evt: IG6GraphEvent) => {
      const node = evt.item as INode;
      const model = node.getModel() as NodeConfig;
      console.log(model);
      apis.focusNodeById(model.id);
      props.onOneClick(model.data);
    };

    // 每次点击聚焦到点击节点上
    graph.on('node:click', handleClick);
    // 双击展开节点
    // graph.on('node:dblclick', handleDoubleClick);
    return () => {
      graph.off('node:click', handleClick);
    };
  }, []);
  return null;
};
