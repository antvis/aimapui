import React, { useState, useCallback, useMemo } from 'react';
import { AiMap } from '@antv/aimapui';
import { Marker } from '@antv/aimapui';

/* ================================================================
   兴趣地图 — 谷子店/潮玩店探店地图主页
   ================================================================ */

/** 资讯类型 */
type NewsType = '新谷' | '活动' | '限定' | '联名';

/** 资讯类型分类 */
type NewsCategory = '新店开业' | '漫展' | '主题活动' | '周边上新' | '优惠活动';
type NewsSubCategory = '快闪店开业' | '新店开业' | '商圈开业';

/** IP 品牌 */
type IPBrand = '三丽鸥' | 'BJD' | '变形金刚' | '奥特曼' | '宝可梦' | '初音未来';

/** IP 分类 Tab */
type IPCategory = '全部' | '动漫' | '漫画' | '小说' | '游戏' | '潮玩';

/** IP 项 */
interface IPItem {
  name: string;
  avatar: string;
  hot?: boolean;
  category: IPCategory;
}

/** 店铺数据 */
interface Shop {
  id: string;
  name: string;
  branch: string;
  lng: number;
  lat: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error';
  hours: string;
  address: string;
  distance: string;
  items: ShopItem[];
}

/** 商品条目 */
interface ShopItem {
  id: string;
  title: string;
  coverUrl: string;
  timeAgo: string;
  type: NewsType;
  tag?: string;
}

/** 模拟店铺数据 — 北京嘻番里商圈 */
const SHOPS: Shop[] = [
  {
    id: 's1',
    name: '三万院长',
    branch: 'SWDOLL(BOM嘻番里店)',
    lng: 116.337,
    lat: 39.985,
    icon: 'storefront',
    color: 'primary',
    hours: '周一至周日 10:00-22:00',
    address: '海淀区学清路38-4号BOM嘻番里二...',
    distance: '距你<200m',
    items: [
      {
        id: 'i1-1',
        title: 'SWDOLL春日限定BJD娃娃-花间梦系列',
        coverUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop',
        timeAgo: '1 个月前',
        type: '活动',
        tag: '限定发售',
      },
      {
        id: 'i1-2',
        title: 'BJD配件-春日和风浴衣套装',
        coverUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200&fit=crop',
        timeAgo: '2 个月前',
        type: '新谷',
        tag: '新谷首发',
      },
    ],
  },
  {
    id: 's2',
    name: '卡游',
    branch: '（嘻番里店）',
    lng: 116.339,
    lat: 39.987,
    icon: 'style',
    color: 'success',
    hours: '周一至周日 10:00-22:00',
    address: '海淀区学清路38-4号BOM嘻番里二...',
    distance: '距你<100m',
    items: [
      {
        id: 'i2-1',
        title: '卡游 三丽鸥家族-双面糖果徽章-缤纷茶歇-第1弹 ...',
        coverUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200&fit=crop',
        timeAgo: '3 个月前',
        type: '新谷',
        tag: '新谷首发',
      },
      {
        id: 'i2-2',
        title: '三丽鸥 牌 至臻闪卡收藏册限量版',
        coverUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=200&h=200&fit=crop',
        timeAgo: '3 个月前',
        type: '限定',
      },
    ],
  },
  {
    id: 's3',
    name: '谷池goodspool',
    branch: '北京嘻番里店',
    lng: 116.335,
    lat: 39.983,
    icon: 'shopping_bag',
    color: 'warning',
    hours: '周一至周日 10:30-21:30',
    address: '海淀区学清路38号BOM嘻番里一...',
    distance: '距你<300m',
    items: [
      {
        id: 'i3-1',
        title: '【北京谷店】放学等我 | 予你心跳系列吧唧',
        coverUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=200&h=200&fit=crop',
        timeAgo: '1 天前',
        type: '新谷',
        tag: '新谷首发',
      },
    ],
  },
  {
    id: 's4',
    name: '悠文堂',
    branch: '（嘻番里店）',
    lng: 116.341,
    lat: 39.984,
    icon: 'menu_book',
    color: 'primary',
    hours: '周一至周日 10:00-22:00',
    address: '海淀区学清路38-4号BOM嘻番里...',
    distance: '距你<150m',
    items: [
      {
        id: 'i4-1',
        title: '变形金刚星辰版第七弹盲盒手办',
        coverUrl: 'https://images.unsplash.com/photo-1535581652167-3d6b98c4a576?w=200&h=200&fit=crop',
        timeAgo: '9 天前',
        type: '新谷',
      },
    ],
  },
];

