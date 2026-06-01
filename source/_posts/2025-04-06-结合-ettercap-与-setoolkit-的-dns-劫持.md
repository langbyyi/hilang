---
title: "结合 Ettercap 与 SEToolkit 的 DNS 劫持"
date: "2025-04-06 20:18:03"
updated: "2026-05-30 19:25:31"
categories: ["文章", "学习笔记"]
tags: ["DNS 劫持", "ARP 欺骗"]
thumbnail: "/wp-content/uploads/2025/img-0632bac36035.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "739"
---
<h2 class="md-end-block md-heading md-focus"><span class="md-plain">环境说明</span></h2>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">主机</span></span></th>
<th><span class="td-span"><span class="md-plain">IP 地址</span></span></th>
<th><span class="td-span"><span class="md-plain">角色</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">攻击机（Kali）</span></span></td>
<td><span class="td-span"><span class="md-plain">172.16.129.251</span></span></td>
<td><span class="td-span"><span class="md-plain">执行 DNS 劫持与钓鱼攻击</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">靶机</span></span></td>
<td><span class="td-span"><span class="md-plain">172.16.129.190</span></span></td>
<td><span class="td-span"><span class="md-plain">目标主机</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-plain">网关</span></span></td>
<td><span class="td-span"><span class="md-plain">172.16.129.254</span></span></td>
<td><span class="td-span"><span class="md-plain">局域网网关</span></span></td>
</tr>
</tbody>
</table>
</figure>
<h2 class="md-end-block md-heading"><span class="md-plain">详细步骤</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">一、修改 Ettercap 的 DNS 配置文件（劫持核心）</span></h3>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">打开 Ettercap 的 DNS 规则文件：</span></p>



```bash
vim /etc/ettercap/etter.dns
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">添加全局劫持规则（将所有域名解析到攻击机 IP）：</span></p>



```bash
# 所有域名A记录指向攻击机
*       A        172.16.129.251
# 反向解析同样指向攻击机（增强欺骗效果）
*       PTR      172.16.129.251
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">保存文件并关闭编辑器（确保无语法错误）。</span></p>
</li>
</ol>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806195902888.png"><img class="alignnone wp-image-740 size-large" src="/wp-content/uploads/2025/img-0632bac36035.png" alt="" width="1024" height="845" /></span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">二、启动 Ettercap 图形化工具并配置流量拦截</span></h3>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">打开 Ettercap 图形界面：</span></p>



