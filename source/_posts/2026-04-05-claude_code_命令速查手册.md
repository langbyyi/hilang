---
title: "Claude_Code_命令速查手册"
date: "2026-04-05 22:47:27"
updated: "2026-05-30 19:23:57"
categories: ["文章", "工具资源"]
tags: ["claude"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "1017"
---
<h2 class="md-end-block md-heading md-focus"><span class="md-plain md-expand">一、每天都要用</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">启动 & 退出</span></h3>


```
claude                                      # 启动交互会话
claude "帮我看下这个报错"                      # 带问题启动
claude -c                                   # 恢复上次对话
claude -r "会话名"                           # 恢复指定会话
claude --dangerously-skip-permissions       # 跳过所有权限
Ctrl+D  或  /exit                           # 退出
```


<h3 class="md-end-block md-heading"><span class="md-plain">输入前缀（最实用）</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">前缀</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
<th><span class="td-span"><span class="md-plain">示例</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>!</code></span></span></td>
<td><span class="td-span"><span class="md-plain">直接跑 Bash</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>!git status</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>@</code></span></span></td>
<td><span class="td-span"><span class="md-plain">引用文件</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>@src/main.ts 帮我看看这个文件</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/</code></span></span></td>
<td><span class="td-span"><span class="md-plain">斜杠命令</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/compact</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">最常用斜杠命令（Top 12）</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">命令</span></span></th>
<th><span class="td-span"><span class="md-plain">干什么</span></span></th>
<th><span class="td-span"><span class="md-plain">什么时候用</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/compact [指令]</code></span></span></td>
<td><span class="td-span"><span class="md-plain">压缩上下文</span></span></td>
<td><span class="td-span"><span class="md-plain">对话太长、变卡时</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/clear</code></span></span></td>
<td><span class="td-span"><span class="md-plain">清空对话</span></span></td>
<td><span class="td-span"><span class="md-plain">换话题时（别名 </span><span class="md-pair-s" spellcheck="false"><code>/reset</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>/new</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/model</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换模型</span></span></td>
<td><span class="td-span"><span class="md-plain">需要更强/更快模型时</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/plan [描述]</code></span></span></td>
<td><span class="td-span"><span class="md-plain">只读分析模式</span></span></td>
<td><span class="td-span"><span class="md-plain">不想让它改代码，只想分析</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/init</code></span></span></td>
<td><span class="td-span"><span class="md-plain">生成 CLAUDE.md</span></span></td>
<td><span class="td-span"><span class="md-plain">新项目第一次使用</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/memory</code></span></span></td>
<td><span class="td-span"><span class="md-plain">编辑记忆指令</span></span></td>
<td><span class="td-span"><span class="md-plain">调整项目规则</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/cost</code></span></span></td>
<td><span class="td-span"><span class="md-plain">看 Token 消耗</span></span></td>
<td><span class="td-span"><span class="md-plain">关心花费时</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/resume</code></span></span></td>
<td><span class="td-span"><span class="md-plain">恢复历史会话</span></span></td>
<td><span class="td-span"><span class="md-plain">找回之前的工作（别名 </span><span class="md-pair-s" spellcheck="false"><code>/continue</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/diff</code></span></span></td>
<td><span class="td-span"><span class="md-plain">交互式 diff 查看器</span></span></td>
<td><span class="td-span"><span class="md-plain">检查 Claude 改了什么</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/rewind</code></span></span></td>
<td><span class="td-span"><span class="md-plain">回退检查点</span></span></td>
<td><span class="td-span"><span class="md-plain">改坏了要撤回（别名 </span><span class="md-pair-s" spellcheck="false"><code>/checkpoint</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/branch</code></span></span></td>
<td><span class="td-span"><span class="md-plain">分叉当前对话</span></span></td>
<td><span class="td-span"><span class="md-plain">想从某个点重新开始（别名 </span><span class="md-pair-s" spellcheck="false"><code>/fork</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/help</code></span></span></td>
<td><span class="td-span"><span class="md-plain">帮助菜单</span></span></td>
<td><span class="td-span"><span class="md-plain">忘了命令时</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">键盘快捷键（核心）</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">快捷键</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+C</code></span></span></td>
<td><span class="td-span"><span class="md-plain">中断生成（硬编码，不可重绑定）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Esc Esc</code></span></span></td>
<td><span class="td-span"><span class="md-plain">回退（Rewind）/ 汇总</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+D</code></span></span></td>
<td><span class="td-span"><span class="md-plain">退出 Claude Code（硬编码）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+L</code></span></span></td>
<td><span class="td-span"><span class="md-plain">清屏（保留对话历史）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+R</code></span></span></td>
<td><span class="td-span"><span class="md-plain">反向搜索命令历史</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+O</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换详细输出（看工具调用细节）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+B</code></span></span></td>
<td><span class="td-span"><span class="md-plain">任务放后台（tmux 用户按两次）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+T</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换任务列表</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+G</code></span></span></td>
<td><span class="td-span"><span class="md-plain">在外部编辑器中打开当前输入</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Shift+Tab</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>Alt+M</code></span></span></td>
<td><span class="td-span"><span class="md-plain">循环切换权限模式（Windows 推荐用 </span><span class="md-pair-s" spellcheck="false"><code>Alt+M</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Alt+P</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换模型</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Alt+T</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>Meta+T</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换扩展思考（Thinking）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Alt+O</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换快速模式</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+X Ctrl+K</code></span></span></td>
<td><span class="td-span"><span class="md-plain">杀死所有后台 Agent（3秒内按两次确认）</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">多行输入</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">方式</span></span></th>
<th><span class="td-span"><span class="md-plain">说明</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>\</code></span><span class="md-plain"> + Enter</span></span></td>
<td><span class="td-span"><span class="md-plain">反斜杠续行（所有终端通用）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Option+Enter (Mac)</span></span></td>
<td><span class="td-span"><span class="md-plain">换行继续输入</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Shift+Enter</span></span></td>
<td><span class="td-span"><span class="md-plain">换行（iTerm2/WezTerm/Ghostty/Kitty 原生支持）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Ctrl+J</span></span></td>
<td><span class="td-span"><span class="md-plain">换行符</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Ctrl+V / Cmd+V</span></span></td>
<td><span class="td-span"><span class="md-plain">粘贴多行自动识别</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">直接粘贴</span></span></td>
<td><span class="td-span"><span class="md-plain">代码块/日志自动进入多行模式</span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">二、经常用</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">权限模式</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">模式</span></span></th>
<th><span class="td-span"><span class="md-plain">说明</span></span></th>
<th><span class="td-span"><span class="md-plain">适用场景</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>default</code></span></span></td>
<td><span class="td-span"><span class="md-plain">新工具需确认</span></span></td>
<td><span class="td-span"><span class="md-plain">日常开发</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>acceptEdits</code></span></span></td>
<td><span class="td-span"><span class="md-plain">自动接受文件编辑</span></span></td>
<td><span class="td-span"><span class="md-plain">大量重构</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>plan</code></span></span></td>
<td><span class="td-span"><span class="md-plain">只读，不可修改</span></span></td>
<td><span class="td-span"><span class="md-plain">代码审查</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>auto</code></span></span></td>
<td><span class="td-span"><span class="md-plain">后台自动审批</span></span></td>
<td><span class="td-span"><span class="md-plain">信任环境</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>dontAsk</code></span></span></td>
<td><span class="td-span"><span class="md-plain">自动拒绝未预批工具</span></span></td>
<td><span class="td-span"><span class="md-plain">限制行为</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>bypassPermissions</code></span></span></td>
<td><span class="td-span"><span class="md-plain">跳过所有提示</span></span></td>
<td><span class="td-span"><span class="md-plain">隔离/CI 环境</span></span></td>
</tr>
</tbody>
</table>
</figure>
<blockquote>
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>Shift+Tab</code></span><span class="md-plain"> 或 </span><span class="md-pair-s" spellcheck="false"><code>Alt+M</code></span><span class="md-plain"> 可在会话中实时切换</span></p>
</blockquote>
<h3 class="md-end-block md-heading"><span class="md-plain">模型 & 推理</span></h3>


```
/model                      # 交互式切换模型
/effort high                # 深度推理 (low/medium/high/max/auto)
/fast                       # 快速模式（同模型，更快输出）
/vim                        # Vim 编辑模式
​
# CLI 标志方式
claude --model claude-sonnet-4-6
claude --effort high
```


<h3 class="md-end-block md-heading"><span class="md-plain">会话管理</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">命令/快捷键</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/resume</code></span></span></td>
<td><span class="td-span"><span class="md-plain">恢复历史会话（交互选择，别名 </span><span class="md-pair-s" spellcheck="false"><code>/continue</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>claude -c</code></span></span></td>
<td><span class="td-span"><span class="md-plain">快速恢复最近对话</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>claude -r &quot;名称&quot;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">恢复指定会话</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/rewind</code></span></span></td>
<td><span class="td-span"><span class="md-plain">回退到之前的检查点（别名 </span><span class="md-pair-s" spellcheck="false"><code>/checkpoint</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/branch</code></span></span></td>
<td><span class="td-span"><span class="md-plain">分叉当前对话（别名 </span><span class="md-pair-s" spellcheck="false"><code>/fork</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/rename</code></span></span></td>
<td><span class="td-span"><span class="md-plain">重命名当前会话</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/export</code></span></span></td>
<td><span class="td-span"><span class="md-plain">导出为纯文本</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/copy [N]</code></span></span></td>
<td><span class="td-span"><span class="md-plain">复制最后回复到剪贴板</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Ctrl+R</code></span></span></td>
<td><span class="td-span"><span class="md-plain">反向搜索历史命令</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">项目配置（CLAUDE.md）</span></h3>


```bash
/init        # 在项目根目录生成 CLAUDE.md（最重要的一步）
/memory      # 编辑 CLAUDE.md 内容
```


<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">CLAUDE.md 层级（优先级从高到低）</span></strong></span><span class="md-plain">：</span></p>



```
~/.claude/CLAUDE.md              # 你的全局偏好（所有项目生效）
项目根/CLAUDE.md                 # 项目共享规则（提交到 Git）
.claude/CLAUDE.md               # 同上（替代位置）
项目根/CLAUDE.local.md          # 项目个人规则（不提交）
```


<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">示例 CLAUDE.md</span></strong></span><span class="md-plain">：</span></p>



```markdown
# 项目规则
- 使用 TypeScript strict 模式
- 测试框架用 vitest
- 提交信息用中文
- 禁止修改 .env 文件
```


<h3 class="md-end-block md-heading"><span class="md-plain">其他常用斜杠命令</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">命令</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/add-dir &lt;路径&gt;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">添加工作目录</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/config</code></span></span></td>
<td><span class="td-span"><span class="md-plain">打开设置（别名 </span><span class="md-pair-s" spellcheck="false"><code>/settings</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/permissions</code></span></span></td>
<td><span class="td-span"><span class="md-plain">管理权限规则（别名 </span><span class="md-pair-s" spellcheck="false"><code>/allowed-tools</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/context</code></span></span></td>
<td><span class="td-span"><span class="md-plain">可视化上下文使用情况</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/status</code></span></span></td>
<td><span class="td-span"><span class="md-plain">查看版本/模型/账户等</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/stats</code></span></span></td>
<td><span class="td-span"><span class="md-plain">可视化每日使用量</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/usage</code></span></span></td>
<td><span class="td-span"><span class="md-plain">查看用量限制和速率限制</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/doctor</code></span></span></td>
<td><span class="td-span"><span class="md-plain">检查安装健康状态</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/btw &lt;问题&gt;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">快速附带问题，不影响主对话</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/pr-comments</code></span></span></td>
<td><span class="td-span"><span class="md-plain">获取 GitHub PR 评论</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/security-review</code></span></span></td>
<td><span class="td-span"><span class="md-plain">安全审查待提交变更</span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">三、开发中常用</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">Git 集成</span></h3>


```bash
# 自然语言操作
"帮我把这些改动提交，信息写 feat: 添加用户登录"
"创建一个 PR 到 main 分支"
"看下最近的 git log"
​
# 斜杠命令
/diff                # 交互式 diff 查看器
/pr-comments         # 获取 GitHub PR 评论
/security-review     # 安全审查
​
# Worktree 隔离开发
claude -w feature-auth          # 在隔离 worktree 中工作
claude -w feature-auth --tmux   # 用 tmux 窗口
​
# PR 关联
claude --from-pr 123            # 从 PR 恢复会话
​
# 恢复时创建分叉
claude --resume "会话名" --fork-session
```


<h3 class="md-end-block md-heading"><span class="md-plain">添加额外目录</span></h3>


```bash
# CLI 方式
claude --add-dir ../lib ../shared
​
# 会话内
/add-dir ../shared-lib
​
# 配置文件（settings.json）
"additionalDirectories": ["../shared-lib"]
```


<h3 class="md-end-block md-heading"><span class="md-plain">其余斜杠命令一览</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">命令</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/agents</code></span></span></td>
<td><span class="td-span"><span class="md-plain">管理子代理</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/chrome</code></span></span></td>
<td><span class="td-span"><span class="md-plain">Chrome 浏览器集成</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/color [颜色]</code></span></span></td>
<td><span class="td-span"><span class="md-plain">设置提示栏颜色</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/desktop</code></span></span></td>
<td><span class="td-span"><span class="md-plain">在桌面应用中继续（别名 </span><span class="md-pair-s" spellcheck="false"><code>/app</code></span><span class="md-plain">，仅 macOS/Windows）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/feedback</code></span></span></td>
<td><span class="td-span"><span class="md-plain">提交反馈（别名 </span><span class="md-pair-s" spellcheck="false"><code>/bug</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/hooks</code></span></span></td>
<td><span class="td-span"><span class="md-plain">查看 hook 配置</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/ide</code></span></span></td>
<td><span class="td-span"><span class="md-plain">管理 IDE 集成</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/insights</code></span></span></td>
<td><span class="td-span"><span class="md-plain">使用分析报告</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/install-github-app</code></span></span></td>
<td><span class="td-span"><span class="md-plain">安装 GitHub Actions 应用</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/install-slack-app</code></span></span></td>
<td><span class="td-span"><span class="md-plain">安装 Slack 应用</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/keybindings</code></span></span></td>
<td><span class="td-span"><span class="md-plain">打开快捷键配置</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/login</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>/logout</code></span></span></td>
<td><span class="td-span"><span class="md-plain">登录/登出</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/mcp</code></span></span></td>
<td><span class="td-span"><span class="md-plain">管理 MCP 服务器</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/mobile</code></span></span></td>
<td><span class="td-span"><span class="md-plain">下载移动应用（别名 </span><span class="md-pair-s" spellcheck="false"><code>/ios</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>/android</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/passes</code></span></span></td>
<td><span class="td-span"><span class="md-plain">分享免费使用权</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/plugin</code></span></span></td>
<td><span class="td-span"><span class="md-plain">管理插件</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/privacy-settings</code></span></span></td>
<td><span class="td-span"><span class="md-plain">隐私设置（仅 Pro/Max）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/rc</code></span></span></td>
<td><span class="td-span"><span class="md-plain">远程控制（别名 </span><span class="md-pair-s" spellcheck="false"><code>/remote-control</code></span><span class="md-plain">）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/release-notes</code></span></span></td>
<td><span class="td-span"><span class="md-plain">查看更新日志</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/reload-plugins</code></span></span></td>
<td><span class="td-span"><span class="md-plain">重新加载插件</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/remote-env</code></span></span></td>
<td><span class="td-span"><span class="md-plain">配置远程环境</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/sandbox</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换沙箱模式</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/schedule</code></span></span></td>
<td><span class="td-span"><span class="md-plain">定时任务</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/skills</code></span></span></td>
<td><span class="td-span"><span class="md-plain">列出可用技能</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/stickers</code></span></span></td>
<td><span class="td-span"><span class="md-plain">订购贴纸</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/tasks</code></span></span></td>
<td><span class="td-span"><span class="md-plain">后台任务</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/extra-usage</code></span></span></td>
<td><span class="td-span"><span class="md-plain">配置额外用量（达速率限制时继续）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/terminal-setup</code></span></span></td>
<td><span class="td-span"><span class="md-plain">终端快捷键配置</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/theme</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换主题</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/upgrade</code></span></span></td>
<td><span class="td-span"><span class="md-plain">升级（仅 Pro/Max）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/voice</code></span></span></td>
<td><span class="td-span"><span class="md-plain">语音输入</span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">四、配置与定制</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">settings.json 位置</span></h3>


```
优先级：高 → 低
​
┌─────────────────────────────────────────────┐
│  CLI 参数 — 临时覆盖                         │
│  .claude/settings.local.json — 本地个人      │
│  .claude/settings.json — 项目共享            │
│  ~/.claude/settings.json — 用户全局          │
└─────────────────────────────────────────────┘
```


<h3 class="md-end-block md-heading"><span class="md-plain">核心配置模板</span></h3>


```json
{
  "model": "claude-sonnet-4-6",
  "alwaysThinkingEnabled": true,
  "permissions": {
    "defaultMode": "auto",
    "allow": ["Bash(npm run *)"],
    "deny": ["Bash(git push *)"]
  },
  "env": {
    "ANTHROPIC_BASE_URL": "..."
  },
  "hooks": {},
  "sandbox": {},
  "enabledPlugins": {},
  "additionalDirectories": ["../shared-lib"]
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">权限规则语法</span></h3>


```
Bash(npm run build)           # 精确匹配
Bash(npm run *)               # 通配符
Bash(*)                       # 等同于 Bash
Read(./.env)                  # 特定文件
Edit(/src/**/*.ts)            # 路径模式
WebFetch(domain:example.com)  # 特定域名
mcp__server__tool             # MCP 工具
Agent(Explore)                # 子代理
```


<blockquote>
<p class="md-end-block md-p"><span class="md-plain">优先级: </span><span class="md-pair-s "><strong><span class="md-plain">deny > ask > allow</span></strong></span></p>
</blockquote>
<h3 class="md-end-block md-heading"><span class="md-plain">路径规则文件</span></h3>
<p class="md-end-block md-p"><span class="md-plain">在 </span><span class="md-pair-s" spellcheck="false"><code>.claude/rules/</code></span><span class="md-plain"> 下创建文件，用 YAML frontmatter 匹配路径：</span></p>



```yaml
---
description: TypeScript 严格规则
globs: ["**/*.ts", "**/*.tsx"]
---

- 必须使用严格模式
- 禁止 any 类型
```


<h3 class="md-end-block md-heading"><span class="md-plain">快捷键自定义</span></h3>
<p class="md-end-block md-p"><span class="md-plain">编辑 </span><span class="md-pair-s" spellcheck="false"><code>~/.claude/keybindings.json</code></span><span class="md-plain">：</span></p>



```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor"
      }
    }
  ]
}
```


<blockquote>
<p class="md-end-block md-p"><span class="md-plain">将快捷键设为 </span><span class="md-pair-s" spellcheck="false"><code>null</code></span><span class="md-plain"> 可取消默认绑定。运行 </span><span class="md-pair-s" spellcheck="false"><code>/keybindings</code></span><span class="md-plain"> 直接打开配置。</span></p>
</blockquote>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">五、MCP 服务器</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">CLI 命令</span></h3>


```bash
claude mcp add <名称> --transport http <url>       # 添加 HTTP 类型
claude mcp add <名称> --transport stdio <命令>      # 添加 stdio 类型
claude mcp add-json <名称> '<json配置>'             # 从 JSON 添加
claude mcp add-from-claude-desktop <名称>           # 从 Claude Desktop 导入
claude mcp remove <名称>                            # 移除
claude mcp list                                     # 列出
claude mcp get <名称>                               # 查看详情
claude mcp reset-project-choices                    # 重置项目级 MCP 批准
claude mcp serve                                    # 作为 MCP 服务器运行
```


<h3 class="md-end-block md-heading"><span class="md-plain">配置示例</span></h3>


```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "puppeteer": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-puppeteer"]
    }
  }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">配置文件位置</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">范围</span></span></th>
