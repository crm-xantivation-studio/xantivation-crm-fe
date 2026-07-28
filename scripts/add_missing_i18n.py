#!/usr/bin/env python3
"""
Add missing i18n keys to all 4 translation files with proper translations.
Uses code context to determine appropriate text for each language.
"""
import json, os, re
from collections import OrderedDict, defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES_DIR = os.path.join(BASE_DIR, 'src', 'locales')

# Load existing translations
def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

en_data = load_json(os.path.join(LOCALES_DIR, 'en', 'translation.json'))
vi_data = load_json(os.path.join(LOCALES_DIR, 'vi', 'translation.json'))
ja_data = load_json(os.path.join(LOCALES_DIR, 'ja', 'translation.json'))
zh_data = load_json(os.path.join(LOCALES_DIR, 'zh', 'translation.json'))

# Get all existing keys from EN
def get_all_keys(obj, prefix=''):
    keys = set()
    for k, v in obj.items():
        path = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.update(get_all_keys(v, path))
        else:
            keys.add(path)
    return keys

en_keys = get_all_keys(en_data)

# ============================================================
# TRANSLATION MAP: key -> {en, vi, ja, zh}
# ============================================================
# Based on actual usage context extracted from source code
# Organized by namespace

translations = {
    # ===================== aiHub =====================
    # UI labels for the AI Hub page
    "aiHub.title": {
        "en": "AI Hub",
        "vi": "AI Hub",
        "ja": "AI Hub",
        "zh": "AI Hub"
    },
    "aiHub.subtitle": {
        "en": "AI-powered chat, workflow monitoring, and agent management",
        "vi": "Trò chuyện AI, giám sát quy trình và quản lý tác nhân",
        "ja": "AI搭載チャット、ワークフローモニタリング、エージェント管理",
        "zh": "AI驱动的聊天、工作流监控和代理管理"
    },
    "aiHub.v3Pipeline": {
        "en": "V3 Pipeline",
        "vi": "V3 Pipeline",
        "ja": "V3 パイプライン",
        "zh": "V3 管道"
    },
    "aiHub.newChat": {
        "en": "New Chat",
        "vi": "Trò chuyện mới",
        "ja": "新しいチャット",
        "zh": "新聊天"
    },
    "aiHub.chatHistory": {
        "en": "Chat History",
        "vi": "Lịch sử trò chuyện",
        "ja": "チャット履歴",
        "zh": "聊天历史"
    },
    "aiHub.searchChats": {
        "en": "Search chats...",
        "vi": "Tìm kiếm cuộc trò chuyện...",
        "ja": "チャットを検索...",
        "zh": "搜索聊天..."
    },
    "aiHub.allAgents": {
        "en": "All Agents",
        "vi": "Tất cả tác nhân",
        "ja": "すべてのエージェント",
        "zh": "所有代理"
    },
    "aiHub.filterAssistant": {
        "en": "Assistant",
        "vi": "Trợ lý",
        "ja": "アシスタント",
        "zh": "助手"
    },
    "aiHub.filterDeerflow": {
        "en": "Deerflow",
        "vi": "Deerflow",
        "ja": "Deerflow",
        "zh": "Deerflow"
    },
    "aiHub.filterHermes": {
        "en": "Hermes",
        "vi": "Hermes",
        "ja": "Hermes",
        "zh": "Hermes"
    },
    "aiHub.pinned": {
        "en": "Pinned",
        "vi": "Đã ghim",
        "ja": "ピン留め",
        "zh": "已固定"
    },
    "aiHub.recentChats": {
        "en": "Recent Chats",
        "vi": "Trò chuyện gần đây",
        "ja": "最近のチャット",
        "zh": "最近的聊天"
    },
    "aiHub.noConversations": {
        "en": "No conversations yet. Start a new chat!",
        "vi": "Chưa có cuộc trò chuyện nào. Hãy bắt đầu một cuộc trò chuyện mới!",
        "ja": "まだ会話がありません。新しいチャットを始めましょう！",
        "zh": "尚无对话。开始一个新聊天吧！"
    },
    "aiHub.autoMode": {
        "en": "Auto Mode",
        "vi": "Chế độ tự động",
        "ja": "自動モード",
        "zh": "自动模式"
    },
    "aiHub.autoRouteTitle": {
        "en": "Auto-Route to best-fit agent",
        "vi": "Tự động định tuyến đến tác nhân phù hợp nhất",
        "ja": "最適なエージェントに自動ルーティング",
        "zh": "自动路由到最适合的代理"
    },
    "aiHub.activeRouting": {
        "en": "Active: {name}",
        "vi": "Đang hoạt động: {name}",
        "ja": "アクティブ: {name}",
        "zh": "活跃: {name}"
    },
    "aiHub.sseConnection": {
        "en": "SSE Connection Active",
        "vi": "Kết nối SSE đang hoạt động",
        "ja": "SSE接続アクティブ",
        "zh": "SSE连接活跃"
    },
    "aiHub.you": {
        "en": "You",
        "vi": "Bạn",
        "ja": "あなた",
        "zh": "您"
    },
    "aiHub.streaming": {
        "en": "Streaming...",
        "vi": "Đang truyền dữ liệu...",
        "ja": "ストリーミング中...",
        "zh": "流式传输中..."
    },
    "aiHub.slashCommands": {
        "en": "Slash Commands",
        "vi": "Lệnh gạch chéo",
        "ja": "スラッシュコマンド",
        "zh": "斜杠命令"
    },
    "aiHub.referenceCrmEntities": {
        "en": "Reference CRM Entities",
        "vi": "Tham chiếu thực thể CRM",
        "ja": "CRMエンティティを参照",
        "zh": "引用CRM实体"
    },
    "aiHub.inputPlaceholder": {
        "en": "Message {name}...",
        "vi": "Nhắn tin {name}...",
        "ja": "{name}にメッセージ...",
        "zh": "给{name}发消息..."
    },
    "aiHub.attachDocument": {
        "en": "Attach Document",
        "vi": "Đính kèm tài liệu",
        "ja": "ドキュメントを添付",
        "zh": "附加文档"
    },
    "aiHub.tabContext": {
        "en": "Context",
        "vi": "Ngữ cảnh",
        "ja": "コンテキスト",
        "zh": "上下文"
    },
    "aiHub.tabExec": {
        "en": "Execution",
        "vi": "Thực thi",
        "ja": "実行",
        "zh": "执行"
    },
    "aiHub.tabTools": {
        "en": "Tools",
        "vi": "Công cụ",
        "ja": "ツール",
        "zh": "工具"
    },
    "aiHub.tabRag": {
        "en": "Knowledge Base",
        "vi": "Kiến thức",
        "ja": "知識ベース",
        "zh": "知识库"
    },
    "aiHub.tabMemory": {
        "en": "Memory",
        "vi": "Bộ nhớ",
        "ja": "メモリ",
        "zh": "记忆"
    },
    "aiHub.activeBusinessContext": {
        "en": "Active Business Context",
        "vi": "Ngữ cảnh kinh doanh đang hoạt động",
        "ja": "アクティブなビジネスコンテキスト",
        "zh": "活跃的业务上下文"
    },
    "aiHub.detected": {
        "en": "Detected",
        "vi": "Đã phát hiện",
        "ja": "検出済み",
        "zh": "已检测"
    },
    "aiHub.accountContext": {
        "en": "Account Context",
        "vi": "Ngữ cảnh tài khoản",
        "ja": "アカウントコンテキスト",
        "zh": "账户上下文"
    },
    "aiHub.clientInfo": {
        "en": "Client {taxCode}",
        "vi": "Khách hàng {taxCode}",
        "ja": "クライアント {taxCode}",
        "zh": "客户 {taxCode}"
    },
    "aiHub.viewAccount": {
        "en": "View Account",
        "vi": "Xem tài khoản",
        "ja": "アカウントを表示",
        "zh": "查看账户"
    },
    "aiHub.linkedDealScore": {
        "en": "Linked Deal Score",
        "vi": "Điểm giao dịch liên kết",
        "ja": "リンクされた案件スコア",
        "zh": "关联交易评分"
    },
    "aiHub.bantStatus": {
        "en": "BANT Status",
        "vi": "Trạng thái BANT",
        "ja": "BANTステータス",
        "zh": "BANT状态"
    },
    "aiHub.percentQualified": {
        "en": "75% Qualified",
        "vi": "Đủ điều kiện 75%",
        "ja": "75% 適格",
        "zh": "75% 合格"
    },
    "aiHub.agentWorkflowSteps": {
        "en": "Agent Workflow Steps",
        "vi": "Các bước quy trình tác nhân",
        "ja": "エージェントワークフローステップ",
        "zh": "代理工作流步骤"
    },
    "aiHub.stepReceive": {
        "en": "Receive",
        "vi": "Tiếp nhận",
        "ja": "受信",
        "zh": "接收"
    },
    "aiHub.stepPlanning": {
        "en": "Planning",
        "vi": "Lập kế hoạch",
        "ja": "計画",
        "zh": "规划"
    },
    "aiHub.stepSearchDb": {
        "en": "Search DB",
        "vi": "Tìm kiếm CSDL",
        "ja": "DB検索",
        "zh": "搜索数据库"
    },
    "aiHub.stepExecuteSql": {
        "en": "Execute SQL",
        "vi": "Thực thi SQL",
        "ja": "SQL実行",
        "zh": "执行SQL"
    },
    "aiHub.stepInvokeGroq": {
        "en": "Invoke Groq",
        "vi": "Gọi Groq",
        "ja": "Groq呼び出し",
        "zh": "调用Groq"
    },
    "aiHub.stepSidecar": {
        "en": "Sidecar",
        "vi": "Sidecar",
        "ja": "サイドカー",
        "zh": "Sidecar"
    },
    "aiHub.stepFormat": {
        "en": "Format",
        "vi": "Định dạng",
        "ja": "フォーマット",
        "zh": "格式化"
    },
    "aiHub.stepFinalize": {
        "en": "Finalize",
        "vi": "Hoàn tất",
        "ja": "最終化",
        "zh": "完成"
    },
    "aiHub.stepDescParser": {
        "en": "Parse and validate user input",
        "vi": "Phân tích và xác thực đầu vào người dùng",
        "ja": "ユーザー入力を解析・検証",
        "zh": "解析和验证用户输入"
    },
    "aiHub.stepDescAssign": {
        "en": "Assign task to best agent",
        "vi": "Gán tác vụ cho tác nhân phù hợp nhất",
        "ja": "最適なエージェントにタスクを割り当て",
        "zh": "将任务分配给最佳代理"
    },
    "aiHub.stepDescQuery": {
        "en": "Query relevant data sources",
        "vi": "Truy vấn nguồn dữ liệu liên quan",
        "ja": "関連データソースをクエリ",
        "zh": "查询相关数据源"
    },
    "aiHub.stepDescRetrieve": {
        "en": "Retrieve matching records",
        "vi": "Truy xuất các bản ghi phù hợp",
        "ja": "一致するレコードを取得",
        "zh": "检索匹配的记录"
    },
    "aiHub.stepDescInference": {
        "en": "Run AI inference on data",
        "vi": "Chạy suy luận AI trên dữ liệu",
        "ja": "データに対してAI推論を実行",
        "zh": "对数据运行AI推理"
    },
    "aiHub.stepDescWeights": {
        "en": "Calculate weighted scores",
        "vi": "Tính điểm trọng số",
        "ja": "加重スコアを計算",
        "zh": "计算加权分数"
    },
    "aiHub.stepDescTables": {
        "en": "Format output into tables",
        "vi": "Định dạng đầu ra thành bảng",
        "ja": "出力を表形式にフォーマット",
        "zh": "将输出格式化为表格"
    },
    "aiHub.stepDescDispatch": {
        "en": "Dispatch final result",
        "vi": "Phân phối kết quả cuối cùng",
        "ja": "最終結果を配信",
        "zh": "分发最终结果"
    },
    "aiHub.executedCrmTools": {
        "en": "Executed CRM Tools",
        "vi": "Công cụ CRM đã thực thi",
        "ja": "実行済みCRMツール",
        "zh": "已执行的CRM工具"
    },
    "aiHub.success": {
        "en": "Success",
        "vi": "Thành công",
        "ja": "成功",
        "zh": "成功"
    },
    "aiHub.vectorKnowledgeRag": {
        "en": "Vector Knowledge RAG",
        "vi": "RAG kiến thức vector",
        "ja": "ベクター知識RAG",
        "zh": "向量知识RAG"
    },
    "aiHub.addPdfReference": {
        "en": "Add PDF Reference",
        "vi": "Thêm tham chiếu PDF",
        "ja": "PDF参照を追加",
        "zh": "添加PDF引用"
    },
    "aiHub.ready": {
        "en": "Ready",
        "vi": "Sẵn sàng",
        "ja": "準備完了",
        "zh": "就绪"
    },
    "aiHub.agentMemoryItems": {
        "en": "Agent Memory Items",
        "vi": "Mục bộ nhớ tác nhân",
        "ja": "エージェントメモリ項目",
        "zh": "代理记忆项"
    },
    "aiHub.agentAssistant": {
        "en": "CRM Assistant",
        "vi": "Trợ lý CRM",
        "ja": "CRMアシスタント",
        "zh": "CRM助手"
    },
    "aiHub.agentDeerflow": {
        "en": "Deerflow",
        "vi": "Deerflow",
        "ja": "Deerflow",
        "zh": "Deerflow"
    },
    "aiHub.agentHermes": {
        "en": "Hermes",
        "vi": "Hermes",
        "ja": "Hermes",
        "zh": "Hermes"
    },
    "aiHub.descAssistant": {
        "en": "General CRM assistant for everyday tasks",
        "vi": "Trợ lý CRM tổng quát cho các tác vụ hàng ngày",
        "ja": "日常業務のための汎用CRMアシスタント",
        "zh": "用于日常任务的通用CRM助手"
    },
    "aiHub.descDeerflow": {
        "en": "Specialized in deal flow and pipeline management",
        "vi": "Chuyên về quản lý luồng giao dịch và pipeline",
        "ja": "案件フローとパイプライン管理に特化",
        "zh": "专注于交易流程和管道管理"
    },
    "aiHub.descHermes": {
        "en": "Real-time communications and notifications agent",
        "vi": "Tác nhân truyền thông và thông báo thời gian thực",
        "ja": "リアルタイム通信・通知エージェント",
        "zh": "实时通信和通知代理"
    },
    "aiHub.aiAgent": {
        "en": "AI Agent",
        "vi": "Tác nhân AI",
        "ja": "AIエージェント",
        "zh": "AI代理"
    },
    "aiHub.autoModeSwitched": {
        "en": "Switched to {agent} mode",
        "vi": "Đã chuyển sang chế độ {agent}",
        "ja": "{agent}モードに切り替えました",
        "zh": "已切换到{agent}模式"
    },
    "aiHub.justNow": {
        "en": "Just now",
        "vi": "Vừa xong",
        "ja": "たった今",
        "zh": "刚刚"
    },
    "aiHub.newChatTitle": {
        "en": "Chat #{count}",
        "vi": "Trò chuyện #{count}",
        "ja": "チャット #{count}",
        "zh": "聊天 #{count}"
    },
    "aiHub.newChatActiveMessage": {
        "en": "Started with {agent} agent",
        "vi": "Đã bắt đầu với tác nhân {agent}",
        "ja": "{agent}エージェントと開始",
        "zh": "已开始与{agent}代理对话"
    },
    "aiHub.newChatWelcome": {
        "en": "Hello! I'm {agentName}. How can I help you today?",
        "vi": "Xin chào! Tôi là {agentName}. Tôi có thể giúp gì cho bạn?",
        "ja": "こんにちは！{agentName}です。本日はどのようなご用件でしょうか？",
        "zh": "你好！我是{agentName}。今天我能如何帮助您？"
    },
    "aiHub.newConversationInit": {
        "en": "New conversation started!",
        "vi": "Đã bắt đầu cuộc trò chuyện mới!",
        "ja": "新しい会話を開始しました！",
        "zh": "已开始新的对话！"
    },
    "aiHub.conversationStatusUpdated": {
        "en": "Conversation status updated",
        "vi": "Đã cập nhật trạng thái cuộc trò chuyện",
        "ja": "会話ステータスを更新しました",
        "zh": "对话状态已更新"
    },
    "aiHub.atLeastOneConversation": {
        "en": "Please keep at least one conversation",
        "vi": "Vui lòng giữ lại ít nhất một cuộc trò chuyện",
        "ja": "少なくとも1つの会話を維持してください",
        "zh": "请至少保留一个对话"
    },
    "aiHub.conversationDeleted": {
        "en": "Conversation deleted",
        "vi": "Đã xóa cuộc trò chuyện",
        "ja": "会話を削除しました",
        "zh": "对话已删除"
    },
    "aiHub.scanningPdf": {
        "en": "Scanning PDF...",
        "vi": "Đang quét PDF...",
        "ja": "PDFをスキャン中...",
        "zh": "正在扫描PDF..."
    },
    "aiHub.vectorMappingSuccess": {
        "en": "Vector mapping completed successfully!",
        "vi": "Ánh xạ vector hoàn tất thành công!",
        "ja": "ベクターマッピングが完了しました！",
        "zh": "向量映射完成！"
    },
    "aiHub.workflowNotification": {
        "en": "{agent}: {status}",
        "vi": "{agent}: {status}",
        "ja": "{agent}: {status}",
        "zh": "{agent}: {status}"
    },
    "aiHub.switchedDivider": {
        "en": "Switched to {agentName}",
        "vi": "Đã chuyển sang {agentName}",
        "ja": "{agentName}に切り替えました",
        "zh": "已切换到{agentName}"
    },
    "aiHub.switchedTo": {
        "en": "Switched to {name}",
        "vi": "Đã chuyển sang {name}",
        "ja": "{name}に切り替わりました",
        "zh": "已切换到{name}"
    },
    # Dashboard keys
    "aiHub.activeIdle": {
        "en": "Active / Idle",
        "vi": "Hoạt động / Không hoạt động",
        "ja": "アクティブ / アイドル",
        "zh": "活跃 / 空闲"
    },
    "aiHub.activityTimeline": {
        "en": "Activity Timeline",
        "vi": "Dòng thời gian hoạt động",
        "ja": "アクティビティタイムライン",
        "zh": "活动时间线"
    },
    "aiHub.adminDebugSettings": {
        "en": "Admin Debug Settings",
        "vi": "Cài đặt gỡ lỗi quản trị",
        "ja": "管理者デバッグ設定",
        "zh": "管理员调试设置"
    },
    "aiHub.bullMqDescription": {
        "en": "BullMQ manages background job queues and worker processes",
        "vi": "BullMQ quản lý hàng đợi công việc nền và tiến trình worker",
        "ja": "BullMQはバックグラウンドジョブキューとワーカープロセスを管理します",
        "zh": "BullMQ管理后台作业队列和工作进程"
    },
    "aiHub.bullMqResult": {
        "en": "BullMQ Result",
        "vi": "Kết quả BullMQ",
        "ja": "BullMQ結果",
        "zh": "BullMQ结果"
    },
    "aiHub.bullMqWorkers": {
        "en": "BullMQ Workers",
        "vi": "BullMQ Workers",
        "ja": "BullMQワーカー",
        "zh": "BullMQ工作进程"
    },
    "aiHub.changeCost": {
        "en": "Cost",
        "vi": "Chi phí",
        "ja": "コスト",
        "zh": "成本"
    },
    "aiHub.changeLatency": {
        "en": "Latency",
        "vi": "Độ trễ",
        "ja": "レイテンシー",
        "zh": "延迟"
    },
    "aiHub.changeQueue": {
        "en": "Queue",
        "vi": "Hàng đợi",
        "ja": "キュー",
        "zh": "队列"
    },
    "aiHub.changeRequests": {
        "en": "Requests",
        "vi": "Yêu cầu",
        "ja": "リクエスト",
        "zh": "请求数"
    },
    "aiHub.changeSuccessRate": {
        "en": "Success Rate",
        "vi": "Tỷ lệ thành công",
        "ja": "成功率",
        "zh": "成功率"
    },
    "aiHub.changeTokens": {
        "en": "Tokens",
        "vi": "Token",
        "ja": "トークン",
        "zh": "令牌数"
    },
    "aiHub.checkWorker": {
        "en": "Check Worker",
        "vi": "Kiểm tra Worker",
        "ja": "ワーカー確認",
        "zh": "检查工作进程"
    },
    "aiHub.completed": {
        "en": "Completed",
        "vi": "Đã hoàn thành",
        "ja": "完了",
        "zh": "已完成"
    },
    "aiHub.dailyRequests": {
        "en": "Daily Requests",
        "vi": "Yêu cầu hàng ngày",
        "ja": "日次リクエスト",
        "zh": "每日请求"
    },
    "aiHub.dashboardSubtitle": {
        "en": "Real-time monitoring of AI agents, latency, and usage metrics",
        "vi": "Giám sát thời gian thực các tác nhân AI, độ trễ và chỉ số sử dụng",
        "ja": "AIエージェント、レイテンシー、使用状況メトリクスのリアルタイム監視",
        "zh": "实时监控AI代理、延迟和使用指标"
    },
    "aiHub.dashboardTitle": {
        "en": "AI Dashboard",
        "vi": "Bảng điều khiển AI",
        "ja": "AIダッシュボード",
        "zh": "AI仪表板"
    },
    "aiHub.inputTokens": {
        "en": "Input Tokens",
        "vi": "Token đầu vào",
        "ja": "入力トークン",
        "zh": "输入令牌"
    },
    "aiHub.outputTokens": {
        "en": "Output Tokens",
        "vi": "Token đầu ra",
        "ja": "出力トークン",
        "zh": "输出令牌"
    },
    "aiHub.metricAvgLatency": {
        "en": "Avg Latency",
        "vi": "Độ trễ trung bình",
        "ja": "平均レイテンシー",
        "zh": "平均延迟"
    },
    "aiHub.metricEstCost": {
        "en": "Est. Cost",
        "vi": "Chi phí ước tính",
        "ja": "推定コスト",
        "zh": "估算成本"
    },
    "aiHub.metricQueueLoad": {
        "en": "Queue Load",
        "vi": "Tải hàng đợi",
        "ja": "キュー負荷",
        "zh": "队列负载"
    },
    "aiHub.metricSuccessRate": {
        "en": "Success Rate",
        "vi": "Tỷ lệ thành công",
        "ja": "成功率",
        "zh": "成功率"
    },
    "aiHub.metricTotalRequests": {
        "en": "Total Requests",
        "vi": "Tổng yêu cầu",
        "ja": "総リクエスト数",
        "zh": "总请求数"
    },
    "aiHub.metricTotalTokens": {
        "en": "Total Tokens",
        "vi": "Tổng token",
        "ja": "総トークン数",
        "zh": "总令牌数"
    },
    "aiHub.promptUpdated": {
        "en": "Prompt updated!",
        "vi": "Đã cập nhật prompt!",
        "ja": "プロンプトを更新しました！",
        "zh": "提示已更新！"
    },
    "aiHub.reset": {
        "en": "Reset",
        "vi": "Đặt lại",
        "ja": "リセット",
        "zh": "重置"
    },
    "aiHub.savePrompt": {
        "en": "Save Prompt",
        "vi": "Lưu Prompt",
        "ja": "プロンプトを保存",
        "zh": "保存提示"
    },
    "aiHub.sectionPrompt": {
        "en": "Prompt Engineering",
        "vi": "Kỹ thuật Prompt",
        "ja": "プロンプトエンジニアリング",
        "zh": "提示工程"
    },
    "aiHub.sectionRag": {
        "en": "RAG Configuration",
        "vi": "Cấu hình RAG",
        "ja": "RAG設定",
        "zh": "RAG配置"
    },
    "aiHub.sectionToolIo": {
        "en": "Tool I/O",
        "vi": "Tool I/O",
        "ja": "ツールI/O",
        "zh": "工具输入/输出"
    },
    "aiHub.tagBullMq": {
        "en": "BullMQ",
        "vi": "BullMQ",
        "ja": "BullMQ",
        "zh": "BullMQ"
    },
    "aiHub.tagEsignature": {
        "en": "E-Signature",
        "vi": "Chữ ký điện tử",
        "ja": "電子署名",
        "zh": "电子签名"
    },
    "aiHub.tagToolExecution": {
        "en": "Tool Execution",
        "vi": "Thực thi công cụ",
        "ja": "ツール実行",
        "zh": "工具执行"
    },
    "aiHub.tagVectorRag": {
        "en": "Vector RAG",
        "vi": "Vector RAG",
        "ja": "ベクターRAG",
        "zh": "向量RAG"
    },
    "aiHub.tokenAllocation": {
        "en": "Token Allocation",
        "vi": "Phân bổ token",
        "ja": "トークン割り当て",
        "zh": "令牌分配"
    },
    "aiHub.toolTriggerFrequency": {
        "en": "Tool Trigger Frequency",
        "vi": "Tần suất kích hoạt công cụ",
        "ja": "ツールトリガー頻度",
        "zh": "工具触发频率"
    },
    "aiHub.triggeringBullMq": {
        "en": "Triggering BullMQ...",
        "vi": "Đang kích hoạt BullMQ...",
        "ja": "BullMQを起動中...",
        "zh": "正在触发BullMQ..."
    },
    "aiHub.accountContext": {
        "en": "Account Context",
        "vi": "Ngữ cảnh tài khoản",
        "ja": "アカウントコンテキスト",
        "zh": "账户上下文"
    },
    "aiHub.activeBusinessContext": {
        "en": "Active Business Context",
        "vi": "Ngữ cảnh kinh doanh đang hoạt động",
        "ja": "アクティブなビジネスコンテキスト",
        "zh": "活跃的业务上下文"
    },
    # Customers namespace
    "customers.title": {
        "en": "Customers",
        "vi": "Khách hàng",
        "ja": "顧客",
        "zh": "客户"
    },
    "customers.subtitle": {
        "en": "Manage customer accounts and contacts",
        "vi": "Quản lý tài khoản khách hàng và liên hệ",
        "ja": "顧客アカウントと連絡先を管理",
        "zh": "管理客户账户和联系人"
    },
    "customers.accounts": {
        "en": "Accounts",
        "vi": "Tài khoản",
        "ja": "アカウント",
        "zh": "账户"
    },
    "customers.contacts": {
        "en": "Contacts",
        "vi": "Liên hệ",
        "ja": "連絡先",
        "zh": "联系人"
    },
    "customers.accountCode": {
        "en": "Account Code",
        "vi": "Mã tài khoản",
        "ja": "アカウントコード",
        "zh": "账户代码"
    },
    "customers.companyName": {
        "en": "Company Name",
        "vi": "Tên công ty",
        "ja": "会社名",
        "zh": "公司名称"
    },
    "customers.taxCode": {
        "en": "Tax Code",
        "vi": "Mã số thuế",
        "ja": "税コード",
        "zh": "税号"
    },
    "customers.phone": {
        "en": "Phone",
        "vi": "Điện thoại",
        "ja": "電話番号",
        "zh": "电话"
    },
    "customers.email": {
        "en": "Email",
        "vi": "Email",
        "ja": "メール",
        "zh": "邮箱"
    },
    "customers.clientType": {
        "en": "Client Type",
        "vi": "Loại khách hàng",
        "ja": "クライアント種別",
        "zh": "客户类型"
    },
    "customers.status": {
        "en": "Status",
        "vi": "Trạng thái",
        "ja": "ステータス",
        "zh": "状态"
    },
    "customers.name": {
        "en": "Name",
        "vi": "Tên",
        "ja": "名前",
        "zh": "姓名"
    },
    "customers.jobTitle": {
        "en": "Job Title",
        "vi": "Chức vụ",
        "ja": "役職",
        "zh": "职位"
    },
    "customers.account": {
        "en": "Account",
        "vi": "Tài khoản",
        "ja": "アカウント",
        "zh": "账户"
    },
    "customers.primary": {
        "en": "Primary",
        "vi": "Chính",
        "ja": "プライマリ",
        "zh": "主要"
    },
    "customers.accountStatus": {
        "en": "Account Status",
        "vi": "Trạng thái tài khoản",
        "ja": "アカウントステータス",
        "zh": "账户状态"
    },
    "customers.allStatuses": {
        "en": "All Statuses",
        "vi": "Tất cả trạng thái",
        "ja": "すべてのステータス",
        "zh": "所有状态"
    },
    "customers.active": {
        "en": "Active",
        "vi": "Hoạt động",
        "ja": "アクティブ",
        "zh": "活跃"
    },
    "customers.inactive": {
        "en": "Inactive",
        "vi": "Không hoạt động",
        "ja": "非アクティブ",
        "zh": "非活跃"
    },
    "customers.allTypes": {
        "en": "All Types",
        "vi": "Tất cả loại",
        "ja": "すべての種別",
        "zh": "所有类型"
    },
    "customers.business": {
        "en": "Business",
        "vi": "Doanh nghiệp",
        "ja": "法人",
        "zh": "企业"
    },
    "customers.individual": {
        "en": "Individual",
        "vi": "Cá nhân",
        "ja": "個人",
        "zh": "个人"
    },
    "customers.contactRole": {
        "en": "Contact Role",
        "vi": "Vai trò liên hệ",
        "ja": "連絡先役割",
        "zh": "联系人角色"
    },
    "customers.allRoles": {
        "en": "All Roles",
        "vi": "Tất cả vai trò",
        "ja": "すべての役割",
        "zh": "所有角色"
    },
    "customers.primaryOnly": {
        "en": "Primary Only",
        "vi": "Chỉ chính",
        "ja": "プライマリのみ",
        "zh": "仅主要"
    },
    "customers.regularOnly": {
        "en": "Regular Only",
        "vi": "Chỉ thường",
        "ja": "通常のみ",
        "zh": "仅普通"
    },
    "customers.deactivate": {
        "en": "Deactivate",
        "vi": "Vô hiệu hóa",
        "ja": "無効化",
        "zh": "停用"
    },
    "customers.exportSelected": {
        "en": "Export Selected",
        "vi": "Xuất các mục đã chọn",
        "ja": "選択項目をエクスポート",
        "zh": "导出所选"
    },
    "customers.sendSyncInvite": {
        "en": "Send Sync Invite",
        "vi": "Gửi lời mời đồng bộ",
        "ja": "同期招待を送信",
        "zh": "发送同步邀请"
    },
    "customers.searchPlaceholder": {
        "en": "Search {tab}...",
        "vi": "Tìm kiếm {tab}...",
        "ja": "{tab}を検索...",
        "zh": "搜索{tab}..."
    },
    "customers.exportExcel": {
        "en": "Export Excel",
        "vi": "Xuất Excel",
        "ja": "Excelエクスポート",
        "zh": "导出Excel"
    },
    "customers.newAccount": {
        "en": "New Account",
        "vi": "Tạo tài khoản khách hàng",
        "ja": "新規アカウント",
        "zh": "新建账户"
    },
    "customers.newContact": {
        "en": "New Contact",
        "vi": "Liên hệ mới",
        "ja": "新規連絡先",
        "zh": "新建联系人"
    },
    "customers.confirmDeleteCustomer": {
        "en": "Delete Account",
        "vi": "Xóa tài khoản khách hàng",
        "ja": "アカウントを削除",
        "zh": "删除账户"
    },
    "customers.deleteCustomerContent": {
        "en": "Are you sure you want to delete {name}? This action cannot be undone.",
        "vi": "Bạn có chắc chắn muốn xóa {name}? Hành động này không thể hoàn tác.",
        "ja": "{name}を削除してもよろしいですか？この操作は元に戻せません。",
        "zh": "您确定要删除{name}吗？此操作无法撤销。"
    },
    "customers.delete": {
        "en": "Delete",
        "vi": "Xóa",
        "ja": "削除",
        "zh": "删除"
    },
    "customers.cancel": {
        "en": "Cancel",
        "vi": "Hủy",
        "ja": "キャンセル",
        "zh": "取消"
    },
    "customers.confirmDeleteTitle": {
        "en": "Delete Contact",
        "vi": "Xóa liên hệ",
        "ja": "連絡先を削除",
        "zh": "删除联系人"
    },
    "customers.confirmDeleteContactContent": {
        "en": "Are you sure you want to delete this contact?",
        "vi": "Bạn có chắc chắn muốn xóa liên hệ này?",
        "ja": "この連絡先を削除してもよろしいですか？",
        "zh": "您确定要删除此联系人吗？"
    },
    "customers.editAccount": {
        "en": "Edit Account",
        "vi": "Chỉnh sửa tài khoản",
        "ja": "アカウントを編集",
        "zh": "编辑账户"
    },
    "customers.createAccount": {
        "en": "Create Account",
        "vi": "Tạo tài khoản",
        "ja": "アカウントを作成",
        "zh": "创建账户"
    },
    "customers.businessB2b": {
        "en": "Business (B2B)",
        "vi": "Doanh nghiệp (B2B)",
        "ja": "法人（B2B）",
        "zh": "企业（B2B）"
    },
    "customers.individualB2c": {
        "en": "Individual (B2C)",
        "vi": "Cá nhân (B2C)",
        "ja": "個人（B2C）",
        "zh": "个人（B2C）"
    },
    "customers.companyAccountName": {
        "en": "Company / Account Name",
        "vi": "Tên công ty / Tài khoản",
        "ja": "会社名 / アカウント名",
        "zh": "公司/账户名称"
    },
    "customers.emailAddress": {
        "en": "Email Address",
        "vi": "Địa chỉ Email",
        "ja": "メールアドレス",
        "zh": "电子邮件地址"
    },
    "customers.phoneNumber": {
        "en": "Phone Number",
        "vi": "Số điện thoại",
        "ja": "電話番号",
        "zh": "电话号码"
    },
    "customers.taxCodeMst": {
        "en": "Tax Code (MST)",
        "vi": "Mã số thuế (MST)",
        "ja": "税コード (MST)",
        "zh": "税号 (MST)"
    },
    "customers.industrySector": {
        "en": "Industry Sector",
        "vi": "Ngành nghề",
        "ja": "業種",
        "zh": "行业领域"
    },
    "customers.websiteAddress": {
        "en": "Website Address",
        "vi": "Địa chỉ website",
        "ja": "ウェブサイトアドレス",
        "zh": "网站地址"
    },
    "customers.officeLocationAddress": {
        "en": "Office / Location Address",
        "vi": "Địa chỉ văn phòng",
        "ja": "オフィス住所",
        "zh": "办公地址"
    },
    "customers.saveChanges": {
        "en": "Save Changes",
        "vi": "Lưu thay đổi",
        "ja": "変更を保存",
        "zh": "保存更改"
    },
    "customers.firstName": {
        "en": "First Name",
        "vi": "Tên",
        "ja": "名",
        "zh": "名"
    },
    "customers.lastName": {
        "en": "Last Name",
        "vi": "Họ",
        "ja": "姓",
        "zh": "姓"
    },
    "customers.internalRoleNotes": {
        "en": "Internal Role Notes",
        "vi": "Ghi chú vai trò nội bộ",
        "ja": "内部役割メモ",
        "zh": "内部角色备注"
    },
    "customers.associatedAccount": {
        "en": "Associated Account",
        "vi": "Tài khoản liên kết",
        "ja": "関連アカウント",
        "zh": "关联账户"
    },
    "customers.setAsPrimary": {
        "en": "Set as primary",
        "vi": "Đặt làm chính",
        "ja": "プライマリに設定",
        "zh": "设为主要"
    },
    "customers.editContact": {
        "en": "Edit Contact",
        "vi": "Chỉnh sửa liên hệ",
        "ja": "連絡先を編集",
        "zh": "编辑联系人"
    },
    "customers.createContact": {
        "en": "Create Contact",
        "vi": "Tạo liên hệ",
        "ja": "連絡先を作成",
        "zh": "创建联系人"
    },
    "customers.confirmDeleteContact": {
        "en": "Delete Contact",
        "vi": "Xóa liên hệ",
        "ja": "連絡先を削除",
        "zh": "删除联系人"
    },
    "customers.deleteContactContent": {
        "en": "Are you sure you want to delete {name}?",
        "vi": "Bạn có chắc chắn muốn xóa {name}?",
        "ja": "{name}を削除してもよろしいですか？",
        "zh": "您确定要删除{name}吗？"
    },
    "customers.accountControlPanel": {
        "en": "Account Control Panel",
        "vi": "Bảng điều khiển tài khoản",
        "ja": "アカウントコントロールパネル",
        "zh": "账户控制面板"
    },
    "customers.accountNotFound": {
        "en": "Account not found",
        "vi": "Không tìm thấy tài khoản",
        "ja": "アカウントが見つかりません",
        "zh": "未找到账户"
    },
    "customers.contactControlPanel": {
        "en": "Contact Control Panel",
        "vi": "Bảng điều khiển liên hệ",
        "ja": "連絡先コントロールパネル",
        "zh": "联系人控制面板"
    },
    "customers.contactLoading": {
        "en": "Loading contact...",
        "vi": "Đang tải liên hệ...",
        "ja": "連絡先を読み込み中...",
        "zh": "加载联系人..."
    },
    "customers.contactNotFound": {
        "en": "Contact not found",
        "vi": "Không tìm thấy liên hệ",
        "ja": "連絡先が見つかりません",
        "zh": "未找到联系人"
    },
    "customers.tabOverview": {
        "en": "Overview",
        "vi": "Tổng quan",
        "ja": "概要",
        "zh": "概览"
    },
    "customers.tabContacts": {
        "en": "Contacts",
        "vi": "Liên hệ",
        "ja": "連絡先",
        "zh": "联系人"
    },
    "customers.tabContracts": {
        "en": "Contracts",
        "vi": "Hợp đồng",
        "ja": "契約",
        "zh": "合同"
    },
    "customers.tabNotes": {
        "en": "Notes",
        "vi": "Ghi chú",
        "ja": "メモ",
        "zh": "备注"
    },
    "customers.tabOpportunities": {
        "en": "Opportunities",
        "vi": "Cơ hội",
        "ja": "案件",
        "zh": "商机"
    },
    "customers.tabRepresentedOpportunities": {
        "en": "Represented Opportunities",
        "vi": "Cơ hội đại diện",
        "ja": "担当案件",
        "zh": "代表的商机"
    },
    "customers.breadcrumbCustomers": {
        "en": "Customers",
        "vi": "Khách hàng",
        "ja": "顧客",
        "zh": "客户"
    },
    "customers.breadcrumbContacts": {
        "en": "Contacts",
        "vi": "Liên hệ",
        "ja": "連絡先",
        "zh": "联系人"
    },
    "customers.loading": {
        "en": "Loading...",
        "vi": "Đang tải...",
        "ja": "読み込み中...",
        "zh": "加载中..."
    },
    "customers.na": {
        "en": "N/A",
        "vi": "N/A",
        "ja": "N/A",
        "zh": "N/A"
    },
    "customers.deleteAccount": {
        "en": "Delete Account",
        "vi": "Xóa tài khoản",
        "ja": "アカウントを削除",
        "zh": "删除账户"
    },
    "customers.deleteContact": {
        "en": "Delete Contact",
        "vi": "Xóa liên hệ",
        "ja": "連絡先を削除",
        "zh": "删除联系人"
    },
    "customers.confirmDeleteContent": {
        "en": "Are you sure you want to delete {name}? This action cannot be undone.",
        "vi": "Bạn có chắc chắn muốn xóa {name}? Hành động này không thể hoàn tác.",
        "ja": "{name}を削除してもよろしいですか？この操作は元に戻せません。",
        "zh": "您确定要删除{name}吗？此操作无法撤销。"
    },
    "customers.editNotes": {
        "en": "Edit Notes",
        "vi": "Chỉnh sửa ghi chú",
        "ja": "メモを編集",
        "zh": "编辑备注"
    },
    "customers.assignedOwner": {
        "en": "Assigned Owner",
        "vi": "Chủ sở hữu được phân công",
        "ja": "割り当てられた所有者",
        "zh": "分配负责人"
    },
    "customers.businessDetails": {
        "en": "Business Details",
        "vi": "Chi tiết doanh nghiệp",
        "ja": "事業詳細",
        "zh": "业务详情"
    },
    "customers.createdAt": {
        "en": "Created At",
        "vi": "Ngày tạo",
        "ja": "作成日",
        "zh": "创建时间"
    },
    "customers.internalPrivateNotes": {
        "en": "Internal Private Notes",
        "vi": "Ghi chú nội bộ",
        "ja": "内部プライベートメモ",
        "zh": "内部私密备注"
    },
    "customers.internalRole": {
        "en": "Internal Role",
        "vi": "Vai trò nội bộ",
        "ja": "内部役割",
        "zh": "内部角色"
    },
    "customers.keyContacts": {
        "en": "Key Contacts",
        "vi": "Liên hệ chính",
        "ja": "主要連絡先",
        "zh": "主要联系人"
    },
    "customers.locationsDates": {
        "en": "Locations & Dates",
        "vi": "Địa điểm & Ngày tháng",
        "ja": "場所と日付",
        "zh": "地点与日期"
    },
    "customers.noContactOpportunities": {
        "en": "No opportunities for this contact",
        "vi": "Không có cơ hội nào cho liên hệ này",
        "ja": "この連絡先に関する案件はありません",
        "zh": "此联系人没有商机"
    },
    "customers.noContracts": {
        "en": "No contracts",
        "vi": "Không có hợp đồng",
        "ja": "契約はありません",
        "zh": "无合同"
    },
    "customers.noNotesSaved": {
        "en": "No notes saved",
        "vi": "Chưa có ghi chú nào",
        "ja": "メモはありません",
        "zh": "无保存的备注"
    },
    "customers.noOpportunities": {
        "en": "No opportunities",
        "vi": "Không có cơ hội",
        "ja": "案件はありません",
        "zh": "无商机"
    },
    "customers.notesSaved": {
        "en": "Notes saved",
        "vi": "Đã lưu ghi chú",
        "ja": "メモを保存しました",
        "zh": "备注已保存"
    },
    "customers.opportunitiesMiniTracker": {
        "en": "Opportunities Mini Tracker",
        "vi": "Theo dõi cơ hội nhanh",
        "ja": "案件ミニトラッカー",
        "zh": "商机迷你追踪器"
    },
    "customers.personalDetails": {
        "en": "Personal Details",
        "vi": "Thông tin cá nhân",
        "ja": "個人情報",
        "zh": "个人信息"
    },
    "customers.primaryAccountContact": {
        "en": "Primary Account Contact",
        "vi": "Liên hệ chính của tài khoản",
        "ja": "プライマリアカウント連絡先",
        "zh": "主要账户联系人"
    },
    "customers.primaryAccountContactDesc": {
        "en": "This contact is the primary point of contact for this account",
        "vi": "Liên hệ này là đầu mối chính của tài khoản này",
        "ja": "この連絡先はこのアカウントの主要な窓口です",
        "zh": "此联系人是此账户的主要联系人"
    },
    "customers.professionalInfo": {
        "en": "Professional Info",
        "vi": "Thông tin chuyên môn",
        "ja": "職務情報",
        "zh": "职业信息"
    },
    "customers.relatedContracts": {
        "en": "Related Contracts",
        "vi": "Hợp đồng liên quan",
        "ja": "関連契約",
        "zh": "相关合同"
    },
    "customers.representative": {
        "en": "Representative",
        "vi": "Người đại diện",
        "ja": "代表者",
        "zh": "代表人"
    },
    "customers.representedOpportunities": {
        "en": "Represented Opportunities",
        "vi": "Cơ hội đại diện",
        "ja": "代表案件",
        "zh": "代表的商机"
    },
    "customers.requiredFields": {
        "en": "Required fields",
        "vi": "Trường bắt buộc",
        "ja": "必須項目",
        "zh": "必填字段"
    },
    "customers.save": {
        "en": "Save",
        "vi": "Lưu",
        "ja": "保存",
        "zh": "保存"
    },
    "customers.setPrimary": {
        "en": "Set as Primary",
        "vi": "Đặt làm chính",
        "ja": "プライマリに設定",
        "zh": "设为主要"
    },
    "customers.statusSetting": {
        "en": "Status Setting",
        "vi": "Cài đặt trạng thái",
        "ja": "ステータス設定",
        "zh": "状态设置"
    },
    "customers.addContact": {
        "en": "Add Contact",
        "vi": "Thêm liên hệ",
        "ja": "連絡先を追加",
        "zh": "添加联系人"
    },
    "customers.addContactPerson": {
        "en": "Add Contact Person",
        "vi": "Thêm người liên hệ",
        "ja": "担当者を追加",
        "zh": "添加联系人"
    },

    # ===================== leads =====================
    "leads.title": {"en": "Leads", "vi": "Đầu mối", "ja": "リード", "zh": "潜在客户"},
    "leads.subtitle": {"en": "Manage and qualify incoming leads", "vi": "Quản lý và đánh giá đầu mối đến", "ja": "新規リードの管理と評価", "zh": "管理和资格认定潜在客户"},
    "leads.searchPlaceholder": {"en": "Search leads...", "vi": "Tìm kiếm đầu mối...", "ja": "リードを検索...", "zh": "搜索潜在客户..."},
    "leads.filters": {"en": "Filters", "vi": "Bộ lọc", "ja": "フィルター", "zh": "筛选"},
    "leads.import": {"en": "Import", "vi": "Nhập", "ja": "インポート", "zh": "导入"},
    "leads.newLead": {"en": "New Lead", "vi": "Đầu mối mới", "ja": "新規リード", "zh": "新建潜在客户"},
    "leads.advancedFilters": {"en": "Advanced Filters", "vi": "Bộ lọc nâng cao", "ja": "高度なフィルター", "zh": "高级筛选"},
    "leads.clearAll": {"en": "Clear All", "vi": "Xóa tất cả", "ja": "すべてクリア", "zh": "清除全部"},
    "leads.leadStatus": {"en": "Lead Status", "vi": "Trạng thái đầu mối", "ja": "リードステータス", "zh": "潜在客户状态"},
    "leads.allStatuses": {"en": "All Statuses", "vi": "Tất cả trạng thái", "ja": "すべてのステータス", "zh": "所有状态"},
    "leads.leadSource": {"en": "Lead Source", "vi": "Nguồn đầu mối", "ja": "リードソース", "zh": "潜在客户来源"},
    "leads.allSources": {"en": "All Sources", "vi": "Tất cả nguồn", "ja": "すべてのソース", "zh": "所有来源"},
    "leads.assignedOwner": {"en": "Assigned Owner", "vi": "Chủ sở hữu", "ja": "割り当て先", "zh": "分配负责人"},
    "leads.allOwners": {"en": "All Owners", "vi": "Tất cả chủ sở hữu", "ja": "すべての所有者", "zh": "所有负责人"},
    "leads.selectedCount": {"en": "{count} selected", "vi": "Đã chọn {count}", "ja": "{count} 件選択", "zh": "已选择 {count} 项"},
    "leads.reassignOwner": {"en": "Reassign Owner", "vi": "Chuyển chủ sở hữu", "ja": "所有者を再割り当て", "zh": "重新分配负责人"},
    "leads.exportExcel": {"en": "Export Excel", "vi": "Xuất Excel", "ja": "Excel出力", "zh": "导出Excel"},
    "leads.edit": {"en": "Edit", "vi": "Sửa", "ja": "編集", "zh": "编辑"},
    "leads.create": {"en": "Create", "vi": "Tạo", "ja": "作成", "zh": "创建"},
    "leads.firstName": {"en": "First Name", "vi": "Tên", "ja": "名", "zh": "名"},
    "leads.lastName": {"en": "Last Name", "vi": "Họ", "ja": "姓", "zh": "姓"},
    "leads.emailAddress": {"en": "Email Address", "vi": "Địa chỉ Email", "ja": "メールアドレス", "zh": "电子邮件地址"},
    "leads.phoneNumber": {"en": "Phone Number", "vi": "Số điện thoại", "ja": "電話番号", "zh": "电话号码"},
    "leads.companyName": {"en": "Company Name", "vi": "Tên công ty", "ja": "会社名", "zh": "公司名称"},
    "leads.estimatedBudget": {"en": "Estimated Budget", "vi": "Ngân sách dự kiến", "ja": "推定予算", "zh": "预估预算"},
    "leads.serviceInterest": {"en": "Service Interest", "vi": "Dịch vụ quan tâm", "ja": "関心のあるサービス", "zh": "感兴趣的服务"},
    "leads.timeline": {"en": "Timeline", "vi": "Tiến độ", "ja": "タイムライン", "zh": "时间线"},
    "leads.bantQualification": {"en": "BANT Qualification", "vi": "Đánh giá BANT", "ja": "BANT評価", "zh": "BANT资格认定"},
    "leads.budgetApproved": {"en": "Budget Approved", "vi": "Ngân sách đã duyệt", "ja": "予算承認済み", "zh": "预算已批准"},
    "leads.authorityConfirmed": {"en": "Authority Confirmed", "vi": "Thẩm quyền đã xác nhận", "ja": "権限確認済み", "zh": "权限已确认"},
    "leads.leadCode": {"en": "Lead Code", "vi": "Mã đầu mối", "ja": "リードコード", "zh": "潜在客户编号"},
    "leads.name": {"en": "Name", "vi": "Tên", "ja": "名前", "zh": "姓名"},
    "leads.email": {"en": "Email", "vi": "Email", "ja": "メール", "zh": "邮箱"},
    "leads.phone": {"en": "Phone", "vi": "Điện thoại", "ja": "電話", "zh": "电话"},
    "leads.source": {"en": "Source", "vi": "Nguồn", "ja": "ソース", "zh": "来源"},
    "leads.bantScore": {"en": "BANT Score", "vi": "Điểm BANT", "ja": "BANTスコア", "zh": "BANT评分"},
    "leads.status": {"en": "Status", "vi": "Trạng thái", "ja": "ステータス", "zh": "状态"},
    "leads.owner": {"en": "Owner", "vi": "Chủ sở hữu", "ja": "所有者", "zh": "负责人"},
    "leads.createdAt": {"en": "Created At", "vi": "Ngày tạo", "ja": "作成日", "zh": "创建时间"},
    "leads.describeNeed": {"en": "Describe Need", "vi": "Mô tả nhu cầu", "ja": "ニーズの説明", "zh": "描述需求"},
    "leads.estimatedAmount": {"en": "Estimated Amount", "vi": "Số tiền ước tính", "ja": "推定金額", "zh": "预估金额"},
    # leads detail page
    "leads.activityLogged": {"en": "Activity Logged", "vi": "Hoạt động đã ghi lại", "ja": "アクティビティ記録済み", "zh": "活动已记录"},
    "leads.activityPlaceholder": {"en": "Describe the activity...", "vi": "Mô tả hoạt động...", "ja": "アクティビティを説明...", "zh": "描述活动..."},
    "leads.activityType": {"en": "Activity Type", "vi": "Loại hoạt động", "ja": "アクティビティ種別", "zh": "活动类型"},
    "leads.addActivity": {"en": "Add Activity", "vi": "Thêm hoạt động", "ja": "アクティビティを追加", "zh": "添加活动"},
    "leads.aiBantScoreInsights": {"en": "AI BANT Score Insights", "vi": "Phân tích điểm BANT từ AI", "ja": "AI BANTスコア分析", "zh": "AI BANT评分洞察"},
    "leads.aiRecommendation": {"en": "AI Recommendation", "vi": "Đề xuất từ AI", "ja": "AI推奨", "zh": "AI建议"},
    "leads.analyzingBant": {"en": "Analyzing BANT...", "vi": "Đang phân tích BANT...", "ja": "BANT分析中...", "zh": "分析BANT中..."},
    "leads.authority": {"en": "Authority", "vi": "Thẩm quyền", "ja": "権限", "zh": "权限"},
    "leads.autoQualify": {"en": "Auto-Qualify", "vi": "Tự động đánh giá", "ja": "自動評価", "zh": "自动资格认定"},
    "leads.back": {"en": "Back", "vi": "Quay lại", "ja": "戻る", "zh": "返回"},
    "leads.bantParameters": {"en": "BANT Parameters", "vi": "Tham số BANT", "ja": "BANTパラメータ", "zh": "BANT参数"},
    "leads.breadcrumbLeads": {"en": "Leads", "vi": "Đầu mối", "ja": "リード", "zh": "潜在客户"},
    "leads.budget": {"en": "Budget", "vi": "Ngân sách", "ja": "予算", "zh": "预算"},
    "leads.cancel": {"en": "Cancel", "vi": "Hủy", "ja": "キャンセル", "zh": "取消"},
    "leads.clientType": {"en": "Client Type", "vi": "Loại khách hàng", "ja": "クライアント種別", "zh": "客户类型"},
    "leads.companyAccountName": {"en": "Company / Account Name", "vi": "Tên công ty / Tài khoản", "ja": "会社名/アカウント名", "zh": "公司/账户名称"},
    "leads.companyInfo": {"en": "Company Info", "vi": "Thông tin công ty", "ja": "会社情報", "zh": "公司信息"},
    "leads.confirmDeleteContent": {"en": "Are you sure you want to delete {name}?", "vi": "Bạn có chắc muốn xóa {name}?", "ja": "{name}を削除してもよろしいですか？", "zh": "您确定要删除{name}吗？"},
    "leads.confirmDeleteTitle": {"en": "Delete Lead", "vi": "Xóa đầu mối", "ja": "リードを削除", "zh": "删除潜在客户"},
    "leads.contactDetails": {"en": "Contact Details", "vi": "Chi tiết liên hệ", "ja": "連絡先詳細", "zh": "联系方式"},
    "leads.conversionFailed": {"en": "Conversion failed", "vi": "Chuyển đổi thất bại", "ja": "変換に失敗しました", "zh": "转换失败"},
    "leads.convertLead": {"en": "Convert Lead", "vi": "Chuyển đổi đầu mối", "ja": "リードを変換", "zh": "转换潜在客户"},
    "leads.convertSuccessMsg": {"en": "Lead converted successfully!", "vi": "Chuyển đổi đầu mối thành công!", "ja": "リードの変換に成功しました！", "zh": "潜在客户转换成功！"},
    "leads.convertedSuccess": {"en": "Converted Successfully", "vi": "Đã chuyển đổi thành công", "ja": "変換完了", "zh": "转换成功"},
    "leads.converting": {"en": "Converting...", "vi": "Đang chuyển đổi...", "ja": "変換中...", "zh": "转换中..."},
    "leads.created": {"en": "Created", "vi": "Đã tạo", "ja": "作成済み", "zh": "已创建"},
    "leads.customerAccount": {"en": "Customer Account", "vi": "Tài khoản khách hàng", "ja": "顧客アカウント", "zh": "客户账户"},
    "leads.delete": {"en": "Delete", "vi": "Xóa", "ja": "削除", "zh": "删除"},
    "leads.deleteLead": {"en": "Delete Lead", "vi": "Xóa đầu mối", "ja": "リードを削除", "zh": "删除潜在客户"},
    "leads.descriptionDetails": {"en": "Description Details", "vi": "Chi tiết mô tả", "ja": "詳細説明", "zh": "描述详情"},
    "leads.duplicateDescription": {"en": "This lead appears to be a duplicate of an existing customer or lead.", "vi": "Đầu mối này có vẻ trùng với khách hàng hoặc đầu mối hiện có.", "ja": "このリードは既存の顧客またはリードと重複している可能性があります。", "zh": "此潜在客户与现有客户或潜在客户重复。"},
    "leads.duplicateDetected": {"en": "Duplicate Detected", "vi": "Phát hiện trùng lặp", "ja": "重複を検出", "zh": "检测到重复"},
    "leads.evaluateNow": {"en": "Evaluate Now", "vi": "Đánh giá ngay", "ja": "今すぐ評価", "zh": "立即评估"},
    "leads.evaluatedAt": {"en": "Evaluated At", "vi": "Đánh giá lúc", "ja": "評価日時", "zh": "评估时间"},
    "leads.expectedCloseDate": {"en": "Expected Close Date", "vi": "Ngày dự kiến chốt", "ja": "成約予定日", "zh": "预计成交日期"},
    "leads.faissMatches": {"en": "FAISS Matches", "vi": "Kết quả FAISS", "ja": "FAISS一致", "zh": "FAISS匹配"},
    "leads.from": {"en": "From", "vi": "Từ", "ja": "開始", "zh": "从"},
    "leads.goToCustomers": {"en": "Go to Customers", "vi": "Đến Khách hàng", "ja": "顧客へ", "zh": "前往客户"},
    "leads.goToOpportunities": {"en": "Go to Opportunities", "vi": "Đến Cơ hội", "ja": "案件へ", "zh": "前往商机"},
    "leads.ignoreContinue": {"en": "Ignore & Continue", "vi": "Bỏ qua & Tiếp tục", "ja": "無視して続行", "zh": "忽略并继续"},
    "leads.interactionTimeline": {"en": "Interaction Timeline", "vi": "Dòng thời gian tương tác", "ja": "インタラクションタイムライン", "zh": "互动时间线"},
    "leads.leadControlPanel": {"en": "Lead Control Panel", "vi": "Bảng điều khiển đầu mối", "ja": "リードコントロールパネル", "zh": "潜在客户控制面板"},
    "leads.leadConversionWizard": {"en": "Lead Conversion Wizard", "vi": "Hướng dẫn chuyển đổi đầu mối", "ja": "リード変換ウィザード", "zh": "潜在客户转换向导"},
    "leads.leadConvertedSuccess": {"en": "Lead converted to opportunity successfully!", "vi": "Đã chuyển đầu mối thành cơ hội thành công!", "ja": "リードを案件に変換しました！", "zh": "潜在客户已成功转换为商机！"},
    "leads.leadOwner": {"en": "Lead Owner", "vi": "Chủ đầu mối", "ja": "リード所有者", "zh": "潜在客户负责人"},
    "leads.linkOrCreateDescription": {"en": "Link to an existing customer or create a new one.", "vi": "Liên kết với khách hàng hiện có hoặc tạo mới.", "ja": "既存の顧客にリンクするか、新規作成してください。", "zh": "链接到现有客户或创建新客户。"},
    "leads.linkToExisting": {"en": "Link to Existing", "vi": "Liên kết với khách hàng hiện có", "ja": "既存にリンク", "zh": "链接到现有"},
    "leads.loading": {"en": "Loading...", "vi": "Đang tải...", "ja": "読み込み中...", "zh": "加载中..."},
    "leads.logActivity": {"en": "Log Activity", "vi": "Ghi lại hoạt động", "ja": "アクティビティを記録", "zh": "记录活动"},
    "leads.logActivityOk": {"en": "Activity logged successfully!", "vi": "Đã ghi lại hoạt động!", "ja": "アクティビティを記録しました！", "zh": "活动记录成功！"},
    "leads.need": {"en": "Need", "vi": "Nhu cầu", "ja": "ニーズ", "zh": "需求"},
    "leads.next": {"en": "Next", "vi": "Tiếp theo", "ja": "次へ", "zh": "下一步"},
    "leads.no": {"en": "No", "vi": "Không", "ja": "いいえ", "zh": "否"},
    "leads.noRecommendation": {"en": "No recommendation available", "vi": "Không có đề xuất", "ja": "推奨はありません", "zh": "无可用建议"},
    "leads.none": {"en": "None", "vi": "Không", "ja": "なし", "zh": "无"},
    "leads.notAvailable": {"en": "N/A", "vi": "N/A", "ja": "N/A", "zh": "N/A"},
    "leads.notEvaluated": {"en": "Not Evaluated", "vi": "Chưa đánh giá", "ja": "未評価", "zh": "未评估"},
    "leads.notFound": {"en": "Lead not found", "vi": "Không tìm thấy đầu mối", "ja": "リードが見つかりません", "zh": "未找到潜在客户"},
    "leads.optionAppMvp": {"en": "App / MVP", "vi": "Ứng dụng / MVP", "ja": "アプリ/MVP", "zh": "应用/MVP"},
    "leads.optionB2B": {"en": "B2B", "vi": "B2B", "ja": "B2B", "zh": "B2B"},
    "leads.optionB2C": {"en": "B2C", "vi": "B2C", "ja": "B2C", "zh": "B2C"},
    "leads.optionBranding": {"en": "Branding", "vi": "Thương hiệu", "ja": "ブランディング", "zh": "品牌"},
    "leads.optionCall": {"en": "Call", "vi": "Cuộc gọi", "ja": "電話", "zh": "电话"},
    "leads.optionContacted": {"en": "Contacted", "vi": "Đã liên hệ", "ja": "連絡済み", "zh": "已联系"},
    "leads.optionCustom": {"en": "Custom", "vi": "Tùy chỉnh", "ja": "カスタム", "zh": "自定义"},
    "leads.optionEmail": {"en": "Email", "vi": "Email", "ja": "メール", "zh": "邮件"},
    "leads.optionMeeting": {"en": "Meeting", "vi": "Cuộc họp", "ja": "ミーティング", "zh": "会议"},
    "leads.optionNew": {"en": "New", "vi": "Mới", "ja": "新規", "zh": "新"},
    "leads.optionNote": {"en": "Note", "vi": "Ghi chú", "ja": "メモ", "zh": "备注"},
    "leads.optionQualified": {"en": "Qualified", "vi": "Đủ điều kiện", "ja": "適格", "zh": "合格"},
    "leads.optionUiUx": {"en": "UI/UX", "vi": "UI/UX", "ja": "UI/UX", "zh": "UI/UX"},
    "leads.optionUnqualified": {"en": "Unqualified", "vi": "Không đủ điều kiện", "ja": "不適格", "zh": "不合格"},
    "leads.optionWebsite": {"en": "Website", "vi": "Website", "ja": "ウェブサイト", "zh": "网站"},
    "leads.overallAiQualityScore": {"en": "Overall AI Quality Score", "vi": "Điểm chất lượng AI tổng thể", "ja": "AI品質スコア総合", "zh": "AI综合质量评分"},
    "leads.ownerJaneSmith": {"en": "Jane Smith", "vi": "Jane Smith", "ja": "Jane Smith", "zh": "Jane Smith"},
    "leads.ownerJohnDoe": {"en": "John Doe", "vi": "John Doe", "ja": "John Doe", "zh": "John Doe"},
    "leads.ownerSystemAdmin": {"en": "System Admin", "vi": "Quản trị hệ thống", "ja": "システム管理者", "zh": "系统管理员"},
    "leads.readyToConvert": {"en": "Ready to Convert", "vi": "Sẵn sàng chuyển đổi", "ja": "変換準備完了", "zh": "准备转换"},
    "leads.refCode": {"en": "Ref Code", "vi": "Mã tham chiếu", "ja": "参照コード", "zh": "参考编号"},
    "leads.skipDuplicate": {"en": "Skip Duplicate", "vi": "Bỏ qua trùng lặp", "ja": "重複をスキップ", "zh": "跳过重复"},
    "leads.statedNeed": {"en": "Stated Need", "vi": "Nhu cầu đã nêu", "ja": "表明されたニーズ", "zh": "已陈述需求"},
    "leads.stepCompleted": {"en": "Completed", "vi": "Hoàn thành", "ja": "完了", "zh": "已完成"},
    "leads.stepCustomerProfile": {"en": "Customer Profile", "vi": "Hồ sơ khách hàng", "ja": "顧客プロフィール", "zh": "客户资料"},
    "leads.stepOpportunityScope": {"en": "Opportunity Scope", "vi": "Phạm vi cơ hội", "ja": "案件範囲", "zh": "商机范围"},
    "leads.tabActivityLog": {"en": "Activity Log", "vi": "Nhật ký hoạt động", "ja": "アクティビティログ", "zh": "活动日志"},
    "leads.tabAiInsights": {"en": "AI Insights", "vi": "Phân tích AI", "ja": "AI分析", "zh": "AI洞察"},
    "leads.tabConvert": {"en": "Convert", "vi": "Chuyển đổi", "ja": "変換", "zh": "转换"},
    "leads.tabOverview": {"en": "Overview", "vi": "Tổng quan", "ja": "概要", "zh": "概览"},
    "leads.targetTimeline": {"en": "Target Timeline", "vi": "Tiến độ mục tiêu", "ja": "目標タイムライン", "zh": "目标时间线"},
    "leads.taxCodeOptional": {"en": "Tax Code (optional)", "vi": "Mã số thuế (không bắt buộc)", "ja": "税コード（任意）", "zh": "税号（可选）"},
    "leads.yes": {"en": "Yes", "vi": "Có", "ja": "はい", "zh": "是"},

    # ===================== opportunities =====================
    "opportunities.title": {"en": "Opportunities", "vi": "Cơ hội", "ja": "案件", "zh": "商机"},
    "opportunities.subtitle": {"en": "Manage sales opportunities and track deal progress", "vi": "Quản lý cơ hội bán hàng và theo dõi tiến độ", "ja": "商談の管理と進捗追跡", "zh": "管理销售商机并跟踪交易进展"},
    "opportunities.searchPlaceholder": {"en": "Search opportunities...", "vi": "Tìm kiếm cơ hội...", "ja": "案件を検索...", "zh": "搜索商机..."},
    "opportunities.createOpportunity": {"en": "Create Opportunity", "vi": "Tạo cơ hội", "ja": "案件を作成", "zh": "创建商机"},
    "opportunities.salesStage": {"en": "Sales Stage", "vi": "Giai đoạn bán hàng", "ja": "販売ステージ", "zh": "销售阶段"},
    "opportunities.allStages": {"en": "All Stages", "vi": "Tất cả giai đoạn", "ja": "すべてのステージ", "zh": "所有阶段"},
    "opportunities.serviceInterest": {"en": "Service Interest", "vi": "Dịch vụ quan tâm", "ja": "関心のあるサービス", "zh": "感兴趣的服务"},
    "opportunities.allServices": {"en": "All Services", "vi": "Tất cả dịch vụ", "ja": "すべてのサービス", "zh": "所有服务"},
    "opportunities.loading": {"en": "Loading...", "vi": "Đang tải...", "ja": "読み込み中...", "zh": "加载中..."},
    "opportunities.code": {"en": "Code", "vi": "Mã", "ja": "コード", "zh": "编号"},
    "opportunities.name": {"en": "Name", "vi": "Tên", "ja": "名前", "zh": "名称"},
    "opportunities.customer": {"en": "Customer", "vi": "Khách hàng", "ja": "顧客", "zh": "客户"},
    "opportunities.estimatedValue": {"en": "Estimated Value", "vi": "Giá trị ước tính", "ja": "推定価値", "zh": "预估价值"},
    "opportunities.status": {"en": "Status", "vi": "Trạng thái", "ja": "ステータス", "zh": "状态"},
    "opportunities.closeProbability": {"en": "Close Probability", "vi": "Xác suất chốt", "ja": "成約確率", "zh": "成交概率"},
    "opportunities.expectedCloseDate": {"en": "Expected Close Date", "vi": "Ngày dự kiến chốt", "ja": "成約予定日", "zh": "预计成交日期"},
    "opportunities.edit": {"en": "Edit", "vi": "Sửa", "ja": "編集", "zh": "编辑"},
    "opportunities.createTitle": {"en": "Create Opportunity", "vi": "Tạo cơ hội", "ja": "案件を作成", "zh": "创建商机"},
    "opportunities.estimatedValueVnd": {"en": "Estimated Value (VND)", "vi": "Giá trị ước tính (VND)", "ja": "推定価値（VND）", "zh": "预估价值（VND）"},
    "opportunities.expectedCloseDateFormat": {"en": "Expected Close Date", "vi": "Ngày dự kiến chốt", "ja": "成約予定日", "zh": "预计成交日期"},
    "opportunities.customerAccount": {"en": "Customer Account", "vi": "Tài khoản khách hàng", "ja": "顧客アカウント", "zh": "客户账户"},
    "opportunities.contactPerson": {"en": "Contact Person", "vi": "Người liên hệ", "ja": "担当者", "zh": "联系人"},
    "opportunities.owner": {"en": "Owner", "vi": "Chủ sở hữu", "ja": "所有者", "zh": "负责人"},
    "opportunities.scopeDescription": {"en": "Scope Description", "vi": "Mô tả phạm vi", "ja": "範囲の説明", "zh": "范围描述"},
    "opportunities.cancel": {"en": "Cancel", "vi": "Hủy", "ja": "キャンセル", "zh": "取消"},
    "opportunities.saveChanges": {"en": "Save Changes", "vi": "Lưu thay đổi", "ja": "変更を保存", "zh": "保存更改"},
    "opportunities.closeLost": {"en": "Close Lost", "vi": "Đóng - Mất", "ja": "失注", "zh": "关闭-丢失"},
    "opportunities.confirmCloseLost": {"en": "Confirm Close Lost", "vi": "Xác nhận đóng - mất", "ja": "失注を確認", "zh": "确认关闭-丢失"},
    "opportunities.closeLostReason": {"en": "Please provide a reason for closing this opportunity as lost:", "vi": "Vui lòng cung cấp lý do đóng cơ hội này là mất:", "ja": "失注理由を入力してください：", "zh": "请提供将此商机关闭为丢失的原因："},
    "opportunities.lostReasonPlaceholder": {"en": "Enter reason...", "vi": "Nhập lý do...", "ja": "理由を入力...", "zh": "输入原因..."},
    "opportunities.lostReasonRequired": {"en": "Please provide a reason for closing as lost", "vi": "Vui lòng nhập lý do đóng - mất", "ja": "失注理由を入力してください", "zh": "请提供关闭-丢失的原因"},
    "opportunities.statusChanged": {"en": "Status changed to {stage}", "vi": "Đã chuyển trạng thái sang {stage}", "ja": "ステータスが{stage}に変更されました", "zh": "状态已更改为{stage}"},
    "opportunities.dragHere": {"en": "Drag opportunities here", "vi": "Kéo cơ hội vào đây", "ja": "案件をここにドラッグ", "zh": "将商机拖到此处"},
    # opportunities detail page
    "opportunities.accountCustomer": {"en": "Account / Customer", "vi": "Tài khoản / Khách hàng", "ja": "アカウント/顧客", "zh": "账户/客户"},
    "opportunities.aiCoach": {"en": "AI Coach", "vi": "Huấn luyện AI", "ja": "AIコーチ", "zh": "AI教练"},
    "opportunities.aiCoachDesc": {"en": "Get AI-powered coaching advice for this opportunity", "vi": "Nhận lời khuyên từ AI cho cơ hội này", "ja": "この案件に関するAIコーチングアドバイス", "zh": "获取此商机的AI教练建议"},
    "opportunities.aiTyping": {"en": "AI is typing...", "vi": "AI đang nhập...", "ja": "AIが入力中...", "zh": "AI正在输入..."},
    "opportunities.breadcrumbOpportunities": {"en": "Opportunities", "vi": "Cơ hội", "ja": "案件", "zh": "商机"},
    "opportunities.closedLostLabel": {"en": "Closed Lost", "vi": "Đã đóng - Mất", "ja": "失注", "zh": "已关闭-丢失"},
    "opportunities.coachAdvice": {"en": "Coach Advice", "vi": "Lời khuyên từ Coach", "ja": "コーチアドバイス", "zh": "教练建议"},
    "opportunities.coachConnError": {"en": "Connection error", "vi": "Lỗi kết nối", "ja": "接続エラー", "zh": "连接错误"},
    "opportunities.coachConnectError": {"en": "Could not connect to AI coach", "vi": "Không thể kết nối đến AI coach", "ja": "AIコーチに接続できません", "zh": "无法连接到AI教练"},
    "opportunities.coachEmpty": {"en": "Ask the AI coach for advice on this opportunity", "vi": "Hỏi AI coach lời khuyên về cơ hội này", "ja": "この案件についてAIコーチに相談する", "zh": "向AI教练咨询此商机的建议"},
    "opportunities.confirmDelete": {"en": "Are you sure you want to delete this opportunity?", "vi": "Bạn có chắc chắn muốn xóa cơ hội này?", "ja": "この案件を削除してもよろしいですか？", "zh": "您确定要删除此商机吗？"},
    "opportunities.confirmDeleteBtn": {"en": "Delete", "vi": "Xóa", "ja": "削除", "zh": "删除"},
    "opportunities.controlPanel": {"en": "Opportunity Control Panel", "vi": "Bảng điều khiển cơ hội", "ja": "案件コントロールパネル", "zh": "商机控制面板"},
    "opportunities.customerRelations": {"en": "Customer Relations", "vi": "Quan hệ khách hàng", "ja": "顧客関係", "zh": "客户关系"},
    "opportunities.dealCode": {"en": "Deal Code", "vi": "Mã giao dịch", "ja": "案件コード", "zh": "交易编号"},
    "opportunities.dealParameters": {"en": "Deal Parameters", "vi": "Tham số giao dịch", "ja": "案件パラメータ", "zh": "交易参数"},
    "opportunities.deleteOpportunity": {"en": "Delete Opportunity", "vi": "Xóa cơ hội", "ja": "案件を削除", "zh": "删除商机"},
    "opportunities.deleteWarning": {"en": "This action cannot be undone.", "vi": "Hành động này không thể hoàn tác.", "ja": "この操作は元に戻せません。", "zh": "此操作无法撤销。"},
    "opportunities.noDescription": {"en": "No description provided", "vi": "Không có mô tả", "ja": "説明がありません", "zh": "未提供描述"},
    "opportunities.noTimelineLogs": {"en": "No timeline logs yet", "vi": "Chưa có nhật ký tiến độ", "ja": "タイムラインログはまだありません", "zh": "暂无时间线日志"},
    "opportunities.notFound": {"en": "Opportunity not found", "vi": "Không tìm thấy cơ hội", "ja": "案件が見つかりません", "zh": "未找到商机"},
    "opportunities.primaryContact": {"en": "Primary Contact", "vi": "Liên hệ chính", "ja": "主要連絡先", "zh": "主要联系人"},
    "opportunities.prob100": {"en": "100% - Closed Won", "vi": "100% - Đã chốt", "ja": "100% - 成約", "zh": "100% - 已成交"},
    "opportunities.prob20": {"en": "20% - Initial Contact", "vi": "20% - Liên hệ ban đầu", "ja": "20% - 初期接触", "zh": "20% - 初步接触"},
    "opportunities.prob50": {"en": "50% - Proposal Sent", "vi": "50% - Đã gửi đề xuất", "ja": "50% - 提案送付", "zh": "50% - 已发送提案"},
    "opportunities.prob80": {"en": "80% - Negotiation", "vi": "80% - Đàm phán", "ja": "80% - 交渉中", "zh": "80% - 谈判中"},
    "opportunities.probability": {"en": "Probability", "vi": "Xác suất", "ja": "確率", "zh": "概率"},
    "opportunities.qualificationReached": {"en": "Qualification Reached", "vi": "Đã đạt đủ điều kiện", "ja": "適格に到達", "zh": "已符合条件"},
    "opportunities.reason": {"en": "Reason", "vi": "Lý do", "ja": "理由", "zh": "原因"},
    "opportunities.reloadSuggestions": {"en": "Reload Suggestions", "vi": "Tải lại đề xuất", "ja": "提案を再読み込み", "zh": "重新加载建议"},
    "opportunities.salesStageSetting": {"en": "Sales Stage Setting", "vi": "Cài đặt giai đoạn bán hàng", "ja": "販売ステージ設定", "zh": "销售阶段设置"},
    "opportunities.stage": {"en": "Stage", "vi": "Giai đoạn", "ja": "ステージ", "zh": "阶段"},
    "opportunities.stageHistory": {"en": "Stage History", "vi": "Lịch sử giai đoạn", "ja": "ステージ履歴", "zh": "阶段历史"},
    "opportunities.stageLost": {"en": "Lost", "vi": "Mất", "ja": "失注", "zh": "丢失"},
    "opportunities.stageNegotiation": {"en": "Negotiation", "vi": "Đàm phán", "ja": "交渉", "zh": "谈判"},
    "opportunities.stageProposal": {"en": "Proposal", "vi": "Đề xuất", "ja": "提案", "zh": "提案"},
    "opportunities.stageQualification": {"en": "Qualification", "vi": "Đánh giá", "ja": "評価", "zh": "资格认定"},
    "opportunities.stageReached": {"en": "Stage Reached", "vi": "Giai đoạn đã đạt", "ja": "到達ステージ", "zh": "已达到阶段"},
    "opportunities.stageWon": {"en": "Won", "vi": "Thắng", "ja": "受注", "zh": "赢得"},
    "opportunities.startCoach": {"en": "Start AI Coach", "vi": "Bắt đầu AI Coach", "ja": "AIコーチを開始", "zh": "开始AI教练"},
    "opportunities.stepClosedWon": {"en": "Closed Won", "vi": "Đã chốt thành công", "ja": "成約", "zh": "已成交"},
    "opportunities.stepNegotiation": {"en": "Negotiation", "vi": "Đàm phán", "ja": "交渉", "zh": "谈判"},
    "opportunities.stepProposal": {"en": "Proposal", "vi": "Đề xuất", "ja": "提案", "zh": "提案"},
    "opportunities.stepQualification": {"en": "Qualification", "vi": "Đánh giá", "ja": "評価", "zh": "资格认定"},
    "opportunities.systemAdmin": {"en": "System Admin", "vi": "Quản trị hệ thống", "ja": "システム管理者", "zh": "系统管理员"},
    "opportunities.systemAutoQualify": {"en": "System Auto-Qualify", "vi": "Tự động đánh giá hệ thống", "ja": "システム自動評価", "zh": "系统自动资格认定"},
    "opportunities.tabActivity": {"en": "Activity", "vi": "Hoạt động", "ja": "アクティビティ", "zh": "活动"},
    "opportunities.tabAiCoach": {"en": "AI Coach", "vi": "AI Coach", "ja": "AIコーチ", "zh": "AI教练"},
    "opportunities.tabOverview": {"en": "Overview", "vi": "Tổng quan", "ja": "概要", "zh": "概览"},
    "opportunities.tabProgress": {"en": "Progress", "vi": "Tiến độ", "ja": "進捗", "zh": "进展"},
    "opportunities.targetCloseDate": {"en": "Target Close Date", "vi": "Ngày chốt mục tiêu", "ja": "目標成約日", "zh": "目标成交日期"},
    "opportunities.timelineLogs": {"en": "Timeline Logs", "vi": "Nhật ký tiến độ", "ja": "タイムラインログ", "zh": "时间线日志"},
    "opportunities.transitionedBy": {"en": "Transitioned by", "vi": "Chuyển bởi", "ja": "移行者", "zh": "由...转移"},
    "opportunities.viewAccount": {"en": "View Account", "vi": "Xem tài khoản", "ja": "アカウントを表示", "zh": "查看账户"},
    "opportunities.viewContact": {"en": "View Contact", "vi": "Xem liên hệ", "ja": "連絡先を表示", "zh": "查看联系人"},

    # ===================== quotations =====================
    "quotations.title": {"en": "Quotations", "vi": "Báo giá", "ja": "見積書", "zh": "报价单"},
    "quotations.subtitle": {"en": "Create and manage quotations", "vi": "Tạo và quản lý báo giá", "ja": "見積書の作成と管理", "zh": "创建和管理报价单"},
    "quotations.searchPlaceholder": {"en": "Search quotations...", "vi": "Tìm kiếm báo giá...", "ja": "見積書を検索...", "zh": "搜索报价单..."},
    "quotations.filters": {"en": "Filters", "vi": "Bộ lọc", "ja": "フィルター", "zh": "筛选"},
    "quotations.create": {"en": "Create Quotation", "vi": "Tạo báo giá", "ja": "見積書を作成", "zh": "创建报价单"},
    "quotations.statusLabel": {"en": "Status", "vi": "Trạng thái", "ja": "ステータス", "zh": "状态"},
    "quotations.allStatuses": {"en": "All Statuses", "vi": "Tất cả trạng thái", "ja": "すべてのステータス", "zh": "所有状态"},
    "quotations.serviceType": {"en": "Service Type", "vi": "Loại dịch vụ", "ja": "サービス種別", "zh": "服务类型"},
    "quotations.allServiceTypes": {"en": "All Service Types", "vi": "Tất cả loại dịch vụ", "ja": "すべてのサービス種別", "zh": "所有服务类型"},
    "quotations.loading": {"en": "Loading...", "vi": "Đang tải...", "ja": "読み込み中...", "zh": "加载中..."},
    "quotations.code": {"en": "Code", "vi": "Mã", "ja": "コード", "zh": "编号"},
    "quotations.projectDetails": {"en": "Project Details", "vi": "Chi tiết dự án", "ja": "プロジェクト詳細", "zh": "项目详情"},
    "quotations.customer": {"en": "Customer", "vi": "Khách hàng", "ja": "顧客", "zh": "客户"},
    "quotations.grandTotal": {"en": "Grand Total", "vi": "Tổng cộng", "ja": "総合計", "zh": "总计"},
    "quotations.status": {"en": "Status", "vi": "Trạng thái", "ja": "ステータス", "zh": "状态"},
    "quotations.validUntil": {"en": "Valid Until", "vi": "Hiệu lực đến", "ja": "有効期限", "zh": "有效期至"},
    "quotations.actions": {"en": "Actions", "vi": "Thao tác", "ja": "アクション", "zh": "操作"},
    "quotations.clone": {"en": "Clone v{version}", "vi": "Nhân bản v{version}", "ja": "複製 v{version}", "zh": "克隆 v{version}"},
    "quotations.pdf": {"en": "PDF", "vi": "PDF", "ja": "PDF", "zh": "PDF"},
    "quotations.edit": {"en": "Edit {code}", "vi": "Sửa {code}", "ja": "{code}を編集", "zh": "编辑 {code}"},
    "quotations.createTitle": {"en": "Create Quotation", "vi": "Tạo báo giá", "ja": "見積書を作成", "zh": "创建报价单"},
    "quotations.cancel": {"en": "Cancel", "vi": "Hủy", "ja": "キャンセル", "zh": "取消"},
    "quotations.saveChanges": {"en": "Save Changes", "vi": "Lưu thay đổi", "ja": "変更を保存", "zh": "保存更改"},
    # quotations detail
    "quotations.adjustment": {"en": "Adjustment", "vi": "Điều chỉnh", "ja": "調整", "zh": "调整"},
    "quotations.approveQuotation": {"en": "Approve Quotation", "vi": "Phê duyệt báo giá", "ja": "見積書を承認", "zh": "批准报价单"},
    "quotations.breadcrumbQuotations": {"en": "Quotations", "vi": "Báo giá", "ja": "見積書", "zh": "报价单"},
    "quotations.cloneNewVersion": {"en": "Clone New Version", "vi": "Nhân bản phiên bản mới", "ja": "新バージョンを複製", "zh": "克隆新版本"},
    "quotations.clonedRevision": {"en": "Cloned as revision {version}", "vi": "Đã nhân bản thành phiên bản {version}", "ja": "リビジョン{version}として複製", "zh": "已克隆为修订版{version}"},
    "quotations.colDeliverableDetails": {"en": "Deliverable Details", "vi": "Chi tiết bàn giao", "ja": "成果物詳細", "zh": "交付物详情"},
    "quotations.colEstimatedTimeline": {"en": "Est. Timeline", "vi": "Tiến độ dự kiến", "ja": "推定スケジュール", "zh": "预估时间线"},
    "quotations.colItem": {"en": "Item", "vi": "Mục", "ja": "項目", "zh": "项目"},
    "quotations.colValue": {"en": "Value", "vi": "Giá trị", "ja": "金額", "zh": "金额"},
    "quotations.createdBy": {"en": "Created By", "vi": "Người tạo", "ja": "作成者", "zh": "创建人"},
    "quotations.customerAccount": {"en": "Customer Account", "vi": "Tài khoản khách hàng", "ja": "顧客アカウント", "zh": "客户账户"},
    "quotations.downloadPdf": {"en": "Download PDF", "vi": "Tải PDF", "ja": "PDFをダウンロード", "zh": "下载PDF"},
    "quotations.grandTotalValue": {"en": "Grand Total", "vi": "Tổng cộng", "ja": "総合計", "zh": "总计"},
    "quotations.notFound": {"en": "Quotation not found", "vi": "Không tìm thấy báo giá", "ja": "見積書が見つかりません", "zh": "未找到报价单"},
    "quotations.notSpecified": {"en": "Not specified", "vi": "Không xác định", "ja": "未指定", "zh": "未指定"},
    "quotations.opportunity": {"en": "Opportunity", "vi": "Cơ hội", "ja": "案件", "zh": "商机"},
    "quotations.owner": {"en": "Owner", "vi": "Chủ sở hữu", "ja": "所有者", "zh": "负责人"},
    "quotations.paymentTerms": {"en": "Payment Terms", "vi": "Điều khoản thanh toán", "ja": "支払条件", "zh": "付款条款"},
    "quotations.pdfDescription": {"en": "Quotation PDF document", "vi": "Tài liệu PDF báo giá", "ja": "見積書PDF", "zh": "报价单PDF文档"},
    "quotations.projectScopeOverview": {"en": "Project Scope Overview", "vi": "Tổng quan phạm vi dự án", "ja": "プロジェクト範囲概要", "zh": "项目范围概述"},
    "quotations.quotation": {"en": "Quotation", "vi": "Báo giá", "ja": "見積書", "zh": "报价单"},
    "quotations.quotationControls": {"en": "Quotation Controls", "vi": "Điều khiển báo giá", "ja": "見積書操作", "zh": "报价单控制"},
    "quotations.quotationPdfDocument": {"en": "Quotation PDF", "vi": "PDF báo giá", "ja": "見積書PDF", "zh": "报价单PDF"},
    "quotations.revisionHistory": {"en": "Revision History", "vi": "Lịch sử phiên bản", "ja": "改訂履歴", "zh": "修订历史"},
    "quotations.revisionLimit": {"en": "Revision Limit", "vi": "Giới hạn phiên bản", "ja": "改訂制限", "zh": "修订限制"},
    "quotations.scopeOfWorkItems": {"en": "Scope of Work Items", "vi": "Phạm vi công việc", "ja": "作業範囲項目", "zh": "工作范围项"},
    "quotations.sendToClient": {"en": "Send to Client", "vi": "Gửi cho khách hàng", "ja": "顧客に送信", "zh": "发送给客户"},
    "quotations.standard": {"en": "Standard", "vi": "Tiêu chuẩn", "ja": "標準", "zh": "标准"},
    "quotations.subtotal": {"en": "Subtotal", "vi": "Tạm tính", "ja": "小計", "zh": "小计"},
    "quotations.tabOverview": {"en": "Overview", "vi": "Tổng quan", "ja": "概要", "zh": "概览"},
    "quotations.tabServiceItems": {"en": "Service Items", "vi": "Danh mục dịch vụ", "ja": "サービス項目", "zh": "服务项目"},
    "quotations.tabVersionHistory": {"en": "Version History", "vi": "Lịch sử phiên bản", "ja": "バージョン履歴", "zh": "版本历史"},
    "quotations.timeline": {"en": "Timeline", "vi": "Tiến độ", "ja": "タイムライン", "zh": "时间线"},
    "quotations.times": {"en": "times", "vi": "lần", "ja": "回", "zh": "次"},
    "quotations.validityDate": {"en": "Validity Date", "vi": "Ngày hiệu lực", "ja": "有効日", "zh": "有效期"},
    "quotations.vat": {"en": "VAT", "vi": "VAT", "ja": "消費税", "zh": "增值税"},
    "quotations.version1Created": {"en": "Version 1 created", "vi": "Phiên bản 1 đã tạo", "ja": "バージョン1作成済み", "zh": "版本1已创建"},
    "quotations.versionActive": {"en": "Active version", "vi": "Phiên bản hoạt động", "ja": "アクティブバージョン", "zh": "当前版本"},
    "quotations.viewOpportunity": {"en": "View Opportunity", "vi": "Xem cơ hội", "ja": "案件を表示", "zh": "查看商机"},
    "quotations.systemAdmin": {"en": "System Admin", "vi": "Quản trị hệ thống", "ja": "システム管理者", "zh": "系统管理员"},

    # ===================== deals =====================
    "deals.title": {"en": "Deals", "vi": "Giao dịch", "ja": "案件", "zh": "交易"},
    "deals.subtitle": {"en": "Manage deal flow and project delivery", "vi": "Quản lý luồng giao dịch và bàn giao dự án", "ja": "案件フローとプロジェクト納品の管理", "zh": "管理交易流程和项目交付"},
    "deals.searchPlaceholder": {"en": "Search deals...", "vi": "Tìm kiếm giao dịch...", "ja": "案件を検索...", "zh": "搜索交易..."},
    "deals.loading": {"en": "Loading...", "vi": "Đang tải...", "ja": "読み込み中...", "zh": "加载中..."},
    "deals.dealCode": {"en": "Deal Code", "vi": "Mã giao dịch", "ja": "案件コード", "zh": "交易编号"},
    "deals.projectCustomer": {"en": "Project / Customer", "vi": "Dự án / Khách hàng", "ja": "プロジェクト/顧客", "zh": "项目/客户"},
    "deals.value": {"en": "Value", "vi": "Giá trị", "ja": "金額", "zh": "金额"},
    "deals.approvalStage": {"en": "Approval Stage", "vi": "Giai đoạn duyệt", "ja": "承認ステージ", "zh": "审批阶段"},
    "deals.expectedStart": {"en": "Expected Start", "vi": "Ngày bắt đầu dự kiến", "ja": "開始予定日", "zh": "预计开始"},
    "deals.paymentMilestones": {"en": "Payment Milestones", "vi": "Mốc thanh toán", "ja": "支払マイルストーン", "zh": "付款里程碑"},
    "deals.milestoneCount": {"en": "{count} milestone(s)", "vi": "{count} mốc", "ja": "{count} マイルストーン", "zh": "{count} 个里程碑"},
    "deals.actions": {"en": "Actions", "vi": "Thao tác", "ja": "アクション", "zh": "操作"},
    "deals.manage": {"en": "Manage", "vi": "Quản lý", "ja": "管理", "zh": "管理"},
    "deals.autoCreate": {"en": "Auto-create from Opportunity", "vi": "Tự động tạo từ Cơ hội", "ja": "案件から自動作成", "zh": "从商机自动创建"},
    "deals.allStages": {"en": "All Stages", "vi": "Tất cả giai đoạn", "ja": "すべてのステージ", "zh": "所有阶段"},
    # deals detail
    "deals.breadcrumbDeals": {"en": "Deals", "vi": "Giao dịch", "ja": "案件", "zh": "交易"},
    "deals.client": {"en": "Client", "vi": "Khách hàng", "ja": "クライアント", "zh": "客户"},
    "deals.clientRepresentative": {"en": "Client Representative", "vi": "Đại diện khách hàng", "ja": "クライアント代表", "zh": "客户代表"},
    "deals.closedLost": {"en": "Closed Lost", "vi": "Đã đóng - Mất", "ja": "失注", "zh": "已关闭-丢失"},
    "deals.colDeliverableDetails": {"en": "Deliverable Details", "vi": "Chi tiết bàn giao", "ja": "成果物詳細", "zh": "交付物详情"},
    "deals.colServiceItems": {"en": "Service Items", "vi": "Dịch vụ", "ja": "サービス項目", "zh": "服务项目"},
    "deals.colValue": {"en": "Value", "vi": "Giá trị", "ja": "金額", "zh": "金额"},
    "deals.commercialTerms": {"en": "Commercial Terms", "vi": "Điều khoản thương mại", "ja": "取引条件", "zh": "商业条款"},
    "deals.companyAccount": {"en": "Company Account", "vi": "Tài khoản công ty", "ja": "会社アカウント", "zh": "公司账户"},
    "deals.createdAt": {"en": "Created At", "vi": "Ngày tạo", "ja": "作成日", "zh": "创建时间"},
    "deals.dealControlPanel": {"en": "Deal Control Panel", "vi": "Bảng điều khiển giao dịch", "ja": "案件コントロールパネル", "zh": "交易控制面板"},
    "deals.dealValue": {"en": "Deal Value", "vi": "Giá trị giao dịch", "ja": "案件金額", "zh": "交易金额"},
    "deals.due": {"en": "Due", "vi": "Đến hạn", "ja": "期限", "zh": "到期"},
    "deals.editConfiguration": {"en": "Edit Configuration", "vi": "Chỉnh sửa cấu hình", "ja": "設定を編集", "zh": "编辑配置"},
    "deals.errorMilestonesValidation": {"en": "Please complete all milestones before saving", "vi": "Vui lòng hoàn thành tất cả các mốc trước khi lưu", "ja": "保存前にすべてのマイルストーンを完了してください", "zh": "请在保存前完成所有里程碑"},
    "deals.errorTotalPercent": {"en": "Total percentage must equal 100%", "vi": "Tổng tỷ lệ phần trăm phải bằng 100%", "ja": "合計パーセンテージは100%である必要があります", "zh": "总百分比必须为100%"},
    "deals.noMilestonesEditing": {"en": "No milestones added yet. Add milestones below.", "vi": "Chưa có mốc nào. Thêm mốc bên dưới.", "ja": "マイルストーンがまだ追加されていません。以下で追加してください。", "zh": "尚未添加里程碑。请在下方添加。"},
    "deals.noMilestonesView": {"en": "No milestones configured", "vi": "Chưa có mốc thanh toán", "ja": "マイルストーンが設定されていません", "zh": "未配置里程碑"},
    "deals.noNotes": {"en": "No notes", "vi": "Không có ghi chú", "ja": "メモはありません", "zh": "无备注"},
    "deals.notFound": {"en": "Deal not found", "vi": "Không tìm thấy giao dịch", "ja": "案件が見つかりません", "zh": "未找到交易"},
    "deals.owner": {"en": "Owner", "vi": "Chủ sở hữu", "ja": "所有者", "zh": "负责人"},
    "deals.paymentMilestonesSchedule": {"en": "Payment Milestones Schedule", "vi": "Lịch mốc thanh toán", "ja": "支払マイルストーンスケジュール", "zh": "付款里程碑计划"},
    "deals.paymentTermsDescription": {"en": "Payment Terms Description", "vi": "Mô tả điều khoản thanh toán", "ja": "支払条件の説明", "zh": "付款条款说明"},
    "deals.remove": {"en": "Remove", "vi": "Xóa", "ja": "削除", "zh": "移除"},
    "deals.representativeContact": {"en": "Representative Contact", "vi": "Liên hệ đại diện", "ja": "代表連絡先", "zh": "代表联系人"},
    "deals.reviewFeedbackNotes": {"en": "Review & Feedback Notes", "vi": "Ghi chú đánh giá & phản hồi", "ja": "レビューとフィードバックメモ", "zh": "审查与反馈备注"},
    "deals.reviewModalDescription": {"en": "Submit this deal for internal review and approval", "vi": "Gửi giao dịch này để xem xét và phê duyệt nội bộ", "ja": "この案件を内部レビューと承認に提出", "zh": "提交此交易进行内部审查和批准"},
    "deals.reviewNotes": {"en": "Review Notes", "vi": "Ghi chú đánh giá", "ja": "レビューメモ", "zh": "审查备注"},
    "deals.reviewNotesPlaceholder": {"en": "Enter review notes...", "vi": "Nhập ghi chú đánh giá...", "ja": "レビューメモを入力...", "zh": "输入审查备注..."},
    "deals.revision": {"en": "Revision", "vi": "Phiên bản", "ja": "改訂", "zh": "修订"},
    "deals.saveConfiguration": {"en": "Save Configuration", "vi": "Lưu cấu hình", "ja": "設定を保存", "zh": "保存配置"},
    "deals.scopeItemsDetails": {"en": "Scope Items Details", "vi": "Chi tiết phạm vi công việc", "ja": "スコープ項目詳細", "zh": "范围项目详情"},
    "deals.standard": {"en": "Standard", "vi": "Tiêu chuẩn", "ja": "標準", "zh": "标准"},
    "deals.status": {"en": "Status", "vi": "Trạng thái", "ja": "ステータス", "zh": "状态"},
    "deals.stepClosedWon": {"en": "Closed Won", "vi": "Đã chốt", "ja": "成約", "zh": "已成交"},
    "deals.stepCustomerReview": {"en": "Customer Review", "vi": "Khách hàng xem xét", "ja": "顧客レビュー", "zh": "客户审查"},
    "deals.stepDescContractSigned": {"en": "Contract has been signed by all parties", "vi": "Hợp đồng đã được ký bởi tất cả các bên", "ja": "契約が全当事者によって署名されました", "zh": "合同已由各方签署"},
    "deals.stepDescDocuSign": {"en": "Send via DocuSign for e-signature", "vi": "Gửi qua DocuSign để ký điện tử", "ja": "DocuSignで電子署名を送信", "zh": "通过DocuSign发送以进行电子签名"},
    "deals.stepDescManagerApproval": {"en": "Awaiting manager approval", "vi": "Đang chờ phê duyệt quản lý", "ja": "マネージャーの承認待ち", "zh": "等待经理批准"},
    "deals.stepDescMilestones": {"en": "Configure payment milestones", "vi": "Cấu hình mốc thanh toán", "ja": "支払マイルストーンを設定", "zh": "配置付款里程碑"},
    "deals.stepDraft": {"en": "Draft", "vi": "Bản nháp", "ja": "下書き", "zh": "草稿"},
    "deals.stepInternalReview": {"en": "Internal Review", "vi": "Đánh giá nội bộ", "ja": "内部レビュー", "zh": "内部审查"},
    "deals.submitForInternalApproval": {"en": "Submit for Internal Approval", "vi": "Trình phê duyệt nội bộ", "ja": "内部承認に提出", "zh": "提交内部审批"},
    "deals.submitForReview": {"en": "Submit for Review", "vi": "Trình đánh giá", "ja": "レビューに提出", "zh": "提交审查"},
    "deals.tabOverview": {"en": "Overview", "vi": "Tổng quan", "ja": "概要", "zh": "概览"},
    "deals.tabPaymentMilestoneConfig": {"en": "Payment Milestones", "vi": "Mốc thanh toán", "ja": "支払マイルストーン", "zh": "付款里程碑"},
    "deals.tabScopeSnapshot": {"en": "Scope Snapshot", "vi": "Phạm vi công việc", "ja": "スコープスナップショット", "zh": "范围快照"},

    # ===================== contracts =====================
    "contracts.title": {"en": "Contracts", "vi": "Hợp đồng", "ja": "契約", "zh": "合同"},
    "contracts.subtitle": {"en": "Manage contracts and e-signatures", "vi": "Quản lý hợp đồng và chữ ký điện tử", "ja": "契約と電子署名の管理", "zh": "管理合同和电子签名"},
    "contracts.autoCreate": {"en": "Auto-create from Quote", "vi": "Tự động tạo từ Báo giá", "ja": "見積書から自動作成", "zh": "从报价单自动创建"},
    "contracts.filters": {"en": "Filters", "vi": "Bộ lọc", "ja": "フィルター", "zh": "筛选"},
    "contracts.manage": {"en": "Manage", "vi": "Quản lý", "ja": "管理", "zh": "管理"},
    "contracts.signDigitally": {"en": "Sign Digitally", "vi": "Ký điện tử", "ja": "電子署名", "zh": "数字签名"},
    "contracts.searchPlaceholder": {"en": "Search contracts...", "vi": "Tìm kiếm hợp đồng...", "ja": "契約を検索...", "zh": "搜索合同..."},
    "contracts.advancedFilters": {"en": "Advanced Filters", "vi": "Bộ lọc nâng cao", "ja": "高度なフィルター", "zh": "高级筛选"},
    "contracts.contractStatus": {"en": "Contract Status", "vi": "Trạng thái hợp đồng", "ja": "契約ステータス", "zh": "合同状态"},
    "contracts.contractCode": {"en": "Contract Code", "vi": "Mã hợp đồng", "ja": "契約コード", "zh": "合同编号"},
    "contracts.titleCustomer": {"en": "Customer", "vi": "Khách hàng", "ja": "顧客", "zh": "客户"},
    "contracts.type": {"en": "Type", "vi": "Loại", "ja": "種別", "zh": "类型"},
    "contracts.value": {"en": "Value", "vi": "Giá trị", "ja": "金額", "zh": "金额"},
    "contracts.signingDeadline": {"en": "Signing Deadline", "vi": "Hạn ký", "ja": "署名期限", "zh": "签署截止日期"},
    "contracts.typeServiceAgreement": {"en": "Service Agreement", "vi": "Hợp đồng dịch vụ", "ja": "サービス契約", "zh": "服务协议"},
    "contracts.typeNda": {"en": "NDA", "vi": "NDA", "ja": "NDA", "zh": "保密协议"},
    "contracts.typeSow": {"en": "SOW", "vi": "SOW", "ja": "SOW", "zh": "工作说明书"},
    "contracts.typeAmendment": {"en": "Amendment", "vi": "Sửa đổi", "ja": "修正", "zh": "修订"},
    "contracts.statusDraft": {"en": "Draft", "vi": "Bản nháp", "ja": "下書き", "zh": "草稿"},
    "contracts.statusSent": {"en": "Sent", "vi": "Đã gửi", "ja": "送信済み", "zh": "已发送"},
    "contracts.statusSigned": {"en": "Signed", "vi": "Đã ký", "ja": "署名済み", "zh": "已签署"},
    "contracts.statusExpired": {"en": "Expired", "vi": "Hết hạn", "ja": "期限切れ", "zh": "已过期"},
    "contracts.statusDeclined": {"en": "Declined", "vi": "Từ chối", "ja": "拒否", "zh": "已拒绝"},
    "contracts.statusVoided": {"en": "Voided", "vi": "Vô hiệu", "ja": "無効", "zh": "已作废"},
    # contracts detail
    "contracts.activated": {"en": "Activated", "vi": "Đã kích hoạt", "ja": "アクティブ化済み", "zh": "已激活"},
    "contracts.additionalLegalNotes": {"en": "Additional Legal Notes", "vi": "Ghi chú pháp lý bổ sung", "ja": "追加法的メモ", "zh": "附加法律备注"},
    "contracts.authorizedSignatory": {"en": "Authorized Signatory", "vi": "Người ký ủy quyền", "ja": "権限のある署名者", "zh": "授权签署人"},
    "contracts.breadcrumbContracts": {"en": "Contracts", "vi": "Hợp đồng", "ja": "契約", "zh": "合同"},
    "contracts.cancel": {"en": "Cancel", "vi": "Hủy", "ja": "キャンセル", "zh": "取消"},
    "contracts.colActions": {"en": "Actions", "vi": "Thao tác", "ja": "アクション", "zh": "操作"},
    "contracts.colAmount": {"en": "Amount", "vi": "Số tiền", "ja": "金額", "zh": "金额"},
    "contracts.colInvoiceCode": {"en": "Invoice Code", "vi": "Mã hóa đơn", "ja": "請求書コード", "zh": "发票编号"},
    "contracts.colPaymentDate": {"en": "Payment Date", "vi": "Ngày thanh toán", "ja": "支払日", "zh": "付款日期"},
    "contracts.colPaymentDueDate": {"en": "Due Date", "vi": "Ngày đến hạn", "ja": "支払期限", "zh": "到期日"},
    "contracts.colPaymentMilestone": {"en": "Milestone", "vi": "Mốc thanh toán", "ja": "マイルストーン", "zh": "里程碑"},
    "contracts.colStatus": {"en": "Status", "vi": "Trạng thái", "ja": "ステータス", "zh": "状态"},
    "contracts.docuSignConnect": {"en": "DocuSign Connect", "vi": "Kết nối DocuSign", "ja": "DocuSign接続", "zh": "DocuSign连接"},
    "contracts.docuSignControls": {"en": "DocuSign Controls", "vi": "Điều khiển DocuSign", "ja": "DocuSign操作", "zh": "DocuSign控制"},
    "contracts.envelopeId": {"en": "Envelope ID", "vi": "Mã Envelope", "ja": "エンベロープID", "zh": "信封ID"},
    "contracts.forceSignContract": {"en": "Force Sign", "vi": "Buộc ký", "ja": "強制署名", "zh": "强制签署"},
    "contracts.generateEnvelope": {"en": "Generate Envelope", "vi": "Tạo Envelope", "ja": "エンベロープ生成", "zh": "生成信封"},
    "contracts.invoicePaymentSchedule": {"en": "Invoice Payment Schedule", "vi": "Lịch thanh toán hóa đơn", "ja": "請求書支払スケジュール", "zh": "发票付款计划"},
    "contracts.legalEntityCustomer": {"en": "Legal Entity / Customer", "vi": "Pháp nhân / Khách hàng", "ja": "法人/顧客", "zh": "法律实体/客户"},
    "contracts.loading": {"en": "Loading...", "vi": "Đang tải...", "ja": "読み込み中...", "zh": "加载中..."},
    "contracts.noLegalNotes": {"en": "No legal notes", "vi": "Không có ghi chú pháp lý", "ja": "法的メモはありません", "zh": "无法律备注"},
    "contracts.notFound": {"en": "Contract not found", "vi": "Không tìm thấy hợp đồng", "ja": "契約が見つかりません", "zh": "未找到合同"},
    "contracts.notGenerated": {"en": "Not generated", "vi": "Chưa tạo", "ja": "未生成", "zh": "未生成"},
    "contracts.signerError": {"en": "Signer Error", "vi": "Lỗi người ký", "ja": "署名者エラー", "zh": "签署人错误"},
    "contracts.signerModalDescription": {"en": "Enter the signer's email address to send the signing request", "vi": "Nhập email người ký để gửi yêu cầu ký", "ja": "署名者のメールアドレスを入力して署名リクエストを送信", "zh": "输入签署人的电子邮件地址以发送签署请求"},
    "contracts.startEnvelopeSign": {"en": "Start Signing", "vi": "Bắt đầu ký", "ja": "署名開始", "zh": "开始签署"},
    "contracts.startEnvelopeSignTitle": {"en": "Start Digital Signing", "vi": "Bắt đầu ký điện tử", "ja": "電子署名を開始", "zh": "开始数字签名"},
    "contracts.stepDraft": {"en": "Draft", "vi": "Bản nháp", "ja": "下書き", "zh": "草稿"},
    "contracts.stepSentToSign": {"en": "Sent to Sign", "vi": "Đã gửi ký", "ja": "署名送信済み", "zh": "已发送签署"},
    "contracts.stepSigned": {"en": "Signed", "vi": "Đã ký", "ja": "署名済み", "zh": "已签署"},
    "contracts.tabLegalClauses": {"en": "Legal Clauses", "vi": "Điều khoản pháp lý", "ja": "法的条項", "zh": "法律条款"},
    "contracts.tabOverview": {"en": "Overview", "vi": "Tổng quan", "ja": "概要", "zh": "概览"},
    "contracts.tabPaymentSchedule": {"en": "Payment Schedule", "vi": "Lịch thanh toán", "ja": "支払スケジュール", "zh": "付款计划"},
    "contracts.voidContract": {"en": "Void Contract", "vi": "Vô hiệu hợp đồng", "ja": "契約を無効化", "zh": "作废合同"},

    # ===================== payments =====================
    "payments.title": {"en": "Payments", "vi": "Thanh toán", "ja": "支払", "zh": "付款"},
    "payments.subtitle": {"en": "Track invoice payments and financial records", "vi": "Theo dõi thanh toán hóa đơn và hồ sơ tài chính", "ja": "請求書支払いと財務記録の追跡", "zh": "跟踪发票付款和财务记录"},
    "payments.filters": {"en": "Filters", "vi": "Bộ lọc", "ja": "フィルター", "zh": "筛选"},
    "payments.searchPlaceholder": {"en": "Search payments...", "vi": "Tìm kiếm thanh toán...", "ja": "支払を検索...", "zh": "搜索付款..."},
    "payments.advancedFilters": {"en": "Advanced Filters", "vi": "Bộ lọc nâng cao", "ja": "高度なフィルター", "zh": "高级筛选"},
    "payments.paymentStatus": {"en": "Payment Status", "vi": "Trạng thái thanh toán", "ja": "支払ステータス", "zh": "付款状态"},
    "payments.allStatuses": {"en": "All Statuses", "vi": "Tất cả trạng thái", "ja": "すべてのステータス", "zh": "所有状态"},
    "payments.loading": {"en": "Loading...", "vi": "Đang tải...", "ja": "読み込み中...", "zh": "加载中..."},
    "payments.statusPending": {"en": "Pending", "vi": "Chờ thanh toán", "ja": "未払い", "zh": "待付款"},
    "payments.statusPaid": {"en": "Paid", "vi": "Đã thanh toán", "ja": "支払済み", "zh": "已付款"},
    "payments.statusOverdue": {"en": "Overdue", "vi": "Quá hạn", "ja": "延滞", "zh": "逾期"},
    "payments.statusCancelled": {"en": "Cancelled", "vi": "Đã hủy", "ja": "キャンセル", "zh": "已取消"},
    "payments.autoGenerated": {"en": "Auto-generated from Contract", "vi": "Tự động tạo từ Hợp đồng", "ja": "契約から自動作成", "zh": "从合同自动生成"},
    "payments.invoiceCode": {"en": "Invoice Code", "vi": "Mã hóa đơn", "ja": "請求書コード", "zh": "发票编号"},
    "payments.paymentMilestone": {"en": "Payment Milestone", "vi": "Mốc thanh toán", "ja": "支払マイルストーン", "zh": "付款里程碑"},
    "payments.amount": {"en": "Amount", "vi": "Số tiền", "ja": "金額", "zh": "金额"},
    "payments.status": {"en": "Status", "vi": "Trạng thái", "ja": "ステータス", "zh": "状态"},
    "payments.dueDate": {"en": "Due Date", "vi": "Ngày đến hạn", "ja": "支払期限", "zh": "到期日"},
    "payments.paymentDate": {"en": "Payment Date", "vi": "Ngày thanh toán", "ja": "支払日", "zh": "付款日期"},
    "payments.actions": {"en": "Actions", "vi": "Thao tác", "ja": "アクション", "zh": "操作"},
    "payments.confirm": {"en": "Confirm", "vi": "Xác nhận", "ja": "確認", "zh": "确认"},
    "payments.details": {"en": "Details", "vi": "Chi tiết", "ja": "詳細", "zh": "详情"},
    # payments detail
    "payments.awaitingPayment": {"en": "Awaiting Payment", "vi": "Chờ thanh toán", "ja": "支払待ち", "zh": "等待付款"},
    "payments.bankTransfer": {"en": "Bank Transfer", "vi": "Chuyển khoản ngân hàng", "ja": "銀行振込", "zh": "银行转账"},
    "payments.billedTo": {"en": "Billed To", "vi": "Người được thanh toán", "ja": "請求先", "zh": "付款方"},
    "payments.billingMilestone": {"en": "Billing Milestone", "vi": "Mốc thanh toán", "ja": "請求マイルストーン", "zh": "计费里程碑"},
    "payments.breadcrumbPayments": {"en": "Payments", "vi": "Thanh toán", "ja": "支払", "zh": "付款"},
    "payments.cancelledVoid": {"en": "Cancelled / Void", "vi": "Đã hủy / Vô hiệu", "ja": "キャンセル/無効", "zh": "已取消/作废"},
    "payments.cleared": {"en": "Cleared", "vi": "Đã đối soát", "ja": "決済完了", "zh": "已结清"},
    "payments.clearedPayment": {"en": "Cleared Payment", "vi": "Thanh toán đã đối soát", "ja": "決済済み支払", "zh": "已结清付款"},
    "payments.client": {"en": "Client", "vi": "Khách hàng", "ja": "クライアント", "zh": "客户"},
    "payments.companyAddress": {"en": "Company Address", "vi": "Địa chỉ công ty", "ja": "会社住所", "zh": "公司地址"},
    "payments.companyContact": {"en": "Company Contact", "vi": "Liên hệ công ty", "ja": "会社連絡先", "zh": "公司联系人"},
    "payments.companyName": {"en": "Company Name", "vi": "Tên công ty", "ja": "会社名", "zh": "公司名称"},
    "payments.contractValue": {"en": "Contract Value", "vi": "Giá trị hợp đồng", "ja": "契約金額", "zh": "合同金额"},
    "payments.date": {"en": "Date", "vi": "Ngày", "ja": "日付", "zh": "日期"},
    "payments.dueBy": {"en": "Due By", "vi": "Hạn thanh toán", "ja": "支払期限", "zh": "到期日"},
    "payments.financeControls": {"en": "Finance Controls", "vi": "Điều khiển tài chính", "ja": "財務管理", "zh": "财务控制"},
    "payments.generatedFromDeal": {"en": "Generated from Deal", "vi": "Tạo từ Giao dịch", "ja": "案件から生成", "zh": "从交易生成"},
    "payments.generatingPrint": {"en": "Generating print document...", "vi": "Đang tạo tài liệu in...", "ja": "印刷ドキュメントを生成中...", "zh": "正在生成打印文档..."},
    "payments.invoice": {"en": "Invoice", "vi": "Hóa đơn", "ja": "請求書", "zh": "发票"},
    "payments.invoiceCancelled": {"en": "Invoice Cancelled", "vi": "Hóa đơn đã hủy", "ja": "請求書キャンセル", "zh": "发票已取消"},
    "payments.invoiceStatement": {"en": "Invoice Statement", "vi": "Sao kê hóa đơn", "ja": "請求書明細", "zh": "发票对账单"},
    "payments.milestoneBilling": {"en": "Milestone Billing", "vi": "Thanh toán theo mốc", "ja": "マイルストーン請求", "zh": "里程碑计费"},
    "payments.notFound": {"en": "Payment not found", "vi": "Không tìm thấy thanh toán", "ja": "支払が見つかりません", "zh": "未找到付款"},
    "payments.number": {"en": "Number", "vi": "Số", "ja": "番号", "zh": "编号"},
    "payments.paidOn": {"en": "Paid On", "vi": "Ngày thanh toán", "ja": "支払日", "zh": "付款日期"},
    "payments.paymentMethod": {"en": "Payment Method", "vi": "Phương thức thanh toán", "ja": "支払方法", "zh": "付款方式"},
    "payments.printStatement": {"en": "Print Statement", "vi": "In sao kê", "ja": "明細書を印刷", "zh": "打印对账单"},
    "payments.relatedEContract": {"en": "Related e-Contract", "vi": "Hợp đồng điện tử liên quan", "ja": "関連電子契約", "zh": "相关电子合同"},
    "payments.studioClient": {"en": "Studio Client", "vi": "Khách hàng Studio", "ja": "Studioクライアント", "zh": "Studio客户"},
    "payments.tabInvoiceInfo": {"en": "Invoice Info", "vi": "Thông tin hóa đơn", "ja": "請求書情報", "zh": "发票信息"},
    "payments.tabInvoiceStatement": {"en": "Invoice Statement", "vi": "Sao kê hóa đơn", "ja": "請求書明細", "zh": "发票对账单"},
    "payments.total": {"en": "Total", "vi": "Tổng cộng", "ja": "合計", "zh": "总计"},
    "payments.totalBill": {"en": "Total Bill", "vi": "Tổng hóa đơn", "ja": "請求合計", "zh": "账单总额"},
    "payments.xantivationClient": {"en": "Xantivation Client", "vi": "Khách hàng Xantivation", "ja": "Xantivationクライアント", "zh": "Xantivation客户"},

    # ===================== hooks =====================
    "hooks.lead.createdSuccess": {"en": "Lead created successfully!", "vi": "Tạo đầu mối thành công!", "ja": "リードを作成しました！", "zh": "潜在客户创建成功！"},
    "hooks.lead.creationFailed": {"en": "Lead creation failed!", "vi": "Tạo đầu mối thất bại!", "ja": "リードの作成に失敗しました！", "zh": "潜在客户创建失败！"},
    "hooks.lead.updatedSuccess": {"en": "Lead updated successfully!", "vi": "Cập nhật đầu mối thành công!", "ja": "リードを更新しました！", "zh": "潜在客户更新成功！"},
    "hooks.lead.updateFailed": {"en": "Lead update failed!", "vi": "Cập nhật đầu mối thất bại!", "ja": "リードの更新に失敗しました！", "zh": "潜在客户更新失败！"},
    "hooks.lead.convertedSuccess": {"en": "Lead converted successfully!", "vi": "Chuyển đổi đầu mối thành công!", "ja": "リードを変換しました！", "zh": "潜在客户转换成功！"},
    "hooks.lead.conversionFailed": {"en": "Lead conversion failed!", "vi": "Chuyển đổi đầu mối thất bại!", "ja": "リードの変換に失敗しました！", "zh": "潜在客户转换失败！"},
    "hooks.lead.activityRecorded": {"en": "Activity recorded successfully!", "vi": "Đã ghi lại hoạt động!", "ja": "アクティビティを記録しました！", "zh": "活动记录成功！"},
    "hooks.lead.deletedSuccess": {"en": "Lead deleted successfully!", "vi": "Xóa đầu mối thành công!", "ja": "リードを削除しました！", "zh": "潜在客户删除成功！"},
    "hooks.lead.deletionFailed": {"en": "Lead deletion failed!", "vi": "Xóa đầu mối thất bại!", "ja": "リードの削除に失敗しました！", "zh": "潜在客户删除失败！"},
    "hooks.lead.autoQualifySuccess": {"en": "Lead auto-qualified successfully!", "vi": "Tự động đánh giá đầu mối thành công!", "ja": "リードの自動評価に成功しました！", "zh": "潜在客户自动资格认定成功！"},
    "hooks.lead.autoQualifyFailed": {"en": "Lead auto-qualify failed!", "vi": "Tự động đánh giá đầu mối thất bại!", "ja": "リードの自動評価に失敗しました！", "zh": "潜在客户自动资格认定失败！"},
    "hooks.customer.createdSuccess": {"en": "Customer created successfully!", "vi": "Tạo khách hàng thành công!", "ja": "顧客を作成しました！", "zh": "客户创建成功！"},
    "hooks.customer.updatedSuccess": {"en": "Customer updated successfully!", "vi": "Cập nhật khách hàng thành công!", "ja": "顧客を更新しました！", "zh": "客户更新成功！"},
    "hooks.customer.updateFailed": {"en": "Customer update failed!", "vi": "Cập nhật khách hàng thất bại!", "ja": "顧客の更新に失敗しました！", "zh": "客户更新失败！"},
    "hooks.customer.deletedSuccess": {"en": "Customer deleted successfully!", "vi": "Xóa khách hàng thành công!", "ja": "顧客を削除しました！", "zh": "客户删除成功！"},
    "hooks.customer.deletionFailed": {"en": "Customer deletion failed!", "vi": "Xóa khách hàng thất bại!", "ja": "顧客の削除に失敗しました！", "zh": "客户删除失败！"},
    "hooks.customer.contactCreated": {"en": "Contact created successfully!", "vi": "Tạo liên hệ thành công!", "ja": "連絡先を作成しました！", "zh": "联系人创建成功！"},
    "hooks.customer.contactUpdated": {"en": "Contact updated successfully!", "vi": "Cập nhật liên hệ thành công!", "ja": "連絡先を更新しました！", "zh": "联系人更新成功！"},
    "hooks.customer.contactUpdateFailed": {"en": "Contact update failed!", "vi": "Cập nhật liên hệ thất bại!", "ja": "連絡先の更新に失敗しました！", "zh": "联系人更新失败！"},
    "hooks.customer.contactDeleted": {"en": "Contact deleted successfully!", "vi": "Xóa liên hệ thành công!", "ja": "連絡先を削除しました！", "zh": "联系人删除成功！"},
    "hooks.customer.contactDeletionFailed": {"en": "Contact deletion failed!", "vi": "Xóa liên hệ thất bại!", "ja": "連絡先の削除に失敗しました！", "zh": "联系人删除失败！"},
    "hooks.customer.primaryContactSet": {"en": "Primary contact set successfully!", "vi": "Đặt liên hệ chính thành công!", "ja": "プライマリ連絡先を設定しました！", "zh": "主要联系人设置成功！"},
    "hooks.deal.milestoneSaved": {"en": "Milestones saved successfully!", "vi": "Đã lưu mốc thanh toán!", "ja": "マイルストーンを保存しました！", "zh": "里程碑保存成功！"},
    "hooks.deal.milestoneFailed": {"en": "Failed to save milestones!", "vi": "Lưu mốc thanh toán thất bại!", "ja": "マイルストーンの保存に失敗しました！", "zh": "里程碑保存失败！"},
    "hooks.deal.approvalSent": {"en": "Approval request sent!", "vi": "Đã gửi yêu cầu phê duyệt!", "ja": "承認リクエストを送信しました！", "zh": "审批请求已发送！"},
    "hooks.deal.approvedWithContract": {"en": "Deal approved and contract generated!", "vi": "Giao dịch đã duyệt và hợp đồng đã tạo!", "ja": "案件が承認され、契約が生成されました！", "zh": "交易已批准，合同已生成！"},
    "hooks.quotation.createdSuccess": {"en": "Quotation created successfully!", "vi": "Tạo báo giá thành công!", "ja": "見積書を作成しました！", "zh": "报价单创建成功！"},
    "hooks.quotation.duplicatedSuccess": {"en": "Quotation duplicated successfully!", "vi": "Nhân bản báo giá thành công!", "ja": "見積書を複製しました！", "zh": "报价单复制成功！"},
    "hooks.quotation.statusUpdated": {"en": "Quotation status updated!", "vi": "Cập nhật trạng thái báo giá!", "ja": "見積書ステータスを更新しました！", "zh": "报价单状态已更新！"},
    "hooks.quotation.updatedSuccess": {"en": "Quotation updated successfully!", "vi": "Cập nhật báo giá thành công!", "ja": "見積書を更新しました！", "zh": "报价单更新成功！"},
    "hooks.contract.signingRequestSent": {"en": "Signing request sent!", "vi": "Đã gửi yêu cầu ký!", "ja": "署名リクエストを送信しました！", "zh": "签署请求已发送！"},
    "hooks.contract.manuallySigned": {"en": "Contract marked as signed!", "vi": "Hợp đồng đã được đánh dấu đã ký!", "ja": "契約を署名済みとしてマークしました！", "zh": "合同已标记为已签署！"},
    "hooks.contract.cancelled": {"en": "Contract cancelled!", "vi": "Hợp đồng đã hủy!", "ja": "契約をキャンセルしました！", "zh": "合同已取消！"},
    "hooks.contract.paymentConfirmed": {"en": "Payment confirmed for this contract!", "vi": "Đã xác nhận thanh toán cho hợp đồng này!", "ja": "この契約の支払いを確認しました！", "zh": "已确认此合同的付款！"},
    "hooks.opportunity.createdSuccess": {"en": "Opportunity created successfully!", "vi": "Tạo cơ hội thành công!", "ja": "案件を作成しました！", "zh": "商机创建成功！"},
    "hooks.opportunity.updatedSuccess": {"en": "Opportunity updated successfully!", "vi": "Cập nhật cơ hội thành công!", "ja": "案件を更新しました！", "zh": "商机更新成功！"},
    "hooks.opportunity.closedLost": {"en": "Opportunity closed as lost!", "vi": "Cơ hội đã đóng - mất!", "ja": "案件を失注としてクローズしました！", "zh": "商机已关闭为丢失！"},
    "hooks.opportunity.deletedSuccess": {"en": "Opportunity deleted successfully!", "vi": "Xóa cơ hội thành công!", "ja": "案件を削除しました！", "zh": "商机删除成功！"},
    "hooks.user.employeeCreated": {"en": "Employee created successfully!", "vi": "Tạo nhân viên thành công!", "ja": "従業員を作成しました！", "zh": "员工创建成功！"},
    "hooks.user.employeeCreationFailed": {"en": "Employee creation failed!", "vi": "Tạo nhân viên thất bại!", "ja": "従業員の作成に失敗しました！", "zh": "员工创建失败！"},
    "hooks.user.employeeUpdated": {"en": "Employee updated successfully!", "vi": "Cập nhật nhân viên thành công!", "ja": "従業員を更新しました！", "zh": "员工更新成功！"},
    "hooks.user.employeeUpdateFailed": {"en": "Employee update failed!", "vi": "Cập nhật nhân viên thất bại!", "ja": "従業員の更新に失敗しました！", "zh": "员工更新失败！"},
    "hooks.user.employeeDeleted": {"en": "Employee deleted successfully!", "vi": "Xóa nhân viên thành công!", "ja": "従業員を削除しました！", "zh": "员工删除成功！"},
    "hooks.user.employeeDeletionFailed": {"en": "Employee deletion failed!", "vi": "Xóa nhân viên thất bại!", "ja": "従業員の削除に失敗しました！", "zh": "员工删除失败！"},
    "hooks.user.profileUpdated": {"en": "Profile updated successfully!", "vi": "Cập nhật hồ sơ thành công!", "ja": "プロフィールを更新しました！", "zh": "个人资料更新成功！"},
    "hooks.user.profileUpdateFailed": {"en": "Profile update failed!", "vi": "Cập nhật hồ sơ thất bại!", "ja": "プロフィールの更新に失敗しました！", "zh": "个人资料更新失败！"},
    "hooks.user.salesTeamCreated": {"en": "Sales team created successfully!", "vi": "Tạo đội ngũ bán hàng thành công!", "ja": "営業チームを作成しました！", "zh": "销售团队创建成功！"},
    "hooks.user.salesTeamCreationFailed": {"en": "Sales team creation failed!", "vi": "Tạo đội ngũ bán hàng thất bại!", "ja": "営業チームの作成に失敗しました！", "zh": "销售团队创建失败！"},
    "hooks.user.salesTeamUpdated": {"en": "Sales team updated successfully!", "vi": "Cập nhật đội ngũ bán hàng thành công!", "ja": "営業チームを更新しました！", "zh": "销售团队更新成功！"},
    "hooks.user.salesTeamUpdateFailed": {"en": "Sales team update failed!", "vi": "Cập nhật đội ngũ bán hàng thất bại!", "ja": "営業チームの更新に失敗しました！", "zh": "销售团队更新失败！"},
    "hooks.user.salesTeamDeleted": {"en": "Sales team deleted successfully!", "vi": "Xóa đội ngũ bán hàng thành công!", "ja": "営業チームを削除しました！", "zh": "销售团队删除成功！"},
    "hooks.user.salesTeamDeletionFailed": {"en": "Sales team deletion failed!", "vi": "Xóa đội ngũ bán hàng thất bại!", "ja": "営業チームの削除に失敗しました！", "zh": "销售团队删除失败！"},
    "hooks.aiHub.documentUploaded": {"en": "Document uploaded successfully!", "vi": "Tải lên tài liệu thành công!", "ja": "ドキュメントをアップロードしました！", "zh": "文档上传成功！"},
    "hooks.aiHub.documentUploadFailed": {"en": "Document upload failed!", "vi": "Tải lên tài liệu thất bại!", "ja": "ドキュメントのアップロードに失敗しました！", "zh": "文档上传失败！"},
    "hooks.aiHub.memoryCleared": {"en": "Memory cleared!", "vi": "Đã xóa bộ nhớ!", "ja": "メモリをクリアしました！", "zh": "记忆已清除！"},
    "hooks.aiSettings.providerAdded": {"en": "LLM Provider added successfully!", "vi": "Đã thêm nhà cung cấp LLM!", "ja": "LLMプロバイダーを追加しました！", "zh": "LLM提供商添加成功！"},
    "hooks.aiSettings.providerUpdated": {"en": "LLM Provider updated successfully!", "vi": "Đã cập nhật nhà cung cấp LLM!", "ja": "LLMプロバイダーを更新しました！", "zh": "LLM提供商更新成功！"},
    "hooks.aiSettings.providerDeleted": {"en": "LLM Provider deleted!", "vi": "Đã xóa nhà cung cấp LLM!", "ja": "LLMプロバイダーを削除しました！", "zh": "LLM提供商已删除！"},
    "hooks.aiSettings.modelsScanned": {"en": "Models scanned successfully!", "vi": "Đã quét models thành công!", "ja": "モデルをスキャンしました！", "zh": "模型扫描成功！"},
    "hooks.aiSettings.apiKeySaved": {"en": "API Key saved successfully!", "vi": "Đã lưu API Key!", "ja": "APIキーを保存しました！", "zh": "API密钥保存成功！"},
    "hooks.aiSettings.apiKeyUpdated": {"en": "API Key updated successfully!", "vi": "Đã cập nhật API Key!", "ja": "APIキーを更新しました！", "zh": "API密钥更新成功！"},
    "hooks.aiSettings.apiKeyDeleted": {"en": "API Key deleted!", "vi": "Đã xóa API Key!", "ja": "APIキーを削除しました！", "zh": "API密钥已删除！"},
    "hooks.aiSettings.modelAdded": {"en": "Model added successfully!", "vi": "Đã thêm model!", "ja": "モデルを追加しました！", "zh": "模型添加成功！"},
    "hooks.aiSettings.modelDeleted": {"en": "Model deleted!", "vi": "Đã xóa model!", "ja": "モデルを削除しました！", "zh": "模型已删除！"},
    "hooks.aiSettings.agentCreated": {"en": "AI Agent created successfully!", "vi": "Đã tạo AI Agent!", "ja": "AIエージェントを作成しました！", "zh": "AI代理创建成功！"},
    "hooks.aiSettings.agentUpdated": {"en": "AI Agent updated!", "vi": "Đã cập nhật AI Agent!", "ja": "AIエージェントを更新しました！", "zh": "AI代理更新成功！"},
    "hooks.aiSettings.agentDeleted": {"en": "AI Agent deleted!", "vi": "Đã xóa AI Agent!", "ja": "AIエージェントを削除しました！", "zh": "AI代理已删除！"},

    # ===================== reports =====================
    "reports.amount": {"en": "Amount", "vi": "Số tiền", "ja": "金額", "zh": "金额"},
    "reports.avgTime": {"en": "Avg. Time", "vi": "Thời gian TB", "ja": "平均時間", "zh": "平均时长"},
    "reports.cashFlowPlannedVsActual": {"en": "Cash Flow: Planned vs Actual", "vi": "Dòng tiền: Kế hoạch vs Thực tế", "ja": "キャッシュフロー：計画対実績", "zh": "现金流：计划 vs 实际"},
    "reports.forecastDesc": {"en": "30-day revenue forecast based on pipeline data", "vi": "Dự báo doanh thu 30 ngày dựa trên dữ liệu pipeline", "ja": "パイプラインデータに基づく30日間収益予測", "zh": "基于管道数据的30天收入预测"},
    "reports.funnelStageDetail": {"en": "Funnel Stage Detail", "vi": "Chi tiết giai đoạn kênh", "ja": "ファネルステージ詳細", "zh": "漏斗阶段详情"},
    "reports.invoicePaymentTracking": {"en": "Invoice & Payment Tracking", "vi": "Theo dõi hóa đơn & thanh toán", "ja": "請求書・支払追跡", "zh": "发票和付款跟踪"},
    "reports.leadToCustomerConversion": {"en": "Lead-to-Customer Conversion", "vi": "Chuyển đổi đầu mối thành khách hàng", "ja": "リードから顧客への変換", "zh": "潜在客户到客户转化率"},
    "reports.oppCode": {"en": "Opp. Code", "vi": "Mã cơ hội", "ja": "案件コード", "zh": "商机编号"},
    "reports.oppName": {"en": "Opp. Name", "vi": "Tên cơ hội", "ja": "案件名", "zh": "商机名称"},
    "reports.period30d": {"en": "30 Days", "vi": "30 Ngày", "ja": "30日間", "zh": "30天"},
    "reports.period60d": {"en": "60 Days", "vi": "60 Ngày", "ja": "60日間", "zh": "60天"},
    "reports.period7d": {"en": "7 Days", "vi": "7 Ngày", "ja": "7日間", "zh": "7天"},
    "reports.period90d": {"en": "90 Days", "vi": "90 Ngày", "ja": "90日間", "zh": "90天"},
    "reports.periodYtd": {"en": "Year to Date", "vi": "Từ đầu năm", "ja": "年初来", "zh": "年初至今"},
    "reports.pipelineDesc": {"en": "Pipeline analytics and conversion metrics", "vi": "Phân tích pipeline và chỉ số chuyển đổi", "ja": "パイプライン分析と変換指標", "zh": "管道分析和转化指标"},
    "reports.pipelineReportSubtitle": {"en": "Real-time pipeline analytics and conversion tracking", "vi": "Phân tích pipeline thời gian thực và theo dõi chuyển đổi", "ja": "リアルタイムパイプライン分析と変換追跡", "zh": "实时管道分析和转化跟踪"},
    "reports.pipelineReportTitle": {"en": "Pipeline Report", "vi": "Báo cáo Pipeline", "ja": "パイプレポート", "zh": "管道报告"},
    "reports.salesForecastTitle": {"en": "Sales Forecast", "vi": "Dự báo doanh số", "ja": "売上予測", "zh": "销售预测"},
    "reports.salesStage": {"en": "Sales Stage", "vi": "Giai đoạn bán hàng", "ja": "販売ステージ", "zh": "销售阶段"},
    "reports.thirtyDayForecast": {"en": "30-Day Forecast", "vi": "Dự báo 30 ngày", "ja": "30日間予測", "zh": "30天预测"},
    "reports.value": {"en": "Value", "vi": "Giá trị", "ja": "金額", "zh": "金额"},
    "reports.viewBy": {"en": "View By", "vi": "Xem theo", "ja": "表示基準", "zh": "查看方式"},
    "reports.status": {"en": "Status", "vi": "Trạng thái", "ja": "ステータス", "zh": "状态"},

    # ===================== conversations =====================
    "conversations.anonymous": {"en": "Anonymous", "vi": "Ẩn danh", "ja": "匿名", "zh": "匿名"},
    "conversations.crmContextMatcher": {"en": "CRM Context Matcher", "vi": "Kết nối ngữ cảnh CRM", "ja": "CRMコンテキストマッチャー", "zh": "CRM上下文匹配器"},
    "conversations.formCompanyName": {"en": "Company Name", "vi": "Tên công ty", "ja": "会社名", "zh": "公司名称"},
    "conversations.formContactEmail": {"en": "Contact Email", "vi": "Email liên hệ", "ja": "連絡先メール", "zh": "联系邮箱"},
    "conversations.formCustomerName": {"en": "Customer Name", "vi": "Tên khách hàng", "ja": "顧客名", "zh": "客户姓名"},
    "conversations.formHasAuthority": {"en": "Has Authority", "vi": "Có thẩm quyền", "ja": "権限あり", "zh": "有权限"},
    "conversations.formHasBudget": {"en": "Has Budget", "vi": "Có ngân sách", "ja": "予算あり", "zh": "有预算"},
    "conversations.formPhoneNumber": {"en": "Phone Number", "vi": "Số điện thoại", "ja": "電話番号", "zh": "电话号码"},
    "conversations.formSpecificNeed": {"en": "Specific Need", "vi": "Nhu cầu cụ thể", "ja": "具体的なニーズ", "zh": "具体需求"},
    "conversations.quickCreateLead": {"en": "Quick Create Lead", "vi": "Tạo đầu mối nhanh", "ja": "クイックリード作成", "zh": "快速创建潜在客户"},
    "conversations.selectConversation": {"en": "Select a conversation", "vi": "Chọn một cuộc trò chuyện", "ja": "会話を選択", "zh": "选择对话"},
    "conversations.viewCustomerProfile": {"en": "View Customer Profile", "vi": "Xem hồ sơ khách hàng", "ja": "顧客プロフィールを表示", "zh": "查看客户资料"},
    "conversations.viewLeadProfile": {"en": "View Lead Profile", "vi": "Xem hồ sơ đầu mối", "ja": "リードプロフィールを表示", "zh": "查看潜在客户资料"},

    # ===================== header =====================
    "header.logoutSuccess": {"en": "Logged out successfully", "vi": "Đăng xuất thành công", "ja": "ログアウトしました", "zh": "已成功退出登录"},

    # ===================== dashboard =====================
    "dashboard.dashboard": {"en": "Dashboard", "vi": "Bảng điều khiển", "ja": "ダッシュボード", "zh": "仪表板"},
}

