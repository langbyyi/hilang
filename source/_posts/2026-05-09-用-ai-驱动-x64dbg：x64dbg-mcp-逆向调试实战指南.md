---
title: "用 AI 驱动 x64dbg：x64dbg-mcp 逆向调试实战指南"
date: "2026-05-09 10:54:37"
updated: "2026-05-30 19:23:11"
categories: ["文章", "工具资源"]
tags: ["MCP", "x64dbg", "逆向"]
thumbnail: "/wp-content/uploads/2026/img-7879028629c4.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "1028"
---
<blockquote>
<p class="md-end-block md-p"><span class="md-plain">当逆向工程遇上大语言模型，从崩溃分析到漏洞挖掘的效率将迎来质的飞跃。x64dbg-mcp 通过 MCP 协议将 x64dbg 的全部调试能力暴露给 AI，让 AI 像逆向工程师一样操控调试器。</span></p>
</blockquote>
<h2 class="md-end-block md-heading"><span class="md-plain">一、前言</span></h2>
<p class="md-end-block md-p"><span class="md-plain">x64dbg 是 Windows 平台最流行的开源调试器，几乎每个安全从业者都用过。而随着大语言模型（LLM）的发展，"AI + 逆向工程"正在成为新的趋势。</span><span class="md-meta-i-c md-link"><a href="https://github.com/SetsunaYukiOvO/x64dbg-mcp"><span class="md-plain">SetsunaYukiOvO/x64dbg-mcp</span></a></span><span class="md-plain"> 项目通过 MCP（Model Context Protocol）协议，将 x64dbg 的调试能力暴露给 AI 客户端，让 AI 可以像人一样操控调试器——设置断点、读内存、单步执行、分析函数，全都用自然语言完成。</span></p>
<p class="md-end-block md-p"><span class="md-plain">本文将从安装配置、架构原理到实战场景，带你全面了解和使用这个插件。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">二、什么是 x64dbg-mcp？</span></h2>
<p class="md-end-block md-p"><span class="md-plain">x64dbg-mcp 是一个 </span><span class="md-pair-s "><strong><span class="md-plain">x64dbg/x32dbg 原生插件</span></strong></span><span class="md-plain">，它通过 MCP 协议将调试器的全部能力暴露给 AI 代理。插件以 </span><span class="md-pair-s" spellcheck="false"><code>.dp64</code></span><span class="md-plain"> / </span><span class="md-pair-s" spellcheck="false"><code>.dp32</code></span><span class="md-plain"> DLL 的形式加载到 x64dbg 中，内嵌一个 HTTP 服务器，通过 JSON-RPC 2.0 + SSE 协议与外部 AI 客户端通信。</span></p>
<p class="md-end-block md-p"><span class="md-plain">通过它，AI 能够：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">控制调试执行（运行、暂停、单步）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">读写寄存器和内存</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">管理断点（软件/硬件/内存断点）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">反汇编代码、分析函数</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">解析符号、查看导入导出表</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Dump 模块、检测壳、寻找 OEP</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行 x64dbg 脚本命令</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">三、安装与配置</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">3.1 前置条件</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Windows 10/11（x64）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">x64dbg（build 2023+）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">Claude Code CLI（配置好环境）</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3.2 安装插件</span></h3>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">方式一：下载预编译文件（推荐）</span></strong></span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p md-focus"><span class="md-plain">前往 </span><span class="md-meta-i-c md-link"><a href="https://github.com/SetsunaYukiOvO/x64dbg-mcp/releases"><span class="md-plain">Releases 页面</span></a></span><span class="md-plain"> 下载最新版本的 </span><span class="md-pair-s" spellcheck="false"><code>x64dbg_mcp.dp64</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">将文件复制到 x64dbg 的插件目录：</span></p>
</li>
</ol>


```
copy x64dbg_mcp.dp64 <x64dbg-path>\release\x64\plugins\
```


<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">方式二：从源码编译</span></strong></span></p>
<p class="md-end-block md-p"><span class="md-plain">需要 Visual Studio 2022、CMake 3.15+、vcpkg：</span></p>



```bash
git clone https://github.com/SetsunaYukiOvO/x64dbg-mcp.git
cd x64dbg-mcp
.\build.bat
```