<th><span class="td-span"><span class="md-plain">文件</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">用户级</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>~/.claude/settings.json</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">项目共享</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>.mcp.json</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">项目个人</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>.mcp.local.json</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">六、Hooks 自动化</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">核心事件</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">事件</span></span></th>
<th><span class="td-span"><span class="md-plain">触发时机</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>SessionStart</code></span></span></td>
<td><span class="td-span"><span class="md-plain">会话启动</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>SessionEnd</code></span></span></td>
<td><span class="td-span"><span class="md-plain">会话结束</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PreToolUse</code></span></span></td>
<td><span class="td-span"><span class="md-plain">工具执行前</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PostToolUse</code></span></span></td>
<td><span class="td-span"><span class="md-plain">工具执行后</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Stop</code></span></span></td>
<td><span class="td-span"><span class="md-plain">Claude 停止响应</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>UserPromptSubmit</code></span></span></td>
<td><span class="td-span"><span class="md-plain">用户提交提示前</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Notification</code></span></span></td>
<td><span class="td-span"><span class="md-plain">发送通知</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PreCompact</code></span></span></td>
<td><span class="td-span"><span class="md-plain">上下文压缩前</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PostCompact</code></span></span></td>
<td><span class="td-span"><span class="md-plain">上下文压缩后</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">扩展事件</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">事件</span></span></th>
<th><span class="td-span"><span class="md-plain">触发时机</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PermissionRequest</code></span></span></td>
<td><span class="td-span"><span class="md-plain">权限请求时</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PermissionDenied</code></span></span></td>
<td><span class="td-span"><span class="md-plain">权限被拒绝时</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>PostToolUseFailure</code></span></span></td>
<td><span class="td-span"><span class="md-plain">工具执行失败后</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>SubagentStart</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>SubagentStop</code></span></span></td>
<td><span class="td-span"><span class="md-plain">子代理启动/停止</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>TaskCreated</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>TaskCompleted</code></span></span></td>
<td><span class="td-span"><span class="md-plain">任务创建/完成</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>StopFailure</code></span></span></td>
<td><span class="td-span"><span class="md-plain">停止失败</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>InstructionsLoaded</code></span></span></td>
<td><span class="td-span"><span class="md-plain">指令加载完成</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>ConfigChange</code></span></span></td>
<td><span class="td-span"><span class="md-plain">配置变更</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>CwdChanged</code></span></span></td>
<td><span class="td-span"><span class="md-plain">工作目录变更</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>FileChanged</code></span></span></td>
<td><span class="td-span"><span class="md-plain">文件变更</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>WorktreeCreate</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>WorktreeRemove</code></span></span></td>
<td><span class="td-span"><span class="md-plain">Worktree 创建/移除</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Elicitation</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>ElicitationResult</code></span></span></td>
<td><span class="td-span"><span class="md-plain">引发用户输入</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">Hook 类型</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">类型</span></span></th>
<th><span class="td-span"><span class="md-plain">说明</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>command</code></span></span></td>
<td><span class="td-span"><span class="md-plain">执行 shell 命令</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>http</code></span></span></td>
<td><span class="td-span"><span class="md-plain">发送 HTTP 请求</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>prompt</code></span></span></td>
<td><span class="td-span"><span class="md-plain">返回提示文本</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>agent</code></span></span></td>
<td><span class="td-span"><span class="md-plain">使用子代理处理</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">配置示例</span></h3>