def deep_set(d, keys, value):
    """Set a nested dict value given a dotted key path."""
    parts = keys.split('.')
    for k in parts[:-1]:
        if k not in d:
            d[k] = {}
        d = d[k]
    d[parts[-1]] = value

def deep_get(d, keys):
    """Get a nested dict value given a dotted key path."""
    parts = keys.split('.')
    for k in parts:
        if isinstance(d, dict) and k in d:
            d = d[k]
        else:
            return None
    return d

# Apply translations to all languages
lang_data = {
    'en': en_data,
    'vi': vi_data,
    'ja': ja_data,
    'zh': zh_data,
}

added_count = 0
for key, trans in sorted(translations.items()):
    for lang in ['en', 'vi', 'ja', 'zh']:
        if deep_get(lang_data[lang], key) is None:
            deep_set(lang_data[lang], key, trans[lang])
            added_count += 1
        # else: already exists, skip

# Save files
for lang, data in [('en', en_data), ('vi', vi_data), ('ja', ja_data), ('zh', zh_data)]:
    path = os.path.join(LOCALES_DIR, lang, 'translation.json')
    save_json(path, data)
    count_keys = len(get_all_keys(data))
    print(f"✅ {lang}: saved {count_keys} keys")

print(f"\n✅ Added {added_count} translations total across all languages")
print(f"   ({len(translations)} unique keys)")