/** 资讯类型颜色 */
const TYPE_COLORS: Record<NewsType, { bg: string; text: string }> = {
  '新谷': { bg: '#dbeafe', text: '#2563eb' },
  '活动': { bg: '#fce7f3', text: '#ec4899' },
  '限定': { bg: '#fef3c7', text: '#d97706' },
  '联名': { bg: '#e0e7ff', text: '#6366f1' },
};

/** IP 数据列表 */
const IP_LIST: IPItem[] = [
  { name: '宝可梦', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pokemon', hot: true, category: '动漫' },
  { name: 'chiikawa', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=chiikawa', hot: true, category: '漫画' },
  { name: '鬼灭之刃', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kimetsu', hot: true, category: '动漫' },
  { name: '第五人格', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=identity', hot: true, category: '游戏' },
  { name: '188男团', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=188boy', category: '动漫' },
  { name: '奥特曼', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ultra', category: '动漫' },
  { name: '凹凸世界', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=aotu', category: '动漫' },
  { name: '三丽鸥', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sanrio', category: '潮玩' },
  { name: 'bangdream', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bang', category: '游戏' },
  { name: '暴力熊', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=gloomy', category: '潮玩' },
  { name: '崩坏：星穹铁道', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=starrail', category: '游戏' },
  { name: '变形金刚', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=transformers', category: '潮玩' },
  { name: '布丁狗', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pompom', category: '潮玩' },
  { name: '初音未来', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miku', category: '动漫' },
  { name: 'BJD', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bjd', category: '潮玩' },
];

/** IP 分类 Tabs */
const IP_CATEGORIES: IPCategory[] = ['全部', '动漫', '漫画', '小说', '游戏', '潮玩'];

/** 资讯类型 — 左侧大类 */
const NEWS_CATEGORIES: ('全部' | NewsCategory)[] = ['全部', '新店开业', '漫展', '主题活动', '周边上新', '优惠活动'];

/** 资讯类型 — 右侧子类 */
const NEWS_SUB_MAP: Record<string, string[]> = {
  '全部': ['全部'],
  '新店开业': ['快闪店开业', '新店开业', '商圈开业'],
  '漫展': ['全部'],
  '主题活动': ['全部'],
  '周边上新': ['全部'],
  '优惠活动': ['全部'],
};

/**
 * 兴趣地图主页 Demo
 *
 * - 顶部：返回 + 标题 + 操作按钮
 * - 筛选栏：IP 筛选 + 资讯类型筛选
 * - 地图：店铺标记点（Marker）
 * - 底部：选中店铺的气泡卡片
 * - 右下角：定位 + 菜单浮动按钮
 */
export default function InterestMap() {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [ipFilter, setIpFilter] = useState<string>('全部');
  const [typeFilter, setTypeFilter] = useState<string>('全部');
  const [showIpPanel, setShowIpPanel] = useState(false);
  const [showTypePanel, setShowTypePanel] = useState(false);
  const [ipCategoryTab, setIpCategoryTab] = useState<IPCategory>('全部');
  const [newsCategory, setNewsCategory] = useState<string>('全部');
  const [tempIp, setTempIp] = useState<string>('全部');
  const [tempType, setTempType] = useState<string>('全部');

  /** 筛选后的店铺 */
  const filteredShops = useMemo(() => {
    return SHOPS.filter((shop) => {
      if (ipFilter !== '全部') {
        const hasIP = shop.items.some((item) => item.title.includes(ipFilter));
        if (!hasIP) return false;
      }
      if (typeFilter !== '全部') {
        const hasType = shop.items.some((item) => item.type === typeFilter);
        if (!hasType) return false;
      }
      return true;
    });
  }, [ipFilter, typeFilter]);

  const handleShopClick = useCallback((shop: Shop) => {
    setSelectedShop((prev) => (prev?.id === shop.id ? null : shop));
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedShop(null);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: '#f5f7fa',
      }}
    >
      {/* ========== 顶部导航 + 筛选栏 ========== */}
      <div
        style={{
          flexShrink: 0,
          padding: '8px 12px 10px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* 标题行 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1f2937',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back_ios</span>
            </button>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>兴趣地图</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button style={navIconBtnStyle}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>star</span>
            </button>
            <button style={navIconBtnStyle}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>near_me</span>
            </button>
            <button style={navIconBtnStyle}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>my_location</span>
            </button>
          </div>
        </div>

        {/* 筛选栏 */}
        <div style={{ display: 'flex', gap: 10, padding: '0 4px' }}>
          <button
            onClick={() => { setTempIp(ipFilter); setShowIpPanel(true); setShowTypePanel(false); }}
            style={filterBtnStyle}
          >
            <span>{ipFilter === '全部' ? '筛选IP' : ipFilter}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>keyboard_arrow_down</span>
          </button>
          <button
            onClick={() => { setTempType(typeFilter); setNewsCategory('全部'); setShowTypePanel(true); setShowIpPanel(false); }}
            style={filterBtnStyle}
          >
            <span>{typeFilter === '全部' ? '资讯类型' : typeFilter}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16, transform: showTypePanel ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>keyboard_arrow_down</span>
          </button>
        </div>
      </div>

      {/* ========== IP 选择面板 ========== */}
      {showIpPanel && (
        <IPSelectPanel
          selected={tempIp}
          categoryTab={ipCategoryTab}
          onCategoryChange={setIpCategoryTab}
          onSelect={setTempIp}
          onClose={() => setShowIpPanel(false)}
          onConfirm={() => { setIpFilter(tempIp); setShowIpPanel(false); }}
          onReset={() => { setTempIp('全部'); }}
        />
      )}

      {/* ========== 资讯类型面板 ========== */}
      {showTypePanel && (
        <NewsTypePanel
          selectedCategory={newsCategory}
          selectedSub={tempType}
          onCategoryChange={setNewsCategory}
          onSubChange={setTempType}
          onClose={() => setShowTypePanel(false)}
          onConfirm={() => { setTypeFilter(tempType === '全部' && newsCategory !== '全部' ? newsCategory : tempType); setShowTypePanel(false); }}
          onReset={() => { setNewsCategory('全部'); setTempType('全部'); }}
        />
      )}

      {/* ========== 地图区域 ========== */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <AiMap
          autoFit
          map={{
            basemap: 'gaode',
            center: [116.338, 39.985],
            zoom: 16,
            style: 'light',
          }}
        >

          {/* 店铺标记：图标 + 文字标注 + 气泡信息框 */}
          {filteredShops.map((shop) => (
            <Marker
              key={shop.id}
              longitude={shop.lng}
              latitude={shop.lat}
              anchor="bottom"
              content={
                <ShopMarker
                  shop={shop}
                  isSelected={selectedShop?.id === shop.id}
                  onClick={() => handleShopClick(shop)}
                />
              }
            />
          ))}
        </AiMap>

        {/* ── 右下角浮动按钮组 ── */}
        <div
          style={{
            position: 'absolute',
            bottom: selectedShop ? 220 : 20,
            right: 12,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            transition: 'bottom 0.3s ease',
          }}
        >
          <FloatingButton icon="my_location" onClick={() => {}} />
          <FloatingButton icon="menu" onClick={() => {}} />
        </div>

        {/* ── 底部店铺卡片 ── */}
        {selectedShop && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <ShopCard shop={selectedShop} onClose={handleCloseCard} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   子组件
   ================================================================ */

/** 地图上的店铺 Marker：气泡信息框 + 图标 + 文字标注 */
function ShopMarker({
  shop,
  isSelected,
  onClick,
}: {
  shop: Shop;
  isSelected: boolean;
  onClick: () => void;
}) {
  const firstItem = shop.items[0];
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        filter: isSelected ? 'drop-shadow(0 4px 12px rgba(99,102,241,0.3))' : 'none',
        transition: 'filter 0.2s',
      }}
    >
      {/* 气泡信息框 */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          padding: 8,
          marginBottom: 6,
          width: 140,
          position: 'relative',
        }}
      >
        {/* 封面图 */}
        <div
          style={{
            width: '100%',
            height: 80,
            borderRadius: 8,
            overflow: 'hidden',
            background: '#f3f4f6',
            marginBottom: 6,
          }}
        >
          <img
            src={firstItem.coverUrl}
            alt={firstItem.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        {/* 标题 */}
        <h4
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#1f2937',
            margin: 0,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {firstItem.title}
        </h4>
        {/* 时间 + 类型标签 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>{firstItem.timeAgo}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 4,
              background: TYPE_COLORS[firstItem.type].bg,
              color: TYPE_COLORS[firstItem.type].text,
            }}
          >
            {firstItem.type}
          </span>
        </div>
        {/* 小三角 */}
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #fff',
          }}
        />
      </div>

      {/* 图标圆点 */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: isSelected ? '#6366f1' : '#2dd4bf',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          border: '2px solid #fff',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>
          {shop.icon}
        </span>
      </div>

      {/* 文字标注 */}
      <div
        style={{
          marginTop: 3,
          fontSize: 11,
          fontWeight: 500,
          color: '#374151',
          textAlign: 'center',
          maxWidth: 120,
          lineHeight: 1.3,
          textShadow: '0 0 4px #fff, 0 0 4px #fff',
        }}
      >
        {shop.name}
        <br />
        {shop.branch}
      </div>
    </div>
  );
}

/** IP 选择面板 — 全屏弹窗 */
function IPSelectPanel({
  selected,
  categoryTab,
  onCategoryChange,
  onSelect,
  onClose,
  onConfirm,
  onReset,
}: {
  selected: string;
  categoryTab: IPCategory;
  onCategoryChange: (cat: IPCategory) => void;
  onSelect: (name: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  onReset: () => void;
}) {
  const filteredIPs = categoryTab === '全部' ? IP_LIST : IP_LIST.filter((ip) => ip.category === categoryTab);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      {/* 遮罩 */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />

      {/* 面板 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '75%',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10, padding: 4, borderRadius: '50%', color: '#6b7280' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
        </button>

        {/* 标题 */}
        <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1f2937', margin: 0 }}>选择IP</h3>
        </div>

        {/* 分类 Tab */}
        <div style={{ display: 'flex', gap: 0, padding: '0 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {IP_CATEGORIES.map((cat) => {
            const isActive = cat === categoryTab;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#1f2937' : '#9ca3af',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid #1f2937' : '2px solid transparent',
                  flexShrink: 0,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* IP 网格 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {filteredIPs.map((ip) => {
              const isSelected = ip.name === selected;
              return (
                <div
                  key={ip.name}
                  onClick={() => onSelect(ip.name)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                >
                  {ip.hot && (
                    <span style={{ position: 'absolute', top: -2, right: 4, fontSize: 10, color: '#22d3ee', fontWeight: 600 }}>热门</span>
                  )}
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: isSelected ? '3px solid #6366f1' : '2px solid #f3f4f6',
                      background: '#f9fafb',
                      marginBottom: 6,
                    }}
                  >
                    <img src={ip.avatar} alt={ip.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: 11, color: isSelected ? '#6366f1' : '#374151', fontWeight: isSelected ? 600 : 400, textAlign: 'center', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ip.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部按钮 */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 20px 20px', flexShrink: 0 }}>
          <button onClick={onReset} style={panelResetBtnStyle}>重置</button>
          <button onClick={onConfirm} style={panelConfirmBtnStyle}>确定</button>
        </div>
      </div>
    </div>
  );
}

/** 资讯类型面板 — 双列列表 */
function NewsTypePanel({
  selectedCategory,
  selectedSub,
  onCategoryChange,
  onSubChange,
  onClose,
  onConfirm,
  onReset,
}: {
  selectedCategory: string;
  selectedSub: string;
  onCategoryChange: (cat: string) => void;
  onSubChange: (sub: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  onReset: () => void;
}) {
  const subOptions = NEWS_SUB_MAP[selectedCategory] || ['全部'];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1000 }}>
      {/* 遮罩 */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={onClose} />

      {/* 面板 — 从顶部筛选栏下方展开 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          maxHeight: '55%',
          background: '#fff',
          borderRadius: '0 0 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        {/* 双列内容 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 左列 — 大类 */}
          <div style={{ width: '40%', borderRight: '1px solid #f3f4f6', overflowY: 'auto', padding: '12px 0' }}>
            {NEWS_CATEGORIES.map((cat) => {
              const isActive = cat === selectedCategory;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '14px 20px',
                    border: 'none',
                    background: 'none',
                    fontSize: 15,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#1f2937' : '#6b7280',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 右列 — 子类 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
            {subOptions.map((sub) => {
              const isActive = sub === selectedSub;
              return (
                <button
                  key={sub}
                  onClick={() => onSubChange(sub)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '14px 20px',
                    border: 'none',
                    background: 'none',
                    fontSize: 15,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#1f2937' : '#6b7280',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部按钮 */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 20px 20px', flexShrink: 0, borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onReset} style={panelResetBtnStyle}>重置</button>
          <button onClick={onConfirm} style={panelConfirmBtnStyle}>确定</button>
        </div>
      </div>
    </div>
  );
}

/** DEPRECATED — 下拉菜单（保留但不再使用） */
function DropdownMenu({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        padding: '6px 4px',
        zIndex: 100,
        maxHeight: 240,
        overflowY: 'auto',
      }}
    >
      {options.map((opt) => {
        const isActive = opt === selected;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: 'none',
              borderRadius: 8,
              background: isActive ? '#f0f4ff' : 'transparent',
              color: isActive ? '#4f46e5' : '#374151',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{opt}</span>
            {isActive && (
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#4f46e5' }}>
                check
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** 店铺底部卡片 */
function ShopCard({ shop, onClose }: { shop: Shop; onClose: () => void }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
        padding: '20px 16px 16px',
        position: 'relative',
      }}
    >
      {/* 顶部拖拽指示条 */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 36,
          height: 4,
          borderRadius: 2,
          background: '#e5e7eb',
        }}
      />

      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          borderRadius: 8,
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
      </button>

      {/* 店铺标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#6366f1' }}>location_on</span>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>
          {shop.name} {shop.branch}
        </h3>
      </div>

      {/* 营业时间 */}
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px 28px' }}>
        营业时间: {shop.hours}
      </p>

      {/* 地址 + 导航按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 28, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#6b7280', flex: 1 }}>
          {shop.address} | {shop.distance}
        </span>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid #e5e7eb',
            background: '#fff',
            color: '#374151',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>navigation</span>
          导航
        </button>
      </div>

      {/* 商品横滚列表 */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: 4,
        }}
      >
        {shop.items.map((item) => (
          <div
            key={item.id}
            style={{
              flexShrink: 0,
              width: 260,
              display: 'flex',
              gap: 10,
              padding: 10,
              borderRadius: 12,
              border: '1px solid #f3f4f6',
              background: '#fafafa',
            }}
          >
            {/* 文字信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0,
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {item.title}
              </h4>
              {item.tag && (
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: TYPE_COLORS[item.type].bg,
                    color: TYPE_COLORS[item.type].text,
                    marginTop: 6,
                  }}
                >
                  {item.tag}
                </span>
              )}
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0' }}>{item.timeAgo}</p>
            </div>
            {/* 封面图 */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                background: '#f3f4f6',
              }}
            >
              <img
                src={item.coverUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 浮动按钮 */
function FloatingButton({ icon, onClick }: { icon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: '#fff',
        border: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
    </button>
  );
}

/* ================================================================
   样式常量
   ================================================================ */

const navIconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 6,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#4b5563',
};

const filterBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'rgba(255,255,255,0.9)',
  backdropFilter: 'blur(8px)',
  color: '#374151',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const panelResetBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '14px 0',
  borderRadius: 24,
  border: '2px solid #1f2937',
  background: '#fff',
  color: '#1f2937',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
};

const panelConfirmBtnStyle: React.CSSProperties = {
  flex: 1.5,
  padding: '14px 0',
  borderRadius: 24,
  border: 'none',
  background: '#1f2937',
  color: '#2dd4bf',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
};