<p class="md-end-block md-p"><span class="md-plain">编译产物在 </span><span class="md-pair-s" spellcheck="false"><code>dist/</code></span><span class="md-plain"> 目录，复制到插件目录即可。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.3 验证安装</span></h3>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">打开 x64dbg</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">菜单栏出现 </span><span class="md-pair-s "><strong><span class="md-plain">Plugins → MCP Server</span></strong></span><span class="md-plain">，说明插件加载成功</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">点击 </span><span class="md-pair-s "><strong><span class="md-plain">Plugins → MCP Server → Start MCP HTTP Server</span></strong></span><span class="md-plain"> 启动服务</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">服务器默认监听 </span><span class="md-pair-s" spellcheck="false"><code>http://127.0.0.1:3000</code></span></p>
</li>
</ol>
<p class="md-end-block md-p"></p>

<h3><img class="alignnone size-full wp-image-1037" src="/wp-content/uploads/2026/img-7879028629c4.png" alt="" width="1596" height="1036" /></h3>
<h3 class="md-end-block md-heading"><span class="md-plain">3.4 连接 Claude Code</span></h3>
<p class="md-end-block md-p"><span class="md-plain">编辑配置文件 </span><span class="md-pair-s" spellcheck="false"><code>~/.claude.json</code></span><span class="md-plain">，在 </span><span class="md-pair-s" spellcheck="false"><code>mcpServers</code></span><span class="md-plain"> 节点中追加以下配置：</span></p>



```json
{
  "mcpServers": {
    "x64Dbg": {
      "type": "http",
      "url": "http://127.0.0.1:3000"
    }
  }
}
```


<p class="md-end-block md-p"><img class="alignnone size-full wp-image-1038" src="/wp-content/uploads/2026/img-adfc2ad0df25.png" alt="" width="731" height="261" /></p>
<p class="md-end-block md-p"><span class="md-plain">重启 Claude Code，MCP 即可自动完成连接。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.5 配置选项</span></h3>
<p class="md-end-block md-p"><span class="md-plain">插件首次加载时会自动在插件目录下生成 </span><span class="md-pair-s" spellcheck="false"><code>x64dbg-mcp/config.json</code></span><span class="md-plain">：</span></p>

<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">配置项</span></span></th>
<th><span class="td-span"><span class="md-plain">默认值</span></span></th>
<th><span class="td-span"><span class="md-plain">说明</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">server.address</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>127.0.0.1</code></span></span></td>
<td><span class="td-span"><span class="md-plain">服务监听地址</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">server.port</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>3000</code></span></span></td>
<td><span class="td-span"><span class="md-plain">服务监听端口</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">permissions.allow_memory_write</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>true</code></span></span></td>
<td><span class="td-span"><span class="md-plain">允许 AI 写入内存</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">permissions.allow_register_write</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>true</code></span></span></td>
<td><span class="td-span"><span class="md-plain">允许 AI 写入寄存器</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">permissions.allow_script_execution</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>true</code></span></span></td>
<td><span class="td-span"><span class="md-plain">允许 AI 执行脚本</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">permissions.allowed_methods</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">14 个通配符</span></span></td>
<td><span class="td-span"><span class="md-plain">允许调用的方法白名单</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">features.auto_start_mcp_on_plugin_load</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>true</code></span></span></td>
<td><span class="td-span"><span class="md-plain">插件加载时自动启动服务</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">features.enable_heartbeat</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>true</code></span></span></td>
<td><span class="td-span"><span class="md-plain">启用心跳检测</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">timeout.request_timeout_ms</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>30000</code></span></span></td>
<td><span class="td-span"><span class="md-plain">请求超时时间</span></span></td>
</tr>
</tbody>
</table>
</figure>
<blockquote>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">提示</span></strong></span><span class="md-plain">：也可以通过 </span><span class="md-pair-s "><strong><span class="md-plain">Plugins → MCP Server → Edit Config</span></strong></span><span class="md-plain"> 打开 GUI 配置编辑器修改配置。</span></p>
</blockquote>
<h2 class="md-end-block md-heading"><span class="md-plain">四、架构原理</span></h2>
<p class="md-end-block md-p"><span class="md-plain">插件采用清晰的四层架构：</span></p>



