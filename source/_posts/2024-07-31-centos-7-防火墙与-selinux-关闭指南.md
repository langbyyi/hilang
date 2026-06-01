---
title: "CentOS 7 防火墙与 SELinux 关闭指南"
date: "2024-07-31 19:17:34"
updated: "2026-05-30 19:31:38"
categories: ["文章", "学习笔记"]
tags: ["CentOS7", "firewalld", "SELinux", "防火墙"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "585"
---
在 CentOS 7 系统中，防火墙（firewalld）和 SELinux 是重要的安全组件。在测试环境或特定场景下，可能需要临时或永久关闭它们以简化操作。以下是具体步骤：
<h4 class="md-end-block md-heading"><span class="md-plain">一、关闭防火墙</span></h4>
<p class="md-end-block md-p"><span class="md-plain">防火墙（firewalld）的关闭分为临时关闭（重启后恢复）和永久关闭（开机不自动启动），操作如下：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">查看防火墙状态</span></strong></span></p>



```bash
systemctl status firewalld
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">临时关闭防火墙</span></strong></span> <span class="md-plain">仅当前生效，重启服务器后防火墙会自动启动：</span></p>



```bash
systemctl stop firewalld
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">永久关闭防火墙</span></strong></span> <span class="md-plain">禁用开机自启，需重启服务器后生效：</span></p>



```bash
systemctl disable firewalld
```


</li>
</ol>
<h4 class="md-end-block md-heading"><span class="md-plain">二、关闭 SELinux</span></h4>
<p class="md-end-block md-p"><span class="md-plain">SELinux（安全增强型 Linux）是系统安全机制，关闭同样分临时和永久方式：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">查看 SELinux 状态</span></strong></span></p>



```bash
getenforce
```


<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">输出 </span><span class="md-pair-s" spellcheck="false"><code>Enforcing</code></span><span class="md-plain">：表示 SELinux 已启动（强制模式）；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">输出 </span><span class="md-pair-s" spellcheck="false"><code>Permissive</code></span><span class="md-plain">：表示处于宽容模式（仅记录不拦截，临时关闭状态）。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">临时关闭 SELinux</span></strong></span> <span class="md-plain">立即生效，重启服务器后恢复默认状态：</span></p>



```bash
setenforce 0  # 0表示临时关闭，1表示启用
```


<p class="md-end-block md-p"><span class="md-plain">执行后再次查看状态，会显示 </span><span class="md-pair-s" spellcheck="false"><code>Permissive</code></span><span class="md-plain">。</span></p>
</li>
</ol>
<h4 class="md-end-block md-heading"><span class="md-plain">说明</span></h4>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">临时关闭适用于临时测试场景，无需重启系统；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">永久关闭防火墙需重启服务器生效，SELinux 的永久关闭需修改配置文件（可设置 </span><span class="md-pair-s" spellcheck="false"><code>/etc/selinux/config</code></span><span class="md-plain"> 中 </span><span class="md-pair-s" spellcheck="false"><code>SELINUX=disabled</code></span><span class="md-plain"> 并重启）。</span></p>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-plain md-expand">操作需谨慎，关闭安全机制可能降低系统安全性，仅建议在测试环境使用。</span></p>
</li>
</ul>
