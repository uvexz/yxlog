---
title: "一些 Git 命令"
description: "初始化一个新的 git 仓库"
pubDate: 2022-10-28
updatedDate: 2025-12-16
tags: ["Notes"]
---

初始化一个新的 git 仓库

```
git init
```

为 Git 全局配置默认名称及邮箱

```
git config --global user.name <your-name>
git config --global user.email <your-email>
```

**克隆一个仓库**

```
git clone <repository-url>
```

加一个文件到暂存区:

```
git add <file>
```

**将所有文件添加到暂存区**

```
git add.
```

检查未暂存的更改

```
git diff
```

**提交暂存区的更改**

```
git commit -m "Message"
```

将暂存区重置为最后一次提交

```
git reset
```

检查工作目录和暂存区的状态

```
git status
```

从索引和工作目录中删除文件

```
git rm <file>
```

列出提交历史

```
git log
```

检查提交的元数据和内容更改

```
git show <commit-hash>
```

列出所有本地分支

```
git branch
```

创建一个新分支

```
git branch <branch-name>
```

重命名当前分支

```
git branch -m <new-branch-name>
```

删除一个分支

```
git branch -d <branch-name>
```

切换到另一个分支

```
git checkout <branch-name>
```

合并指定分支到当前分支

```
git merge <branch-name>
```

**添加远程仓库**

```
git remote add <name> <repository-url>
```

**将提交的更改推送到远程存储库**

```
git push <remote> <branch>
```

**从远程存储库下载内容**

```
git pull <remote>
```

清理不必要的文件并优化本地存储库

```
git gc
```

临时删除未提交的更改并保存以供以后使用

```
git stash
```

重新应用以前隐藏的更改

```
git stash apply
```