```
┌───────────────────────────────────────────────────┐
│                 AI 客户端 (Claude Code)              │
└─────────────────────┬─────────────────────────────┘
                      │ SSE / HTTP (JSON-RPC 2.0)
                      ▼
┌───────────────────────────────────────────────────┐
│              通信层 (Communication)                  │
│         MCPHttpServer · ConnectionManager           │
│         HeartbeatMonitor · MessageTransport         │
├───────────────────────────────────────────────────┤
│              协议层 (Protocol)                       │
│    MethodDispatcher · MCPToolRegistry (79 工具)      │
│    PermissionChecker · ConfigManager                │
├───────────────────────────────────────────────────┤
│              业务层 (Business)                       │
│   DebugController · RegisterManager                 │
│   MemoryManager · BreakpointManager                 │
│   DisassemblyEngine · SymbolResolver                │
│   StackManager · ThreadManager · DumpManager        │
├───────────────────────────────────────────────────┤
│              插件层 (Plugin)                         │
│         x64dbg Plugin SDK · 事件回调                 │
└───────────────────────────────────────────────────┘
```


<p class="md-end-block md-p"><span class="md-plain">关键设计：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">地址解析统一</span></strong></span><span class="md-plain">：所有地址参数都支持符号名（如 </span><span class="md-pair-s" spellcheck="false"><code>kernel32.CreateFileW</code></span><span class="md-plain">）、寄存器名（如 </span><span class="md-pair-s" spellcheck="false"><code>RIP</code></span><span class="md-plain">）和 x64dbg 表达式</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">双架构支持</span></strong></span><span class="md-plain">：通过条件编译同时支持 x64 和 x86 调试器</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">权限白名单</span></strong></span><span class="md-plain">：通过通配符模式控制方法调用权限，默认开放 14 类方法</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">通信端点</span></strong></span><span class="md-plain">：</span><span class="md-pair-s" spellcheck="false"><code>POST /rpc</code></span><span class="md-plain">（JSON-RPC 请求）、</span><span class="md-pair-s" spellcheck="false"><code>GET /sse</code></span><span class="md-plain">（事件流）、</span><span class="md-pair-s" spellcheck="false"><code>GET /</code></span><span class="md-plain">（状态检查）</span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">五、AI 可以操控 x64dbg 做什么？</span></h2>
<p class="md-end-block md-p"><span class="md-plain">插件通过 MCP 协议暴露了 </span><span class="md-pair-s "><strong><span class="md-plain">79 个工具</span></strong></span><span class="md-plain">、</span><span class="md-pair-s "><strong><span class="md-plain">7+8 个资源</span></strong></span><span class="md-plain">、</span><span class="md-pair-s "><strong><span class="md-plain">10 个提示词模板</span></strong></span><span class="md-plain">：</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">5.1 调试控制</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">工具</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_init</code></span></span></td>
<td><span class="td-span"><span class="md-plain">启动新的调试会话</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_run</code></span></span></td>
<td><span class="td-span"><span class="md-plain">继续执行</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_pause</code></span></span></td>
<td><span class="td-span"><span class="md-plain">暂停执行</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_step_into</code></span></span></td>
<td><span class="td-span"><span class="md-plain">单步进入</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_step_over</code></span></span></td>
<td><span class="td-span"><span class="md-plain">单步越过</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_step_out</code></span></span></td>
<td><span class="td-span"><span class="md-plain">单步跳出函数</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_run_to</code></span></span></td>
<td><span class="td-span"><span class="md-plain">运行到指定地址</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_restart</code></span></span></td>
<td><span class="td-span"><span class="md-plain">重启调试会话</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_stop</code></span></span></td>
<td><span class="td-span"><span class="md-plain">停止调试</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>debug_get_state</code></span></span></td>
<td><span class="td-span"><span class="md-plain">获取当前调试状态</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">5.2 寄存器操作</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">工具</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>register_get</code></span></span></td>
<td><span class="td-span"><span class="md-plain">读取单个寄存器</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>register_set</code></span></span></td>
<td><span class="td-span"><span class="md-plain">写入寄存器值</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>register_list</code></span></span></td>
<td><span class="td-span"><span class="md-plain">列出所有寄存器</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>register_get_batch</code></span></span></td>
<td><span class="td-span"><span class="md-plain">批量读取寄存器（含 GPR、SSE、AVX）</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">5.3 内存操作</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">工具</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>memory_read</code></span></span></td>
<td><span class="td-span"><span class="md-plain">读取内存区域</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>memory_write</code></span></span></td>
<td><span class="td-span"><span class="md-plain">写入内存区域</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>memory_search</code></span></span></td>
<td><span class="td-span"><span class="md-plain">搜索内存模式（支持 hex 格式）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>memory_get_info</code></span></span></td>
<td><span class="td-span"><span class="md-plain">获取内存区域信息</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>memory_enumerate</code></span></span></td>
<td><span class="td-span"><span class="md-plain">列出所有内存区域</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>memory_allocate</code></span></span></td>
<td><span class="td-span"><span class="md-plain">分配内存</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>memory_free</code></span></span></td>
<td><span class="td-span"><span class="md-plain">释放内存</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">5.4 断点管理</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">工具</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>breakpoint_set</code></span></span></td>
<td><span class="td-span"><span class="md-plain">设置断点（软件/硬件/内存）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>breakpoint_delete</code></span></span></td>
<td><span class="td-span"><span class="md-plain">删除断点</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>breakpoint_enable/disable</code></span></span></td>
<td><span class="td-span"><span class="md-plain">启用/禁用断点</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>breakpoint_list</code></span></span></td>
<td><span class="td-span"><span class="md-plain">列出所有断点</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>breakpoint_set_condition</code></span></span></td>
<td><span class="td-span"><span class="md-plain">设置条件断点</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>breakpoint_set_log</code></span></span></td>
<td><span class="td-span"><span class="md-plain">设置日志断点</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>breakpoint_reset_hitcount</code></span></span></td>
<td><span class="td-span"><span class="md-plain">重置命中计数</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">5.5 反汇编与分析</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">工具</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>disassembly_at</code></span></span></td>
<td><span class="td-span"><span class="md-plain">反汇编指定地址</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>disassembly_range</code></span></span></td>
<td><span class="td-span"><span class="md-plain">反汇编地址范围</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>disassembly_function</code></span></span></td>
<td><span class="td-span"><span class="md-plain">反汇编整个函数</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>symbol_resolve</code></span></span></td>
<td><span class="td-span"><span class="md-plain">符号解析为地址</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>symbol_from_address</code></span></span></td>
<td><span class="td-span"><span class="md-plain">地址获取符号</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>module_get_exports</code></span></span></td>
<td><span class="td-span"><span class="md-plain">获取导出表</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>module_get_imports</code></span></span></td>
<td><span class="td-span"><span class="md-plain">获取导入表</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>xref_get</code></span></span></td>
<td><span class="td-span"><span class="md-plain">交叉引用分析</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">5.6 Dump 与脱壳</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">工具</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>dump_module</code></span></span></td>
<td><span class="td-span"><span class="md-plain">Dump 可执行模块（PE 重建）</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>dump_analyze_module</code></span></span></td>
<td><span class="td-span"><span class="md-plain">加壳检测与分析</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>dump_detect_oep</code></span></span></td>
<td><span class="td-span"><span class="md-plain">OEP 检测</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>dump_memory_region</code></span></span></td>
<td><span class="td-span"><span class="md-plain">Dump 任意内存区域</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">5.7 其他工具</span></h3>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">分类</span></span></th>
<th><span class="td-span"><span class="md-plain">工具</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">栈操作</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>stack_get_trace</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>stack_read_frame</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>stack_get_pointers</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">线程操作</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>thread_list</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>thread_switch</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>thread_suspend</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>thread_resume</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">脚本执行</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>script_execute</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>script_execute_batch</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">上下文快照</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>context_get_snapshot</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>context_compare_snapshots</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">补丁管理</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>patch_list</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>patch_restore</code></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">汇编器</span></strong></span></span></td>
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>assembler_assemble</code></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h2 class="md-end-block md-heading"><span class="md-plain">六、实战场景</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">6.1 场景一：崩溃分析</span></h3>
<p class="md-end-block md-p"><span class="md-plain">当程序崩溃时，直接让 AI 帮你分析崩溃原因：</span></p>

