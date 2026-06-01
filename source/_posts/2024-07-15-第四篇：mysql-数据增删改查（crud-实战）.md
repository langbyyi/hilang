---
title: "第四篇：MySQL 数据增删改查（CRUD 实战）"
date: "2024-07-15 08:47:40"
updated: "2026-05-30 19:32:07"
categories: ["文章", "学习笔记"]
tags: ["MySQL"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "328"
---
<h2 class="wp-block-heading">插入数据（INSERT）</h2>



<h3 class="wp-block-heading">语法</h3>





```
<code>INSERT INTO 表名 (字段1, 字段2, ...) VALUES (值1, 值2, ...);
</code>
```





<h3 class="wp-block-heading">示例</h3>



<p>向<code>users</code>表插入一条用户数据：</p>





```
<code>INSERT INTO users (username, email, age) 
VALUES (&#039;jack&#039;, &#039;jack@example.com&#039;, 25);
</code>
```





<h3 class="wp-block-heading">注意</h3>



<p>字段顺序需与值顺序一一对应；字符串和日期值需用单引号包裹；若省略字段列表，则需按表中所有字段顺序插入值（不推荐，易出错）。</p>



<h2 class="wp-block-heading">删除数据（DELETE）</h2>



<h3 class="wp-block-heading">语法</h3>





```
<code>DELETE FROM 表名 WHERE 条件;
</code>
```





<h3 class="wp-block-heading">示例</h3>



<p>删除<code>username</code>为<code>jack</code>的记录：</p>





```
<code>DELETE FROM users WHERE username = &#039;jack&#039;;
</code>
```





<h3 class="wp-block-heading">警告</h3>



<p>若<strong>省略<code>WHERE</code>条件</strong>，会删除表中<strong>所有数据</strong>（表结构保留），例如：</p>





```
<code>DELETE FROM users;  -- 危险！会清空表数据
</code>
```





<p><code>DROP TABLE 表名;</code>会直接删除表结构和所有数据，需格外谨慎。</p>



<h2 class="wp-block-heading">更新数据（UPDATE）</h2>



<h3 class="wp-block-heading">语法</h3>





```
<code>UPDATE 表名 SET 字段1 = 值1, 字段2 = 值2, ... WHERE 条件;
</code>
```





<h3 class="wp-block-heading">示例</h3>



<p>将<code>jack</code>的邮箱更新为新地址：</p>





```
<code>UPDATE users 
SET email = &#039;jack_new@example.com&#039; 
WHERE username = &#039;jack&#039;;
</code>
```





<h3 class="wp-block-heading">警告</h3>



<p>若<strong>省略<code>WHERE</code>条件</strong>，会<strong>更新表中所有记录</strong>，例如：</p>





```
<code>UPDATE users SET age = 18;  -- 危险！所有用户年龄都会改为18
</code>
```





<h2 class="wp-block-heading">查询数据（SELECT）</h2>



<h3 class="wp-block-heading">基础查询</h3>



<ul class="wp-block-list">
<li>查询表中所有字段和数据：</li>
</ul>





```
<code>SELECT * FROM 表名;
-- 示例：查询users表所有数据
SELECT * FROM users;
</code>
```





<ul class="wp-block-list">
<li>查询指定字段：</li>
</ul>





```
<code>SELECT 字段1, 字段2 FROM 表名;
-- 示例：查询用户名和年龄
SELECT username, age FROM users;
</code>
```





<ul class="wp-block-list">
<li>带条件查询：</li>
</ul>





```
<code>SELECT 字段 FROM 表名 WHERE 条件;
-- 示例：查询年龄≥18的用户
SELECT username, age FROM users WHERE age &gt;= 18;</code>
```