```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npx eslint --fix $FILE_PATH" }]
      }
    ],
    "Stop": [
      {
        "hooks": [{ "type": "command", "command": "say '任务完成'" }]
      }
    ]
  }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">退出码</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">退出码</span></span></th>
<th><span class="td-span"><span class="md-plain">行为</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>0</code></span></span></td>
<td><span class="td-span"><span class="md-plain">成功，继续</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>2</code></span></span></td>
<td><span class="td-span"><span class="md-plain">阻止操作</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">其他</span></span></td>
<td><span class="td-span"><span class="md-plain">警告，不阻止</span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">七、子代理 & 技能</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">内置代理</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">代理</span></span></th>
<th><span class="td-span"><span class="md-plain">模型</span></span></th>
<th><span class="td-span"><span class="md-plain">工具</span></span></th>
<th><span class="td-span"><span class="md-plain">用途</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">Explore</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">Haiku（快）</span></span></td>
<td><span class="td-span"><span class="md-plain">只读</span></span></td>
<td><span class="td-span"><span class="md-plain">快速搜索分析</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">Plan</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">继承主会话</span></span></td>
<td><span class="td-span"><span class="md-plain">只读</span></span></td>
<td><span class="td-span"><span class="md-plain">Plan 模式研究</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">general-purpose</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">继承主会话</span></span></td>
<td><span class="td-span"><span class="md-plain">全部</span></span></td>
<td><span class="td-span"><span class="md-plain">复杂多步任务</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">自定义代理位置</span></h3>


```
.claude/agents/          → 项目级
~/.claude/agents/        → 用户级
--agents CLI 标志        → 会话级
```


<h3 class="md-end-block md-heading"><span class="md-plain">技能位置</span></h3>


```
~/.claude/skills/<名>/SKILL.md     → 用户级
.claude/skills/<名>/SKILL.md       → 项目级
```


<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">内置技能</span></span></th>
<th><span class="td-span"><span class="md-plain">说明</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/batch &lt;任务&gt;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">大规模并行变更（5-30 个 worktree 代理）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/loop [间隔] &lt;提示&gt;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">定时循环执行</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/simplify</code></span></span></td>
<td><span class="td-span"><span class="md-plain">代码质量审查</span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">八、IDE 集成</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">VS Code</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">快捷键</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Cmd/Ctrl+Esc</code></span></span></td>
<td><span class="td-span"><span class="md-plain">切换编辑器 ↔ Claude（Focus Input）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Cmd/Ctrl+Shift+Esc</code></span></span></td>
<td><span class="td-span"><span class="md-plain">新标签页新对话</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Cmd/Ctrl+N</code></span></span></td>
<td><span class="td-span"><span class="md-plain">新建对话（Claude 获得焦点时）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Option/Alt+K</code></span></span></td>
<td><span class="td-span"><span class="md-plain">插入文件/选区的 @-mention</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>Cmd/Ctrl+Shift+P</code></span><span class="md-plain"> → "Claude Code"</span></span></td>
<td><span class="td-span"><span class="md-plain">命令面板</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">JetBrains</span></h3>
<p class="md-end-block md-p"><span class="md-plain">支持 IntelliJ、WebStorm、PyCharm 全系列。</span></p>

<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">九、CLI 完整标志速查</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">常用标志</span></h3>


```bash
claude -p "问题"                        # 非交互模式
claude -c                                # 恢复最近对话
claude -r "名称"                         # 恢复指定会话
claude --model claude-sonnet-4-6         # 指定模型
claude --effort high                     # 推理深度
claude -w feature-auth                   # Worktree 隔离
claude -w feature-auth --tmux            # 带 tmux
claude --add-dir ../lib ../shared        # 添加目录
claude -n "名称"                         # 会话命名
claude --from-pr 123                     # 从 PR 恢复
claude --fork-session                    # 分叉会话
```


<h3 class="md-end-block md-heading"><span class="md-plain">非交互/CI 模式</span></h3>


```bash
claude -p "问题" --output-format json          # JSON 输出
claude -p "问题" --output-format stream-json    # 流式 JSON
claude -p "问题" --max-budget-usd 5.00          # 限制花费
claude -p "问题" --max-turns 3                  # 限制轮次
claude -p "问题" --allowedTools "Read" "Bash(git *)"  # 预授权
claude -p "问题" --disallowedTools "Bash(git push *)"  # 禁用
claude -p "问题" --json-schema '{...}'          # 结构化输出
claude -p "问题" --input-format stream-json     # 流式输入
```


<h3 class="md-end-block md-heading"><span class="md-plain">高级标志</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">标志</span></span></th>
<th><span class="td-span"><span class="md-plain">说明</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--system-prompt &quot;...&quot;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">替换系统提示</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--append-system-prompt &quot;...&quot;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">追加系统提示</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--dangerously-skip-permissions</code></span></span></td>
<td><span class="td-span"><span class="md-plain">跳过所有权限（仅 CI）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--permission-mode auto</code></span></span></td>
<td><span class="td-span"><span class="md-plain">设置权限模式</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--tools &quot;Bash,Edit,Read&quot;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">限制可用工具</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--agent &lt;名称&gt;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">指定代理</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--bare</code></span></span></td>
<td><span class="td-span"><span class="md-plain">最小模式加速启动</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--verbose</code></span></span></td>
<td><span class="td-span"><span class="md-plain">详细输出</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--debug &quot;api,mcp&quot;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">调试模式</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--fallback-model sonnet</code></span></span></td>
<td><span class="td-span"><span class="md-plain">模型过载时回退</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--mcp-config ./mcp.json</code></span></span></td>
<td><span class="td-span"><span class="md-plain">加载 MCP 配置</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--remote &quot;任务&quot;</code></span></span></td>
<td><span class="td-span"><span class="md-plain">Web 会话</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--teleport</code></span></span></td>
<td><span class="td-span"><span class="md-plain">恢复 Web 会话到本地</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--settings ./settings.json</code></span></span></td>
<td><span class="td-span"><span class="md-plain">额外设置文件</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>--init</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>--init-only</code></span></span></td>
<td><span class="td-span"><span class="md-plain">运行初始化 hooks</span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">十、沙箱 & 环境变量</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">沙箱</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">平台</span></span></th>
<th><span class="td-span"><span class="md-plain">实现方式</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">macOS</span></span></td>
<td><span class="td-span"><span class="md-plain">Seatbelt 框架</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">Linux/WSL2</span></span></td>
<td><span class="td-span"><span class="md-plain">bubblewrap</span></span></td>
</tr>
</tbody>
</table>
</figure>


```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "allowWrite": ["~/.kube"],
      "denyRead": ["~/secrets/"]
    },
    "network": {
      "allowedDomains": ["github.com"]
    }
  }
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">环境变量</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">变量</span></span></th>
<th><span class="td-span"><span class="md-plain">说明</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>ANTHROPIC_BASE_URL</code></span></span></td>
<td><span class="td-span"><span class="md-plain">自定义 API 端点</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>CLAUDE_AUTOCOMPACT_PCT_OVERRIDE</code></span></span></td>
<td><span class="td-span"><span class="md-plain">自动压缩触发百分比（如 </span><span class="md-pair-s" spellcheck="false"><code>50</code></span><span class="md-plain"> = 50% 时触发）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>API_TIMEOUT_MS</code></span></span></td>
<td><span class="td-span"><span class="md-plain">API 超时</span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">快速场景速查</span></h2>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">场景</span></span></th>
<th><span class="td-span"><span class="md-plain">操作</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">新项目开始</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/init</code></span><span class="md-plain"> → 写好 CLAUDE.md 规则</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">对话太长变卡</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/compact</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">换个话题</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/clear</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">只想分析不改代码</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/plan</code></span><span class="md-plain"> 或 </span><span class="md-pair-s" spellcheck="false"><code>Alt+M</code></span><span class="md-plain"> 切 Plan 模式</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">想要更深思考</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/effort high</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">看花了多少钱</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/cost</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">检查 Claude 改了什么</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/diff</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">不小心改坏了</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/rewind</code></span><span class="md-plain"> 回退</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">跑个命令</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>!npm run build</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">看某个文件</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>@src/app.ts 帮我分析</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">隔离开发功能</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>claude -w feature-xxx</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">自动化 CI</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>claude -p &quot;任务&quot; --allowedTools ... --output-format json</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">调试问题</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/effort high</code></span><span class="md-plain"> → 详细输出 </span><span class="md-pair-s" spellcheck="false"><code>Ctrl+O</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">任务完成了要通知</span></span></td>
<td><span class="td-span"><span class="md-plain">Hooks → </span><span class="md-pair-s" spellcheck="false"><code>Stop</code></span><span class="md-plain"> 事件 → macOS: </span><span class="md-pair-s" spellcheck="false"><code>say &#039;完成&#039;</code></span><span class="md-plain"> · Windows: </span><span class="md-pair-s" spellcheck="false"><code>powershell -c &quot;Write-Host &#039;完成&#039;&quot;</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">保存对话</span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>/export</code></span><span class="md-plain"> 导出为文本</span></span></td>
</tr>
</tbody>
</table>
</figure>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<blockquote>
<p class="md-end-block md-p md-focus"><span class="md-plain">输入 </span><span class="md-pair-s" spellcheck="false"><code>/help</code></span><span class="md-plain"> 随时查看完整命令列表 · 共 </span><span class="md-pair-s "><strong><span class="md-plain">57 个</span></strong></span><span class="md-plain md-expand">内置斜杠命令</span></p>
</blockquote>
