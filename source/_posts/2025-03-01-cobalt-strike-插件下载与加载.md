---
title: "Cobalt Strike 插件下载与加载"
date: "2025-03-01 18:33:35"
updated: "2026-05-30 19:27:26"
categories: ["文章", "工具资源"]
tags: ["CobaltStrike", "CS 插件"]
thumbnail: "/wp-content/uploads/2025/img-52a861317814.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "565"
---
Cobalt Strike（简称 CS）作为内网渗透的利器，其插件生态极大扩展了功能边界。无论是信息收集、权限维持还是横向移动，合适的插件都能让操作效率翻倍。本文整理了 5 款常用插件的下载地址，以及客户端、服务端的加载方法，帮助新手快速上手。
<h2 class="md-end-block md-heading md-focus"><span class="md-plain md-expand">一、插件下载</span></h2>
<p class="md-end-block md-p"><span class="md-plain">首先需获取插件的</span><span class="md-pair-s" spellcheck="false"><code>.cna</code></span><span class="md-plain">格式文件，常用插件下载地址及文件信息如下：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">Ladon</span></strong></span><span class="md-plain">：下载地址 </span><span class="md-link md-pair-s" spellcheck="false"><a href="https://github.com/k8gege/Ladon">https://github.com/k8gege/Ladon</a></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">LSTAR</span></strong></span><span class="md-plain">：下载地址 </span><span class="md-link md-pair-s" spellcheck="false"><a href="https://github.com/lintstar/LSTAR">https://github.com/lintstar/LSTAR</a></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">OLa</span></strong></span><span class="md-plain">：下载地址 </span><span class="md-link md-pair-s" spellcheck="false"><a href="https://github.com/d3ckx1/OLa">https://github.com/d3ckx1/OLa</a></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">TaoWu（梼杌）</span></strong></span><span class="md-plain">：下载地址 </span><span class="md-link md-pair-s" spellcheck="false"><a href="https://github.com/pandasec888/taowu-cobalt_strike">https://github.com/pandasec888/taowu-cobalt_strike</a></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">XieGongZi</span></strong></span><span class="md-plain">：下载地址 </span><span class="md-link md-pair-s" spellcheck="false"><a href="https://mp.weixin.qq.com/s/9xK1itaFayyVh4lMxiKcMg">https://mp.weixin.qq.com/s/9xK1itaFayyVh4lMxiKcMg</a></span></p>
</li>
 	<li><span class="md-pair-s "><strong><span class="md-plain">ElevateKit</span></strong></span><span class="md-plain">：下载地址 </span><span class="md-link md-pair-s" spellcheck="false"><a href="https://github.com/rsmudge/ElevateKit">https://github.com/rsmudge/ElevateKit</a></span></li>
</ul>
<h2 class="md-end-block md-heading md-focus"><span class="md-plain">二、客户端加载</span></h2>
<p class="md-end-block md-p"><span class="md-plain">客户端加载适用于临时测试，插件仅在客户端连接服务端时生效，断开连接后失效。</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">打开 Cobalt Strike 客户端，进入菜单栏「CobaltStrike」→「Script Manager」，打开脚本管理器；</span></p>
<img class="alignnone size-full wp-image-566" src="/wp-content/uploads/2025/img-bd1851a5c9a7.png" alt="" width="1170" height="619" /></li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">在脚本管理器中点击「Load」按钮，浏览并选择本地的插件</span><span class="md-pair-s" spellcheck="false"><code>.cna</code></span><span class="md-plain">文件（如</span><span class="md-pair-s" spellcheck="false"><code>Ladon.cna</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>LSTAR.cna</code></span><span class="md-plain">等）；</span></p>
<img class="alignnone size-full wp-image-567" src="/wp-content/uploads/2025/img-8d57e0f29456.png" alt="" width="1579" height="548" /></li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">加载成功后，在 CS 的会话界面（Session）会显示新增的插件菜单，直接点击即可使用插件功能。</span></p>
<img class="alignnone size-full wp-image-568" src="/wp-content/uploads/2025/img-8a3ef27f15d1.png" alt="" width="1561" height="1038" /></li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">三、服务端加载</span></h2>
<p class="md-end-block md-p"><span class="md-plain">服务端加载适用于需要长期生效的插件（如团队协作场景），插件在服务器端持续运行，不受客户端连接状态影响。</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">登录 CS 服务器，找到安装目录中的 </span><span class="md-pair-s" spellcheck="false"><code>agscript</code></span><span class="md-plain"> 工具（用于在服务端运行插件）；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">赋予</span><span class="md-pair-s" spellcheck="false"><code>agscript</code></span><span class="md-plain">执行权限：</span></p>



```bash
chmod +x agscript
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">通过</span><span class="md-pair-s" spellcheck="false"><code>agscript</code></span><span class="md-plain">后台加载插件，命令格式为：</span></p>



```bash
nohup ./agscript [CS服务器IP] [端口] [任意用户名] [密码] [插件.cNA]
```


</li>
</ol>
