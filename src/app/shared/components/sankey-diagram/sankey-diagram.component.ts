import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/** A single node/stage in the sankey (e.g. "Manager Review"). `column`
 * is 0-indexed left-to-right (0 = source column). */
export interface SankeyNode {
  id: string;
  label: string;
  value: number;
  color: string;
  column: number;
}

/** A flow between two nodes. Thickness is normalized independently
 * against the source's total outgoing value and the target's total
 * incoming value, so links always exactly fill the node edge they touch
 * even when the dataset isn't strictly flow-conserving. */
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface RenderNode {
  id: string;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RenderLink {
  path: string;
  color: string;
}

@Component({
  selector: 'app-sankey-diagram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sankey-diagram.component.html',
  styleUrl: './sankey-diagram.component.scss',
})
export class SankeyDiagramComponent implements OnChanges {

  @Input() nodes: SankeyNode[] = [];
  @Input() links: SankeyLink[] = [];
  @Input() width = 460;
  @Input() height = 210;
  @Input() nodeWidth = 12;
  @Input() nodeGap = 14;

  renderNodes: RenderNode[] = [];
  renderLinks: RenderLink[] = [];

  ngOnChanges(_changes: SimpleChanges): void {
    this.build();
  }

  private build(): void {
    if (!this.nodes.length) {
      this.renderNodes = [];
      this.renderLinks = [];
      return;
    }

    const columnIndexes = Array.from(new Set(this.nodes.map((n) => n.column))).sort((a, b) => a - b);
    const columnCount = columnIndexes.length;
    const columnGap = columnCount > 1 ? (this.width - this.nodeWidth * columnCount) / (columnCount - 1) : 0;

    const positioned = new Map<string, RenderNode>();

    columnIndexes.forEach((col, colIdx) => {
      const colNodes = this.nodes.filter((n) => n.column === col);
      const colTotal = colNodes.reduce((sum, n) => sum + n.value, 0) || 1;
      const totalGap = this.nodeGap * Math.max(0, colNodes.length - 1);
      const availableHeight = Math.max(this.height - totalGap, 10);
      const x = colIdx * (this.nodeWidth + columnGap);

      let cursorY = 0;
      colNodes.forEach((n) => {
        const h = Math.max((n.value / colTotal) * availableHeight, 4);
        positioned.set(n.id, {
          id: n.id,
          label: n.label,
          value: n.value,
          color: n.color,
          x,
          y: cursorY,
          width: this.nodeWidth,
          height: h,
        });
        cursorY += h + this.nodeGap;
      });
    });

    this.renderNodes = Array.from(positioned.values());

    const outgoingTotals = new Map<string, number>();
    const incomingTotals = new Map<string, number>();
    this.links.forEach((l) => {
      outgoingTotals.set(l.source, (outgoingTotals.get(l.source) ?? 0) + l.value);
      incomingTotals.set(l.target, (incomingTotals.get(l.target) ?? 0) + l.value);
    });

    const outgoingCursor = new Map<string, number>();
    const incomingCursor = new Map<string, number>();

    this.renderLinks = this.links
      .map((l) => {
        const src = positioned.get(l.source);
        const tgt = positioned.get(l.target);
        if (!src || !tgt) return null;

        const srcTotal = outgoingTotals.get(l.source) || 1;
        const tgtTotal = incomingTotals.get(l.target) || 1;

        const srcSpan = (l.value / srcTotal) * src.height;
        const tgtSpan = (l.value / tgtTotal) * tgt.height;

        const srcY0 = src.y + (outgoingCursor.get(l.source) ?? 0);
        const tgtY0 = tgt.y + (incomingCursor.get(l.target) ?? 0);

        outgoingCursor.set(l.source, (outgoingCursor.get(l.source) ?? 0) + srcSpan);
        incomingCursor.set(l.target, (incomingCursor.get(l.target) ?? 0) + tgtSpan);

        const x0 = src.x + src.width;
        const x1 = tgt.x;
        const xMid = (x0 + x1) / 2;

        const path =
          `M ${x0} ${srcY0} C ${xMid} ${srcY0}, ${xMid} ${tgtY0}, ${x1} ${tgtY0} ` +
          `L ${x1} ${tgtY0 + tgtSpan} C ${xMid} ${tgtY0 + tgtSpan}, ${xMid} ${srcY0 + srcSpan}, ${x0} ${srcY0 + srcSpan} Z`;

        return { path, color: src.color };
      })
      .filter((l): l is RenderLink => l !== null);
  }

  trackByNodeId(_index: number, node: RenderNode | SankeyNode): string {
    return node.id;
  }
}
