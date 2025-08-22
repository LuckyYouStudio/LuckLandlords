# 斗地主游戏使用指南

## 游戏介绍
这是一个使用 Cocos Creator 开发的三人斗地主游戏，支持玩家与AI对战。

## 如何使用

### 1. 在 Cocos Creator 中打开项目
1. 打开 Cocos Creator 编辑器
2. 选择 "打开项目" 
3. 找到项目文件夹并打开

### 2. 配置游戏场景
1. 在项目面板中找到 `assets/scenes/Game.scene`
2. 双击打开场景
3. 在层级管理器中找到 `GameRoot` 节点
4. 选择 `GameRoot` 节点，在属性检查器中添加 `GameManager` 组件

### 3. 设置GameManager组件
在 GameManager 组件中配置以下节点引用：

- **Card Prefab**: 拖入 `assets/prefabs/Card.prefab`
- **Player Hand Node**: 拖入场景中的 `PlayerHand` 节点
- **Left Player Node**: 拖入场景中的 `LeftPlayer` 节点  
- **Right Player Node**: 拖入场景中的 `RightPlayer` 节点
- **Landlord Cards Node**: 拖入场景中的 `LandlordCards` 节点
- **Play Area Node**: 拖入场景中的 `PlayArea` 节点
- **Game State Label**: 拖入场景中的 `GameStateLabel` 节点
- **Turn Label**: 拖入场景中的 `TurnLabel` 节点
- **Start Button**: 拖入场景中的 `StartButton` 节点
- **Pass Button**: 拖入场景中的 `PassButton` 节点
- **Play Button**: 拖入场景中的 `PlayButton` 节点
- **Bid Buttons**: 拖入场景中的叫地主按钮节点数组

### 4. 运行游戏
1. 点击编辑器顶部的 "预览" 按钮
2. 游戏将在浏览器中启动

## 游戏玩法

### 开始游戏
1. 点击 "开始游戏" 按钮
2. 系统自动发牌，每人17张牌，剩余3张为地主牌

### 叫地主阶段
1. 从随机玩家开始叫地主
2. 可以选择叫1分、2分、3分或不叫
3. 最高分者成为地主，获得3张地主牌

### 出牌阶段
1. 地主先出牌
2. 其他玩家必须出比上家更大的牌，或选择过牌
3. 支持的牌型：
   - 单张
   - 对子
   - 三张
   - 三带一
   - 三带二
   - 顺子（5张以上连续单牌）
   - 连对（3对以上连续对子）
   - 飞机（连续三张）
   - 四带二
   - 炸弹（四张相同）
   - 王炸（双王）

### 胜利条件
- 地主先出完牌：地主获胜
- 农民先出完牌：农民获胜

## 技术特性

### 已实现功能
- ✅ 完整的斗地主规则
- ✅ 牌型识别和比较
- ✅ AI自动出牌
- ✅ 叫地主流程
- ✅ 游戏UI界面
- ✅ 点击选牌交互

### 文件结构
```
assets/
├── scripts/          # 游戏脚本
│   ├── Card.ts          # 牌类
│   ├── CardType.ts      # 牌型判断
│   ├── GameManager.ts   # 游戏管理器
│   └── Player.ts        # 玩家类
├── prefabs/          # 预制体
│   ├── Card.prefab      # 牌预制体
│   ├── StartButton.prefab  # 开始按钮
│   ├── PlayButton.prefab   # 出牌按钮
│   ├── PassButton.prefab   # 过牌按钮
│   └── BidButton.prefab    # 叫地主按钮
├── scenes/           # 场景
│   └── Game.scene       # 游戏主场景
├── textures/         # 纹理资源
└── sounds/           # 音效资源
```

## 扩展功能建议

### 可添加的功能
- 🔮 更智能的AI算法
- 🎵 背景音乐和音效
- 🎨 更精美的牌面纹理
- 📊 游戏统计和排行榜
- 🌐 网络多人对战
- 💎 动画效果和特效
- ⚙️ 游戏设置选项

### 自定义开发
如需自定义功能，可以修改以下文件：
- `GameManager.ts`: 游戏主逻辑
- `CardType.ts`: 牌型规则
- `Card.ts`: 牌的显示和交互
- `Player.ts`: 玩家行为

## 故障排除

### 常见问题
1. **游戏无法启动**: 检查场景中是否正确配置了GameManager组件
2. **按钮无响应**: 确认按钮预制体已正确设置Button组件
3. **牌显示异常**: 检查Card预制体的UITransform组件设置
4. **AI不出牌**: 检查控制台是否有脚本错误

### 开发模式
在开发模式下，可以在浏览器控制台查看详细的调试信息。

---

欢迎体验这个斗地主游戏！如有问题或建议，请查看项目的GitHub仓库。