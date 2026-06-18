/**
 * 曲线攻击箭头算法（重写）
 *
 * 控制点语义：points[0]=尾左, points[1]=尾右, points[2..n-1]=中间控制点, points[n-1]=箭头尖
 * 算法步骤：
 *   1. 尾部中点 + 中间点 + 箭头尖 → B-spline 拟合中轴线
 *   2. 累积弧长参数化
 *   3. 沿中轴线法线方向偏移生成左右轮廓（宽度从尾到颈线性收窄）
 *   4. 在颈部位置拼接三角形箭头
 *   5. 连接成闭合多边形
 */
import type { Point } from './bindtype-curve';
import { getBSplinePoints, midPoint, distance, angle, offsetPoint } from './bindtype-curve';

export function curveAttackArrow(
  points: Point[],
  headHeightFactor = 0.18,
  headWidthFactor = 2.5,
  neckWidthFactor = 0.4,
): Point[] {
  if (points.length < 3) return [];

  const tailLeft = points[0];
  const tailRight = points[1];
  const head = points[points.length - 1];

  // ---- 1. 中轴线 ----
  const tailMid = midPoint(tailLeft, tailRight);
  const midControls = points.length > 3 ? points.slice(2, -1) : [];
  const spineRaw: Point[] = [tailMid, ...midControls, head];
  const spine = getBSplinePoints(spineRaw, 100);

  // ---- 2. 累积弧长 ----
  const arcLen: number[] = [0];
  for (let i = 1; i < spine.length; i++) {
    arcLen.push(arcLen[i - 1] + distance(spine[i - 1], spine[i]));
  }
  const totalLen = arcLen[arcLen.length - 1];
  if (totalLen < 1e-10) return [];

  // ---- 3. 计算尺寸 ----
  const tailWidth = distance(tailLeft, tailRight);
  const headHeight = totalLen * headHeightFactor;
  const bodyLen = totalLen - headHeight;
  const neckWidth = tailWidth * neckWidthFactor;
  const headWidth = tailWidth * headWidthFactor;

  // ---- 4. 沿中轴线偏移生成箭身轮廓 ----
  const leftBody: Point[] = [];
  const rightBody: Point[] = [];

  for (let i = 0; i < spine.length; i++) {
    const s = arcLen[i];
    if (s > bodyLen) break;

    // 宽度：尾部 tailWidth → 颈部 neckWidth 线性收窄
    const t = bodyLen > 0 ? s / bodyLen : 0;
    const w = (tailWidth * (1 - t) + neckWidth * t) / 2;

    // 法线方向
    const normal = smoothNormal(spine, i);

    leftBody.push(offsetPoint(spine[i], normal, w));
    rightBody.push(offsetPoint(spine[i], normal, -w));
  }

  // ---- 5. 找到颈部位置 ----
  let neckIdx = spine.length - 1;
  for (let i = 0; i < spine.length; i++) {
    if (arcLen[i] >= bodyLen) { neckIdx = i; break; }
  }
  const neckPt = spine[neckIdx];
  const neckNormal = smoothNormal(spine, neckIdx);

  const neckL = offsetPoint(neckPt, neckNormal, neckWidth / 2);
  const neckR = offsetPoint(neckPt, neckNormal, -neckWidth / 2);
  const headL = offsetPoint(neckPt, neckNormal, headWidth / 2);
  const headR = offsetPoint(neckPt, neckNormal, -headWidth / 2);

  // ---- 6. 组装闭合多边形 ----
  // 左轮廓 → 左颈 → 左箭头翼 → 箭尖 → 右箭头翼 → 右颈 → 右轮廓反转 → 闭合
  return [
    ...leftBody,
    neckL,
    headL,
    head,
    headR,
    neckR,
    ...rightBody.reverse(),
    leftBody[0], // 闭合
  ];
}

/** 平滑法线：用前后多个点的平均方向避免局部抖动 */
function smoothNormal(spine: Point[], i: number): number {
  const n = spine.length;
  const range = 3;

  let sumSin = 0;
  let sumCos = 0;
  let count = 0;

  for (let j = Math.max(0, i - range); j < Math.min(n - 1, i + range); j++) {
    const a = angle(spine[j], spine[j + 1]);
    sumSin += Math.sin(a);
    sumCos += Math.cos(a);
    count++;
  }

  if (count === 0) {
    return i < n - 1
      ? angle(spine[i], spine[i + 1]) + Math.PI / 2
      : angle(spine[n - 2], spine[n - 1]) + Math.PI / 2;
  }

  return Math.atan2(sumSin / count, sumCos / count) + Math.PI / 2;
}
