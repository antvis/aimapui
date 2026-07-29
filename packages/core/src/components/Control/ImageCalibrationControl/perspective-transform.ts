/**
 * 透视变换数学模块
 * 计算单应性矩阵(Homography)，支持 CSS matrix3d 转换和 Canvas 图片变换
 */

export type Point2D = [number, number];
export type Matrix3x3 = number[]; // 9 elements, row-major

/**
 * 解 8x8 线性方程组，计算由4对点确定的单应性矩阵
 * src → dst 的变换: dst = H * src (齐次坐标)
 */
export function computeHomography(
  src: [Point2D, Point2D, Point2D, Point2D],
  dst: [Point2D, Point2D, Point2D, Point2D],
): Matrix3x3 {
  // 构建 8x9 矩阵 (每对点贡献2行)
  // 对于每对 (x,y) -> (u,v):
  //   -x, -y, -1,  0,  0,  0, ux, uy, u  = 0
  //    0,  0,  0, -x, -y, -1, vx, vy, v  = 0
  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([-x, -y, -1, 0, 0, 0, u * x, u * y]);
    b.push(-u);
    A.push([0, 0, 0, -x, -y, -1, v * x, v * y]);
    b.push(-v);
  }

  const h = solveLinear8x8(A, b);

  // H = [[h0, h1, h2], [h3, h4, h5], [h6, h7, 1]]
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

/**
 * 将 3x3 单应性矩阵转换为 CSS matrix3d() 字符串
 * CSS matrix3d 是列主序 4x4 矩阵
 */
export function toMatrix3dCSS(H: Matrix3x3): string {
  const [a, b, c, d, e, f, g, h] = H;
  // 将 3x3 → 4x4 (嵌入 z=0 平面)
  // 然后转列主序
  // 4x4 row-major:
  // [a, b, 0, c]
  // [d, e, 0, f]
  // [0, 0, 1, 0]
  // [g, h, 0, 1]
  //
  // CSS matrix3d 是列主序:
  // a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
}

/**
 * 计算从图片矩形到目标四边形的 CSS matrix3d 变换
 * @param width 图片宽度
 * @param height 图片高度
 * @param dstCorners 目标屏幕坐标 [TL, TR, BR, BL]
 */
export function computeImageToQuadCSS(
  width: number,
  height: number,
  dstCorners: [Point2D, Point2D, Point2D, Point2D],
): string {
  const srcCorners: [Point2D, Point2D, Point2D, Point2D] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  const H = computeHomography(srcCorners, dstCorners);
  return toMatrix3dCSS(H);
}

/**
 * 在 Canvas 上对图片执行透视变换
 * 通过逐像素反向映射实现高质量变换
 */
export async function transformImageOnCanvas(
  image: HTMLImageElement | ImageBitmap,
  srcCorners: [Point2D, Point2D, Point2D, Point2D],
  outputWidth: number,
  outputHeight: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d')!;

  // 源图片绘制到临时 canvas 获取像素数据
  const srcCanvas = document.createElement('canvas');
  const imgWidth = 'naturalWidth' in image ? image.naturalWidth : image.width;
  const imgHeight = 'naturalHeight' in image ? image.naturalHeight : image.height;
  srcCanvas.width = imgWidth;
  srcCanvas.height = imgHeight;
  const srcCtx = srcCanvas.getContext('2d')!;
  srcCtx.drawImage(image, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, imgWidth, imgHeight);

  // 计算输出矩形到源四边形的反向映射
  const dstCorners: [Point2D, Point2D, Point2D, Point2D] = [
    [0, 0],
    [outputWidth, 0],
    [outputWidth, outputHeight],
    [0, outputHeight],
  ];
  const H_inv = computeHomography(dstCorners, srcCorners);

  const outData = ctx.createImageData(outputWidth, outputHeight);
  const srcPixels = srcData.data;
  const outPixels = outData.data;

  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      // 反向映射: 输出像素 → 源图片坐标
      const w = H_inv[6] * x + H_inv[7] * y + H_inv[8];
      const sx = (H_inv[0] * x + H_inv[1] * y + H_inv[2]) / w;
      const sy = (H_inv[3] * x + H_inv[4] * y + H_inv[5]) / w;

      // 双线性插值
      if (sx >= 0 && sx < imgWidth - 1 && sy >= 0 && sy < imgHeight - 1) {
        const ix = Math.floor(sx);
        const iy = Math.floor(sy);
        const fx = sx - ix;
        const fy = sy - iy;

        const idx = (iy * imgWidth + ix) * 4;
        const idx_r = idx + 4;
        const idx_b = idx + imgWidth * 4;
        const idx_br = idx_b + 4;

        const outIdx = (y * outputWidth + x) * 4;
        for (let c = 0; c < 4; c++) {
          outPixels[outIdx + c] = Math.round(
            srcPixels[idx + c] * (1 - fx) * (1 - fy) +
            srcPixels[idx_r + c] * fx * (1 - fy) +
            srcPixels[idx_b + c] * (1 - fx) * fy +
            srcPixels[idx_br + c] * fx * fy,
          );
        }
      }
    }
  }

  ctx.putImageData(outData, 0, 0);
  return canvas;
}

