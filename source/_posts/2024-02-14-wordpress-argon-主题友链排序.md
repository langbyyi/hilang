---
title: "WordPress Argon 主题友链排序"
date: "2024-02-14 20:04:44"
updated: "2026-05-30 19:32:39"
categories: ["文章", "工具资源"]
tags: ["Argon"]
thumbnail: "/wp-content/uploads/2024/img-ecee81fb7bd7.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "825"
---
<h2 class="header-vfC6AV auto-hide-last-sibling-br">背景</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">友链默认按 ID 排序（中文首个字母顺序），可能对早期加入的友链不公平，建议按添加时间或评级排序。Argon 主题从 WordPress 链接管理器读取友链。</div>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">简码参数说明</h2>
<ul class="auto-hide-last-sibling-br">
 	<li><strong>style</strong>：控制友链列表样式，可选值为 1、1-square、2、2-big，默认值 1，非必须参数。</li>
 	<li><strong>sort</strong>：决定友链排序规则，可选按 ID、链接、名称、添加用户、评分、可见度、长度排序，也可随机排序，默认按 ID 排序，非必须参数。</li>
 	<li><strong>order</strong>：设置排序方式，升序（ASC）或降序（DESC），默认升序，非必须参数。</li>
</ul>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">示例</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">若按评级降序排序，使用简码：</div>
<div></div>
<div>


```
<em style="font-family: Consolas, Monaco, monospace;">[f riendlinks sort="rating" order="DESC"/]</em>
```


</div>
<div><img class="alignnone wp-image-832 size-large" src="/wp-content/uploads/2024/img-ecee81fb7bd7.png" alt="" width="940" height="1024" /></div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">评级范围 0-10，降序时评级高的友链靠前，若想让某友链在最前面，可设评级为 10。</div>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">参考</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">Argon 是从 WordPress 的链接管理器中读取友链的，更多详细内容可以参考 Argon 官方文档（<a class="link-ZNPgAX" href="https://argon-docs.solstice23.top/#/shortcode/friendlinks" target="_blank" rel="noopener">https://argon-docs.solstice23.top/#/shortcode/friendlinks</a>）</div>
