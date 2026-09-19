# 吳鑽 (Wuzuan) 個人網站

這是一個基於 Node.js 和 Express 的個人網站專案。

## 安裝與執行

### 前置需求
- [Node.js](https://nodejs.org/) (建議 v16 或以上)

### 1. 下載專案
將專案下載或是 Clone 到本地端：
```bash
git clone https://github.com/wu-zuan/wuzuantw.com.git
cd wuzuantw.com
```

### 2. 安裝依賴
執行以下指令安裝所需套件：
```bash
npm install
```

### 3. 啟動伺服器
**開發模式 (檔案變更時自動重啟)：**
```bash
npm run dev
```

**正式運行：**
```bash
npm start
```

伺服器預設會在 `http://localhost:3001` 運行。

### 4. 進階部署 (PM2)
在生產環境中，建議使用 PM2 來管理 Node.js 程序，確保網站穩定運行。

**安裝 PM2：**
```bash
npm install -g pm2
```

**啟動服務：**
```bash
pm2 start server.js --name "wuzuantw.com"
```

**常用指令：**
- 查看狀態：`pm2 status`
- 重啟服務：`pm2 restart wuzuantw.com`
- 停止服務：`pm2 stop wuzuantw.com`
- 查看日誌：`pm2 logs wuzuantw.com`
- 開機自啟：`pm2 startup` && `pm2 save`

## 雲端部署 (Cloudflare)

由於本專案主要是由靜態網頁（EJS 模板）與靜態資源組成，您可以使用專案內附的編譯腳本將其編譯為純靜態網站，並部署在 **Cloudflare Pages**。這可以為您節省伺服器成本，並享受 Cloudflare 全球 Edge CDN 的極速加載與 100% 的在線率。

### 方式 A：使用 Cloudflare Pages (推薦，全自動)

這是最推薦且最方便的部署方式。每次您推送代碼到 GitHub，Cloudflare 就會自動完成編譯並部署。

#### 1. 設置 Cloudflare Pages 專案
1. 登入 [Cloudflare 儀表板](https://dash.cloudflare.com/)。
2. 進入 **Workers & Pages** -> 點擊 **Create Application**。
3. 選擇 **Pages** 標籤頁，然後點擊 **Connect to Git**。
4. 選擇您的 GitHub 帳號並關聯此專案的 Repository。

#### 2. 配置建置設定 (Build settings)
在配置頁面中，進行以下設定：
- **Framework preset (框架預設)**: 選擇 `None`
- **Build command (建置指令)**: `npm run build`
- **Build output directory (建置輸出目錄)**: `dist`

#### 3. 部署
- 點擊 **Save and Deploy** 即可完成！
- 由於編譯腳本會自動將 `/project/pterodactyl-bot` 輸出為 `project/pterodactyl-bot/index.html`，Cloudflare Pages 會自動啟用 **Clean URLs (乾淨網址)**，您的路由與網址結構將與本地 Express 模式 100% 保持一致！

---

### 方式 B：使用 Wrangler CLI 手動部署 (Pages)

如果您希望從本地電腦直接部署，不綁定 Git，可以使用 Cloudflare CLI 工具 `wrangler`。

#### 1. 本地編譯網站
在本地執行以下指令編譯出 `dist` 資料夾：
```bash
npm run build
```

#### 2. 使用 Wrangler 登入與部署
確保您已安裝 Node.js，接著在終端機執行：
```bash
# 登入您的 Cloudflare 帳號
npx wrangler login

# 部署靜態資料夾到 Cloudflare Pages
npx wrangler pages deploy dist
```
*依照提示選擇建立新專案，並設定您的專案名稱即可部署完成。*

---

### 關於 Cloudflare Workers
如果您確實需要使用 **Cloudflare Workers** 進行更多動態邏輯（例如動態 API 或邊緣運算），您可以使用 Cloudflare Pages 內建的 **Functions**（基於 Workers 技術），或者在 `dist` 編譯完成後配合 `wrangler` 自訂您的 Worker 邏輯。對於一般展示型個人網站，**Cloudflare Pages** 是最完美且最省成本的方案。

## 專案結構
- `server.js`: 伺服器入口檔案
- `views/`: EJS 模板檔案 (HTML 結構)
  - `index.ejs`: 首頁
- `public/`: 靜態檔案 (CSS, JS, 圖片)
  - `css/`: 樣式表
  - `js/`: 前端腳本
  - `images/`: 圖片資源

## 自定義修改
- **修改內容**：編輯 `views/index.ejs`
- **修改樣式**：編輯 `public/css/style.css`
- **新增友站**：在 `index.ejs` 的 `#friends` 區塊新增 `<a>` 標籤

## Nginx 設定
詳細的 Nginx 反向代理與 SSL 設定教學，請參考 [NGINX_SETUP.md](./NGINX_SETUP.md)。