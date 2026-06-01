---
title: "Xray 安装与使用（Windows 系统）"
date: "2025-07-31 20:12:21"
updated: "2026-05-30 19:24:44"
categories: ["文章", "工具资源"]
tags: ["Xray", "漏洞扫描"]
thumbnail: "/wp-content/uploads/2025/img-2cfc42690930.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "589"
---
<h2 class="md-end-block md-heading"><span class="md-plain">一、Xray 简介</span></h2>
<p class="md-end-block md-p"><span class="md-plain">Xray 是一款多平台安全评估工具，支持 Web 漏洞扫描（如 XSS、SQL 注入等），非攻击性工具，适用于 Windows/macOS/Linux 系统。本文聚焦 Windows 系统的安装与基础使用。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">二、安装步骤</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">1. 下载安装包</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">下载地址：</span><span class="md-link md-pair-s" spellcheck="false"><a href="https://download.xray.cool/">https://download.xray.cool/</a></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">选择版本：Windows 系统推荐 </span><span class="md-pair-s" spellcheck="false"><code>xray_windows_amd64.exe.zip</code></span><span class="md-plain">（64 位系统）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">操作：下载后解压到本地目录（如</span><span class="md-pair-s" spellcheck="false"><code>D:\xray</code></span><span class="md-plain">），解压后包含</span><span class="md-pair-s" spellcheck="false"><code>xray_windows_amd64.exe</code></span><span class="md-plain">及配置文件（</span><span class="md-pair-s" spellcheck="false"><code>xray.yaml</code></span><span class="md-plain">等）。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">2. 生成证书</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">环境：需在 PowerShell 中操作</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">步骤：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">打开 PowerShell，进入 Xray 解压目录（如</span><span class="md-pair-s" spellcheck="false"><code>cd D:\xray</code></span><span class="md-plain">）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">运行命令生成证书：</span></p>



```powershell
.\xray_windows_amd64.exe genca
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">生成文件：目录下会新增</span><span class="md-pair-s" spellcheck="false"><code>ca.crt</code></span><span class="md-plain">（证书文件）和</span><span class="md-pair-s" spellcheck="false"><code>ca.key</code></span><span class="md-plain">（密钥文件）</span></p>
<p class="md-end-block md-p"></p>
</li>
</ol>
</li>
</ul>
<h3><img class="size-full wp-image-590 aligncenter" src="/wp-content/uploads/2025/img-2cfc42690930.png" alt="" width="458" height="184" /></h3>
<h3 class="md-end-block md-heading"><span class="md-plain">3. 浏览器导入证书（以 Edge 为例）</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">目的：确保 Xray 能正常监听 HTTPS 流量</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">步骤：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">打开 Edge 浏览器，进入设置：</span><span class="md-pair-s" spellcheck="false"><code>edge://certificate-manager/</code></span><span class="md-plain"> → 找到 “管理证书”</span></p>
<p class="md-end-block md-p"></p>

<img class="alignnone size-full wp-image-591" src="/wp-content/uploads/2025/img-78d15aa87001.png" alt="" width="942" height="857" /></li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">点击 “导入”，启动 “证书导入向导”，选择解压目录中的</span><span class="md-pair-s" spellcheck="false"><code>ca.crt</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">选择证书存储：点击 “浏览” → 选择 “受信任的根证书颁发机构” → 确定</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">完成导入，关闭向导。</span></p>
</li>
</ol>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">4. 配置浏览器代理（以 Edge 为例）</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">工具：需安装扩展</span><span class="md-pair-s" spellcheck="false"><code>Proxy SwitchyOmega</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">步骤：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">安装扩展：Edge 商店搜索 “Proxy SwitchyOmega” 并添加</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">配置代理：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">新建情景模式（如命名 “xray”）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">代理服务器设置：协议 “HTTP”，服务器 “127.0.0.1”，端口 “7777”（避免使用常用端口）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">不代理地址列表：添加</span><span class="md-pair-s" spellcheck="false"><code>127.0.0.1</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>localhost</code></span><span class="md-plain">等本地地址</span></p>
</li>
</ul>
</li>
</ol>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">三、Xray 使用步骤</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">1. 启动 Xray</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">打开命令行（PowerShell 或 CMD），进入 Xray 解压目录，运行命令：</span></p>



```powershell
.\xray_windows_amd64.exe webscan --listen 127.0.0.1:7777 --html-output output.html
```


<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">说明：</span><span class="md-pair-s" spellcheck="false"><code>--listen</code></span><span class="md-plain">指定监听代理端口（需与浏览器代理端口一致）；</span><span class="md-pair-s" spellcheck="false"><code>--html-output</code></span><span class="md-plain">指定扫描结果保存路径（如</span><span class="md-pair-s" spellcheck="false"><code>test.html</code></span><span class="md-plain">）</span></p>
<p class="md-end-block md-p"></p>

<img class="alignnone size-full wp-image-592" src="/wp-content/uploads/2025/img-8b9cbbb582af.png" alt="" width="1707" height="780" /></li>
</ul>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">2. 开始扫描</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">浏览器切换到 “xray” 代理模式（通过 SwitchyOmega 切换）</span></p>
<p class="md-end-block md-p"></p>

<img class="size-full wp-image-593 aligncenter" src="/wp-content/uploads/2025/img-4c4bd391ab92.png" alt="" width="250" height="618" /></li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">访问目标网址，正常浏览网页（点击链接、提交表单等），Xray 会自动监听并扫描漏洞</span></p>
<p class="md-end-block md-p"></p>

<img class="alignnone size-full wp-image-594" src="/wp-content/uploads/2025/img-fbe3ee44d830.png" alt="" width="1653" height="720" /></li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">扫描结果实时记录到</span><span class="md-pair-s" spellcheck="false"><code>test.html</code></span><span class="md-plain">，可直接浏览器打开查看详细漏洞信息</span></p>
<p class="md-end-block md-p md-focus"><img class="alignnone size-full wp-image-595" src="/wp-content/uploads/2025/img-e4103747f861.png" alt="" width="1677" height="444" /></p>
</li>
</ul>
