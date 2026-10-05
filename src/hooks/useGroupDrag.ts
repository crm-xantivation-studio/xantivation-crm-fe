'use client';

import { useRef, useCallback } from 'react';
import { Node, OnNodeDrag } from '@xyflow/react';

interface DragSnapshot {
  clusterId: string;
  clusterInitialPos: { x: number; y: number };
  memberInitialPositions: Map<string, { x: number; y: number }>;
}

export function useGroupDrag(
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
) {
  const snapshotRef = useRef<DragSnapshot | null>(null);

  const onNodeDragStart: OnNodeDrag<Node> = useCallback(
    (_, node) => {
      if (node.type === 'departmentCluster') {
        const clusterId = node.id;
        const memberPositions = new Map<string, { x: number; y: number }>();

        // Find all member nodes (by parentId or memberIds list in data)
        const memberIds: string[] = (node.data as any)?.memberIds || [];
        nodes.forEach((n) => {
          if (n.parentId === clusterId || memberIds.includes(n.id)) {
            memberPositions.set(n.id, { ...n.position });
          }
        });

        snapshotRef.current = {
          clusterId,
          clusterInitialPos: { ...node.position },
          memberInitialPositions: memberPositions,
        };
      }
    },
    [nodes]
  );

  const onNodeDrag: OnNodeDrag<Node> = useCallback(
    (_, node) => {
      // 1. If dragging a cluster node -> sync child member positions
      if (
        snapshotRef.current &&
        snapshotRef.current.clusterId === node.id &&
        node.type === 'departmentCluster'
      ) {
        const { clusterInitialPos, memberInitialPositions } = snapshotRef.current;
        const dx = node.position.x - clusterInitialPos.x;
        const dy = node.position.y - clusterInitialPos.y;

        setNodes((currentNodes) =>
          currentNodes.map((n) => {
            const initialPos = memberInitialPositions.get(n.id);
            if (initialPos && !n.parentId) {
              return {
                ...n,
                position: {
                  x: initialPos.x + dx,
                  y: initialPos.y + dy,
                },
              };
            }
            return n;
          })
        );
      }

      // 2. If dragging a child node -> dynamically auto-scale parent cluster container
      if (node.parentId) {
        const parentId = node.parentId;
        const nodeWidth = (node as any).measured?.width || 240;
        const nodeHeight = (node as any).measured?.height || 140;
        const rightEdge = node.position.x + nodeWidth;
        const bottomEdge = node.position.y + nodeHeight;

        setNodes((currentNodes) => {
          const parentCluster = currentNodes.find((n) => n.id === parentId);
          if (!parentCluster) return currentNodes;

          const currentWidth = Number(parentCluster.style?.width) || 400;
          const currentHeight = Number(parentCluster.style?.height) || 250;

          const neededWidth = Math.max(currentWidth, rightEdge + 40);
          const neededHeight = Math.max(currentHeight, bottomEdge + 40);

          if (neededWidth === currentWidth && neededHeight === currentHeight) {
            return currentNodes;
          }

          return currentNodes.map((n) =>
            n.id === parentId
              ? {
                  ...n,
                  style: {
                    ...n.style,
                    width: neededWidth,
                    height: neededHeight,
                  },
                }
              : n
          );
        });
      }
    },
    [setNodes]
  );

  const onNodeDragStop: OnNodeDrag<Node> = useCallback(
    (_, node) => {
      snapshotRef.current = null;

      // Final boundary check on drag release to ensure parent cluster fits all children
      if (node.parentId) {
        const parentId = node.parentId;
        setNodes((currentNodes) => {
          const parentCluster = currentNodes.find((n) => n.id === parentId);
          if (!parentCluster) return currentNodes;

          const children = currentNodes.filter((n) => n.parentId === parentId);
          if (children.length === 0) return currentNodes;

          let maxRight = 0;
          let maxBottom = 0;

          children.forEach((c) => {
            const w = (c as any).measured?.width || 240;
            const h = (c as any).measured?.height || 140;
            maxRight = Math.max(maxRight, c.position.x + w);
            maxBottom = Math.max(maxBottom, c.position.y + h);
          });

          const currentWidth = Number(parentCluster.style?.width) || 400;
          const currentHeight = Number(parentCluster.style?.height) || 250;

          const neededWidth = Math.max(currentWidth, maxRight + 40);
          const neededHeight = Math.max(currentHeight, maxBottom + 40);

          if (neededWidth === currentWidth && neededHeight === currentHeight) {
            return currentNodes;
          }

          return currentNodes.map((n) =>
            n.id === parentId
              ? {
                  ...n,
                  style: {
                    ...n.style,
                    width: neededWidth,
                    height: neededHeight,
                  },
                }
              : n
          );
        });
      }
    },
    [setNodes]
  );

  return {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  };
}
