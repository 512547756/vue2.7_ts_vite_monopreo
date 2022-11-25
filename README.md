# vue2.7_ts_vite_monopreo
vue2.7版本的monorepo结构项目

需要使用pnpm管理此monorepo项目

 ## Project setup
```
pnpm install
```

### 启用demo
```
pnpm dev:demo1
```


### demo1 build
```
pnpm build:demo1
```
### 安装全局依赖
```
pnpm i xxx -wD
```

### 安装对应包的依赖
```
pnpm i xxx -F 包名
```

### 删除依赖
```
pnpm remove xxx -wD  
pnpm remove xxx -F 包名
```
### 包的项目关联
```
pnpm i 包名 -F 包名

```