```bash
ettercap -G
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">选择网络接口：</span> <span class="md-plain">点击菜单栏 </span><span class="md-pair-s" spellcheck="false"><code>Sniff</code></span><span class="md-plain"> → </span><span class="md-pair-s" spellcheck="false"><code>Unified sniffing</code></span><span class="md-plain">，选择攻击机的网卡（如</span><span class="md-pair-s" spellcheck="false"><code>eth0</code></span><span class="md-plain">），点击</span><span class="md-pair-s" spellcheck="false"><code>OK</code></span><span class="md-plain">。</span></p>
</li>
</ol>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806200039872.png"><img class="alignnone wp-image-741 size-large" src="/wp-content/uploads/2025/img-95bcfc63dc9a.png" alt="" width="1024" height="729" /></span></p>

<ol class="ol-list" start="3">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">扫描局域网主机：</span> <span class="md-plain">按下 </span><span class="md-pair-s" spellcheck="false"><code>Ctrl+S</code></span><span class="md-plain"> 或点击工具栏放大镜图标，扫描完成后点击 </span><span class="md-pair-s" spellcheck="false"><code>Hosts</code></span><span class="md-plain"> → </span><span class="md-pair-s" spellcheck="false"><code>Host list</code></span><span class="md-plain"> 查看设备。</span></p>
</li>
</ol>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806200200748.png"><img class="alignnone wp-image-742 size-large" src="/wp-content/uploads/2025/img-0ed7d75fea48.png" alt="" width="1024" height="628" /></span></p>

<ol class="ol-list" start="4">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">设置目标（网关和靶机）：</span></p>
</li>
</ol>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">在主机列表中找到网关（172.16.129.254），右键选择 </span><span class="md-pair-s" spellcheck="false"><code>Add to Target 1</code></span><span class="md-plain">。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">找到靶机（172.16.129.190），右键选择 </span><span class="md-pair-s" spellcheck="false"><code>Add to Target 2</code></span><span class="md-plain">。</span></p>
</li>
</ul>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806200405917.png"><img class="alignnone wp-image-743 size-large" src="/wp-content/uploads/2025/img-7d99b33a6bf6.png" alt="" width="1024" height="618" /></span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">三、开启 ARP 欺骗（流量劫持基础）</span></h3>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">点击菜单栏 </span><span class="md-pair-s" spellcheck="false"><code>Mitm</code></span><span class="md-plain"> → </span><span class="md-pair-s" spellcheck="false"><code>ARP poisoning</code></span><span class="md-plain">，勾选 </span><span class="md-pair-s" spellcheck="false"><code>Sniff remote connections</code></span><span class="md-plain">（允许嗅探远程连接），点击</span><span class="md-pair-s" spellcheck="false"><code>OK</code></span><span class="md-plain">。</span></p>
</li>
</ol>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806200451246.png"><img class="alignnone size-full wp-image-744" src="/wp-content/uploads/2025/img-7d097370762b.png" alt="" width="1429" height="858" /></span></p>

<ol class="ol-list" start="2">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">此时攻击机已成为靶机与网关之间的 “中间人”，所有流量会经过攻击机。</span></p>
</li>
</ol>
<h3 class="md-end-block md-heading"><span class="md-plain">四、加载 DNS 欺骗插件（激活域名劫持）</span></h3>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">点击菜单栏 </span><span class="md-pair-s" spellcheck="false"><code>Plugins</code></span><span class="md-plain"> → </span><span class="md-pair-s" spellcheck="false"><code>Manage plugins</code></span><span class="md-plain">，在插件列表中找到 </span><span class="md-pair-s" spellcheck="false"><code>dns_spoof</code></span><span class="md-plain">，双击激活。</span></p>
</li>
</ol>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806200535267.png"><img class="alignnone size-full wp-image-745" src="/wp-content/uploads/2025/img-b7fb23ae7b83.png" alt="" width="1393" height="625" /></span></p>

<ol class="ol-list" start="2">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">底部状态栏会显示 “dns_spoof activated”，表示 DNS 劫持已生效。</span></p>
</li>
</ol>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806200624114.png"><img class="alignnone size-full wp-image-746" src="/wp-content/uploads/2025/img-b43ef75dc02e.png" alt="" width="1359" height="771" /></span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">五、启动 SEToolkit（构建钓鱼场景）</span></h3>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">打开新终端，启动社会工程学工具包（SEToolkit）：</span></p>



```bash
setoolkit
```


</li>
</ol>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806200658359.png"><img class="alignnone size-full wp-image-747" src="/wp-content/uploads/2025/img-16887d6d7177.png" alt="" width="1094" height="790" /></span></p>

<ol class="ol-list" start="2">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">按以下步骤配置钓鱼页面（演示 </span><span class="md-pair-s" spellcheck="false"><code>baidu</code></span><span class="md-plain">）：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">输入 </span><span class="md-pair-s" spellcheck="false"><code>1</code></span><span class="md-plain"> 选择 </span><span class="md-pair-s" spellcheck="false"><code>Social-Engineering Attacks</code></span><span class="md-plain">（社会工程学攻击）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">输入 </span><span class="md-pair-s" spellcheck="false"><code>2</code></span><span class="md-plain"> 选择 </span><span class="md-pair-s" spellcheck="false"><code>Website Attack Vectors</code></span><span class="md-plain">（网页攻击向量）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">输入 </span><span class="md-pair-s" spellcheck="false"><code>3</code></span><span class="md-plain"> 选择 </span><span class="md-pair-s" spellcheck="false"><code>Credential Harvester Attack Method</code></span><span class="md-plain">（凭证收割攻击）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">输入 </span><span class="md-pair-s" spellcheck="false"><code>1</code></span><span class="md-plain"> 选择 </span><span class="md-pair-s" spellcheck="false"><code>Web Templates</code></span><span class="md-plain">（使用预设网页模板），或输入 </span><span class="md-pair-s" spellcheck="false"><code>2</code></span><span class="md-plain"> 自定义克隆目标网站。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">当提示 “Enter the IP address to listen on” 时，输入攻击机 IP或回车：</span><span class="md-pair-s" spellcheck="false"><code>172.16.129.251</code></span><span class="md-plain">。</span></p>
</li>
</ul>
</li>
</ol>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250806200746753.png"><img class="alignnone size-full wp-image-748" src="/wp-content/uploads/2025/img-ae9a4c91931f.png" alt="" width="1093" height="475" /></span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">攻击效果验证</span></h2>
<p class="md-end-block md-p"><span class="md-plain">在靶机（172.16.129.190）上操作：打开浏览器访问任意网站（如</span><span class="md-pair-s" spellcheck="false"><code>123.com</code></span><span class="md-plain">），会被 DNS 劫持强制跳转至攻击机构建的钓鱼页面。</span></p>
<p class="md-end-block md-p md-focus"><img class="alignnone size-full wp-image-749" src="/wp-content/uploads/2025/img-d1b0cd115813.png" alt="" width="1432" height="591" /></p>