/**
 * 生成配准后的完整 canvas
 */
export function renderCalibratedCanvas(
  image: HTMLImageElement | ImageBitmap,
  geoCorners: [Point2D, Point2D, Point2D, Point2D],
  outW: number,
  outH: number,
): HTMLCanvasElement {
  const imgWidth = 'naturalWidth' in image ? image.naturalWidth : image.width;
  const imgHeight = 'naturalHeight' in image ? image.naturalHeight : image.height;

  const lngs = geoCorners.map((c) => c[0]);
  const lats = geoCorners.map((c) => c[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const geoToPixel = (c: Point2D): Point2D => [
    ((c[0] - minLng) / (maxLng - minLng)) * outW,
    ((maxLat - c[1]) / (maxLat - minLat)) * outH,
  ];

  const dstCorners = geoCorners.map(geoToPixel) as [Point2D, Point2D, Point2D, Point2D];

  const srcCorners: [Point2D, Point2D, Point2D, Point2D] = [
    [0, 0],
    [imgWidth, 0],
    [imgWidth, imgHeight],
    [0, imgHeight],
  ];

  const H_inv = computeHomography(dstCorners, srcCorners);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = imgWidth;
  srcCanvas.height = imgHeight;
  const srcCtx = srcCanvas.getContext('2d')!;
  srcCtx.drawImage(image, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, imgWidth, imgHeight);
  const outData = ctx.createImageData(outW, outH);
  const srcPixels = srcData.data;
  const outPixels = outData.data;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const w = H_inv[6] * x + H_inv[7] * y + H_inv[8];
      if (Math.abs(w) < 1e-10) continue;
      const sx = (H_inv[0] * x + H_inv[1] * y + H_inv[2]) / w;
      const sy = (H_inv[3] * x + H_inv[4] * y + H_inv[5]) / w;

      if (sx >= 0 && sx < imgWidth - 1 && sy >= 0 && sy < imgHeight - 1) {
        const ix = Math.floor(sx);
        const iy = Math.floor(sy);
        const fx = sx - ix;
        const fy = sy - iy;

        const idx = (iy * imgWidth + ix) * 4;
        const outIdx = (y * outW + x) * 4;
        for (let c = 0; c < 4; c++) {
          outPixels[outIdx + c] = Math.round(
            srcPixels[idx + c] * (1 - fx) * (1 - fy) +
            srcPixels[idx + 4 + c] * fx * (1 - fy) +
            srcPixels[idx + imgWidth * 4 + c] * (1 - fx) * fy +
            srcPixels[idx + imgWidth * 4 + 4 + c] * fx * fy,
          );
        }
      }
    }
  }

  ctx.putImageData(outData, 0, 0);
  return canvas;
}

/**
 * 导出配准后的图片（单张完整）
 */
export async function exportCalibratedImage(
  image: HTMLImageElement | ImageBitmap,
  geoCorners: [Point2D, Point2D, Point2D, Point2D],
  options?: { maxWidth?: number; format?: string; quality?: number },
): Promise<Blob> {
  const { maxWidth = 4096, format = 'image/png', quality = 0.92 } = options ?? {};

  const imgWidth = 'naturalWidth' in image ? image.naturalWidth : image.width;
  const imgHeight = 'naturalHeight' in image ? image.naturalHeight : image.height;

  let outW = imgWidth;
  let outH = imgHeight;
  if (outW > maxWidth || outH > maxWidth) {
    const scale = maxWidth / Math.max(outW, outH);
    outW = Math.round(outW * scale);
    outH = Math.round(outH * scale);
  }

  const canvas = renderCalibratedCanvas(image, geoCorners, outW, outH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export image'));
      },
      format,
      quality,
    );
  });
}