<blockquote>
<p class="md-end-block md-p"><span class="md-plain">使用 x64Dbg MCP："程序在地址 0x401234 处发生了访问违例，帮我分析崩溃原因"</span></p>
</blockquote>
<p class="md-end-block md-p"><span class="md-plain">AI 会自动：读取当前寄存器状态、获取调用栈、反汇编崩溃点附近的代码、检查内存访问的合法性，给出崩溃根因和修复建议。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">6.2 场景二：自动化脱壳</span></h3>
<blockquote>
<p class="md-end-block md-p"><span class="md-plain">使用 x64Dbg MCP："这个程序用了 UPX 壳，帮我自动脱壳"</span></p>
</blockquote>
<p class="md-end-block md-p"><span class="md-plain">AI 会调用 </span><span class="md-pair-s" spellcheck="false"><code>dump_analyze_module</code></span><span class="md-plain"> 确认壳类型，</span><span class="md-pair-s" spellcheck="false"><code>dump_detect_oep</code></span><span class="md-plain"> 寻找 OEP，然后单步执行到 OEP，最后 </span><span class="md-pair-s" spellcheck="false"><code>dump_module</code></span><span class="md-plain"> 转储脱壳后的程序。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">6.3 场景三：CTF 逆向</span></h3>
<blockquote>
<p class="md-end-block md-p"><span class="md-plain">使用 x64Dbg MCP："帮我在 check_serial 函数设置断点，分析注册码验证逻辑"</span></p>
</blockquote>
<p class="md-end-block md-p"><span class="md-plain">AI 调用 </span><span class="md-pair-s" spellcheck="false"><code>symbol_resolve</code></span><span class="md-plain"> 解析函数地址，</span><span class="md-pair-s" spellcheck="false"><code>breakpoint_set</code></span><span class="md-plain"> 设置断点，命中后读取参数和返回值，</span><span class="md-pair-s" spellcheck="false"><code>disassembly_function</code></span><span class="md-plain"> 反汇编完整函数，最终还原验证算法。</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">6.4 场景四：直接逆向</span></h3>
<blockquote>
<p class="md-end-block md-p"><span class="md-plain">使用 x64Dbg MCP："帮我把这个程序逆过来"</span></p>
</blockquote>
<p class="md-end-block md-p"><span class="md-plain">AI 会自动分析程序结构：识别主函数和关键逻辑、反汇编核心代码段、读取内存中的关键数据、追踪函数调用关系，最终给出完整的逆向分析结果和伪代码。</span></p>
<img class="alignnone size-full wp-image-1040" src="/wp-content/uploads/2026/img-d1e014487de8.png" alt="" width="1019" height="1069" />
<h3 class="md-end-block md-heading"><span class="md-plain">6.5 场景五：动态调试</span></h3>
<blockquote>
<p class="md-end-block md-p"><span class="md-plain">使用 x64Dbg MCP："帮我在 CreateFileW 下断点，监控程序打开的所有文件"</span></p>
</blockquote>
<p class="md-end-block md-p"><span class="md-plain">AI 调用 </span><span class="md-pair-s" spellcheck="false"><code>breakpoint_set</code></span><span class="md-plain"> 在 </span><span class="md-pair-s" spellcheck="false"><code>kernel32.CreateFileW</code></span><span class="md-plain"> 设置断点，每次命中时读取参数（文件路径、访问模式），记录所有文件操作，帮助你快速掌握程序的行为逻辑。</span></p>
<img class="alignnone size-full wp-image-1039" src="/wp-content/uploads/2026/img-e44fd55cbc94.png" alt="" width="1190" height="647" />
<p class="md-end-block md-p"></p>

<h2 class="md-end-block md-heading"><span class="md-plain">七、总结</span></h2>
<p class="md-end-block md-p md-focus"><span class="md-plain md-expand">x64dbg-mcp 的推出，让 x64dbg 正式迈入 AI 辅助逆向工程的时代。79 个调试工具、10 个结构化工作流提示词，覆盖了从崩溃分析、漏洞挖掘到脱壳逆向的完整场景。对于安全研究人员、恶意软件分析师和 CTF 选手而言，它极大地降低了 AI 与调试器交互的门槛——安装一个插件，配一行 JSON，开始你的 AI 驱动逆向之旅。</span></p>
