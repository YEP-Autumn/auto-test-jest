# Local Setup

## Ignore local changes to tracked files

执行以下命令，使本地对 `test/demo.test.ts` 的改动不被 git 跟踪，同时保留远端仓库中的文件供其他人使用：

```bash
git update-index --skip-worktree test/demo.test.ts
```