/** 将 canvas 区域裁切为 Blob */
function canvasRegionToBlob(
  srcCanvas: HTMLCanvasElement,
  x: number, y: number, w: number, h: number,
  format: string, quality: number,
): Promise<Blob> {
  const tile = document.createElement('canvas');
  tile.width = w;
  tile.height = h;
  const ctx = tile.getContext('2d')!;
  ctx.drawImage(srcCanvas, x, y, w, h, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    tile.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('tile export failed'))),
      format,
      quality,
    );
  });
}

export interface TileExportResult {
  blob: Blob;
  row: number;
  col: number;
  extent: [number, number, number, number];
  corners: [Point2D, Point2D, Point2D, Point2D];
  width: number;
  height: number;
}

/**
 * 导出配准后的图片并切分为瓦片
 */
export async function exportCalibratedTiles(
  image: HTMLImageElement | ImageBitmap,
  geoCorners: [Point2D, Point2D, Point2D, Point2D],
  config: { outputWidth: number; outputHeight: number; cols: number; rows: number; format?: string; quality?: number },
): Promise<{ canvas: HTMLCanvasElement; fullBlob: Blob; tiles: TileExportResult[]; extent: [number, number, number, number] }> {
  if (!config) throw new Error('exportCalibratedTiles: config is required');
  const { outputWidth, outputHeight, cols, rows, format = 'image/png', quality = 0.92 } = config;

  const canvas = renderCalibratedCanvas(image, geoCorners, outputWidth, outputHeight);

  // 完整 extent
  const lngs = geoCorners.map((c) => c[0]);
  const lats = geoCorners.map((c) => c[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const extent: [number, number, number, number] = [minLng, minLat, maxLng, maxLat];

  const fullBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('export failed'))),
      format,
      quality,
    );
  });

  // 切片
  const tileW = Math.floor(outputWidth / cols);
  const tileH = Math.floor(outputHeight / rows);
  const lngStep = (maxLng - minLng) / cols;
  const latStep = (maxLat - minLat) / rows;

  const tiles: TileExportResult[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * tileW;
      const py = r * tileH;
      const w = c === cols - 1 ? outputWidth - px : tileW;
      const h = r === rows - 1 ? outputHeight - py : tileH;

      const tileMinLng = minLng + c * lngStep;
      const tileMaxLng = c === cols - 1 ? maxLng : tileMinLng + lngStep;
      const tileMaxLat = maxLat - r * latStep;
      const tileMinLat = r === rows - 1 ? minLat : tileMaxLat - latStep;

      const tileExtent: [number, number, number, number] = [tileMinLng, tileMinLat, tileMaxLng, tileMaxLat];
      const tileCorners: [Point2D, Point2D, Point2D, Point2D] = [
        [tileMinLng, tileMaxLat],
        [tileMaxLng, tileMaxLat],
        [tileMaxLng, tileMinLat],
        [tileMinLng, tileMinLat],
      ];

      const blob = await canvasRegionToBlob(canvas, px, py, w, h, format, quality);
      tiles.push({ blob, row: r, col: c, extent: tileExtent, corners: tileCorners, width: w, height: h });
    }
  }

  return { canvas, fullBlob, tiles, extent };
}

// ============================================================
// 内部工具函数
// ============================================================

function solveLinear8x8(A: number[][], b: number[]): number[] {
  const n = 8;
  // 增广矩阵
  const M: number[][] = [];
  for (let i = 0; i < n; i++) {
    M.push([...A[i], b[i]]);
  }

  // 高斯消元 + 部分主元选取
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > maxVal) {
        maxVal = Math.abs(M[row][col]);
        maxRow = row;
      }
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];

    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-12) {
      throw new Error('Singular matrix in homography computation');
    }

    for (let j = col; j <= n; j++) {
      M[col][j] /= pivot;
    }

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      for (let j = col; j <= n; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }

  return M.map((row) => row[n]);
}
