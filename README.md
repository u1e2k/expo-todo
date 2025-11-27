# Expo Todo App

要件定義書に基づいて作成されたTodoアプリです。

## 機能

### 必須機能 (Core Features)
- ✅ FR-01: タスクの追加
- ✅ FR-02: タスクの表示
- ✅ FR-03: タスクの完了/未完了切り替え
- ✅ FR-04: タスクの編集
- ✅ FR-05: タスクの削除
- ✅ FR-06: 状態のフィルタリング(すべて/未完了/完了済み)
- ✅ FR-07: データ永続化 (AsyncStorage)

## 技術スタック

- **フレームワーク**: React Native, Expo
- **状態管理**: React Context
- **データ永続化**: AsyncStorage
- **ナビゲーション**: React Navigation

## プロジェクト構成

```
expo-todo/
├── src/
│   ├── components/       # UIコンポーネント
│   │   ├── FilterButtons.tsx
│   │   ├── TaskItem.tsx
│   │   └── TaskList.tsx
│   ├── context/          # 状態管理
│   │   └── TaskContext.tsx
│   ├── navigation/       # ナビゲーション設定
│   │   └── index.tsx
│   ├── screens/          # 画面コンポーネント
│   │   ├── HomeScreen.tsx
│   │   └── TaskFormScreen.tsx
│   ├── types/            # 型定義
│   │   └── Task.ts
│   └── utils/            # ユーティリティ
│       └── storage.ts
├── App.tsx               # エントリーポイント
├── app.json
├── package.json
└── babel.config.js
```

## セットアップ

1. 依存パッケージのインストール:
```bash
npm install
```

2. アプリの起動:
```bash
npm start
```

3. デバイスでの実行:
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## 使い方

1. **タスクの追加**: 右下の「+」ボタンをタップ
2. **タスクの完了**: チェックボックスをタップ
3. **タスクの編集**: タスクをタップ
4. **タスクの削除**: 「削除」ボタンをタップ
5. **フィルタリング**: 上部のフィルターボタンで表示を切り替え

## データ構造

```typescript
interface Task {
  id: string;           // 一意の識別子
  title: string;        // タスク名
  detail: string;       // 詳細情報
  isCompleted: boolean; // 完了状態
  createdAt: string;    // 作成日時
  dueDate?: string;     // 期限日(将来の拡張用)
}
```