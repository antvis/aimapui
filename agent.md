# Agent 标准提交流程（aimapui）

每次对本仓库（`@antv/aimapui`）改动并提交时，遵循以下标准动作。目的是保证提交质量、可复现验证、skill 同步、文档一致。

## 0. 环境约定

- 仓库根：`/Users/lzxue/Documents/antv/aimapui`
- 包结构：`packages/core`（库本体）、`packages/site`（文档/演示站点）、`packages/aimapui-plot`（标绘子包）。
- 提交信息：**Conventional Commits + 中文描述 + scope**，例如：
  ```
  feat(LayerCompare): 新增图层对比组件，支持双屏/卷帘对比
  fix(site): 修复首页移动端预览布局
  fix(ChinaDistrict+SchemaLayer): 修复 showTooltip 不生效
  ```

## 1. 改动后验证（必做）

按依赖顺序执行；任一步新增与本次改动相关的错误即视为未通过。

```bash
cd packages/core && npx tsc --noEmit        # ① 核心包类型检查，必须 0 error
cd packages/core && npm run build           # ② 重建 dist（site 经 dist 符号链接解析类型）
cd packages/site && npx tsc --noEmit        # ③ 站点类型检查（见基线说明）
```

**site tsc 基线说明：** `packages/site` 存在 **已知的 28 个历史错误**（与本组件无关，集中在 `main.tsx`/`home/*` 的 `design`/`onNavigateDesign`/`DesignPage`/`mobilePreview` 重构、以及 typhoon `WindFieldLayer` 的空值检查）。只要：

- 错误数 **= 28**，且
- 错误信息 **不包含**本次改动涉及的文件/组件名，

即视为通过，**不要**顺手修这些历史错误（避免无关改动污染提交）。

> 若 core 改动却未重建 `packages/core/dist`，site tsc 会因旧类型报错——务必先 build 再校验 site。

## 2. 新增组件时的标准动作清单

新增一个组件（如 `LayerCompare`）需要 **同步** 改动以下位置：

| # | 位置 | 动作 |
|---|------|------|
| 1 | `packages/core/src/components/<Name>/<Name>.tsx` | 组件本体（`forwardRef` + 暴露 Handle 类型） |
| 2 | `packages/core/src/index.ts` | `export { <Name> } from ...` + `export type { <Name>Props, ... }` |
| 3 | `packages/core/src/styles/tailwind.css` | 追加 `.<prefix>-*` 类名（含 dark 主题） |
| 4 | `packages/site/src/control/<Name>Demo.tsx` | 站点演示页 |
| 5 | `packages/site/src/main.tsx` | import + 菜单项（指定 group 与 icon） |
| 6 | `packages/site/src/docs/docs-nav.ts` | 导航分组注册 |
| 7 | `packages/site/src/docs/DocsPage.tsx` | 路由映射 `'<path>': 'control/<Name>Demo'` |
| 8 | `packages/site/src/docs/content/controls/<name>.md` | 用户文档（Props 表 + 示例） |
| 9 | `skills/aimapui/references/controls/<name>.md` | skill 参考文档（精炼版） |
| 10 | `skills/aimapui/SKILL.md` | Architecture 列表 + Reference Docs 表 + 必要时 Special Controls 子节 |

> 修复既有组件 bug 时，通常只需改 #1，并酌情更新 #8/#9 的注意事项。

## 3. Skill 同步规则

- `skills/aimapui/SKILL.md` 的 frontmatter `version` **等于 core 包版本**，未发版时 **不要** 改动。
- 新增组件 → 必须新增对应 `references/**.md`，并在 `SKILL.md` 的 **Reference Docs 表** 与 **Architecture** 列表登记。
- 参考文档从组件源码与站点文档取准确信息（Props/Handle/同步机制等），不要照抄可能过时的描述。
- **不要** 修改仓库外的 `~/.agents/.skill-lock.json`。

## 4. 提交动作

```bash
git add -A
git status --short                 # 复核改动范围，确认无意外文件
git commit -m "<type>(<scope>): <中文描述>"
git log --oneline -3               # 确认提交已记录
```

- 单次提交可覆盖代码 + 文档 + skill；大改动可拆为 `feat(...)` 与 `docs(skill): ...` 两次，但 **同一次改动不要拆成过多碎提交**。
- 提交后若需要推送：`git push`（默认分支 `main`）。

## 5. 不要做的事

- ❌ 未经 `tsc` + `build` 验证就提交。
- ❌ 顺带修复无关的 28 个 site 历史错误（除非该次任务明确要求）。
- ❌ 随意 bump `packages/core/package.json` 版本号（仅在正式发版时由发布流程处理）。
- ❌ 改动 `~/.agents/.skill-lock.json` 或仓库外文件。
- ❌ 绕过 aimapui 封装直接 `new` L7 图层类（详见 skill 的 Common Mistakes）。

## 6. 快速校验脚本

```bash
cd /Users/lzxue/Documents/antv/aimapui && \
( cd packages/core && npx tsc --noEmit && npm run build >/dev/null && echo "core OK" ) && \
( cd packages/site && npx tsc --noEmit 2>&1 | grep -c "error TS" | xargs -I{} echo "site errors: {}" )
```

期望输出 `core OK` 且 `site errors: 28`（或与上次基线持平且不含本次组件）。
