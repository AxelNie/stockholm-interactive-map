class Node {
  public point: any;
  public axis: number;
  public left: Node | null;
  public right: Node | null;

  constructor(point: any, axis: number, left: Node | null, right: Node | null) {
    this.point = point;
    this.axis = axis;
    this.left = left;
    this.right = right;
  }
}

interface TravelTimeData {
  lat: number;
  lng: number;
  fastestTime: number;
}

const euclideanDistance = (pointA: any, pointB: any): number => {
  const deltaX = pointA.lng - pointB.lng;
  const deltaY = pointA.lat - pointB.lat;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

const closest = (station1: any, station2: any, target: any): any => {
  if (station1 == null) return station2;

  if (station2 == null) return station1;
  const d1 = euclideanDistance(station1.point, target);
  const d2 = euclideanDistance(station2.point, target);

  if (d1 < d2) return station1;
  else return station2;
};

export const findClosestNode = (
  tree: TravelTimeData[],
  targetPoint: any
): any => {
  let closestNode = null;
  let nextNode = null;

  const search = (node: Node | null): any => {
    if (node == null) return closestNode;
    let otherNode = null;

    if (node.axis === 0) {
      if (node.point.lng > targetPoint.lng) {
        nextNode = node.left;
        otherNode = node.right;
      } else {
        nextNode = node.right;
        otherNode = node.left;
      }
    } else {
      if (node.point.lat > targetPoint.lat) {
        nextNode = node.left;
        otherNode = node.right;
      } else {
        nextNode = node.right;
        otherNode = node.left;
      }
    }

    let temp = search(nextNode);
    closestNode = closest(temp, node, targetPoint);
    let closestDistance = euclideanDistance(closestNode.point, targetPoint);

    //There might still be one point closer
    if (node.axis === 0) {
      const dist = Math.abs(node.point.lng - targetPoint.lng);
      if (dist <= closestDistance) {
        temp = search(otherNode);
        if (temp != null) {
          const distance = euclideanDistance(temp, targetPoint);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestNode = temp;
          }
        }
        const distance = euclideanDistance(temp, targetPoint);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNode = temp;
        }
      }
    } else {
      const dist = Math.abs(node.point.lat - targetPoint.lat);
      if (dist <= closestDistance) {
        temp = search(otherNode);
        if (temp != null) {
          const distance = euclideanDistance(temp, targetPoint);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestNode = temp;
          }
        }
      }
    }

    return closestNode;
  };
  const closestStation = search(tree);

  if (closestStation == null) return null;

  return closestStation.point;
};

export const buildTree = (points: any[], depth = 0): Node | null => {
  if (!points.length) return null;

  const axis = depth % 2;

  let sortKey = "lng";
  if (axis === 1) {
    sortKey = "lat";
  }

  points.sort((a, b) => a[sortKey] - b[sortKey]);

  const medianIndex = Math.floor(points.length / 2);
  const medianPoint = points[medianIndex];

  const leftPoints = points.slice(0, medianIndex);
  const rightPoints = points.slice(medianIndex + 1);

  const tree = new Node(
    medianPoint,
    axis,
    buildTree(leftPoints, depth + 1),
    buildTree(rightPoints, depth + 1)
  );

  return tree;
};
