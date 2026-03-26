export interface ReservationRecord {
  tick: number;
  nodeId: string;
  robotId: string;
}

export class ReservationTable {
  private nodeReservations = new Map<string, string>();
  private edgeReservations = new Map<string, string>();

  reserveNode(tick: number, nodeId: string, robotId: string): void {
    this.nodeReservations.set(`${tick}:${nodeId}`, robotId);
  }

  reserveEdge(tick: number, from: string, to: string, robotId: string): void {
    this.edgeReservations.set(`${tick}:${from}->${to}`, robotId);
  }

  isNodeReserved(tick: number, nodeId: string, robotId: string): boolean {
    const owner = this.nodeReservations.get(`${tick}:${nodeId}`);
    return owner !== undefined && owner !== robotId;
  }

  isEdgeSwapReserved(tick: number, from: string, to: string, robotId: string): boolean {
    const owner = this.edgeReservations.get(`${tick}:${to}->${from}`);
    return owner !== undefined && owner !== robotId;
  }
}
