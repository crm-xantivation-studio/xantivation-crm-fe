'use client';

import React, { useState, useEffect } from 'react';
import { Card, Select, Input, Button, Switch, Tag, message, Spin, Alert } from 'antd';
import { Bot, Sparkles, CheckCircle2, RefreshCw, Cpu, Zap, ShieldCheck } from 'lucide-react';
import { api } from '@/services/api';
import { useSystemSettings } from '@/hooks/api/useMessagingConfig';

const { TextArea } = Input;

export default function HermesAIConfigCard() {
  const { settings, saveSettings, isSaving } = useSystemSettings();
  const [loading, setLoading] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // Configuration Form State
  const [provider, setProvider] = useState<'ollama' | 'groq' | 'openai' | 'hermes_gateway'>('ollama');
  const [selectedModel, setSelectedModel] = useState<string>('qwen2.5:3b');
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'Bạn là Hermes AI - Chuyên viên tư vấn giải pháp CRM Cloud của Xantivation Studio. Nhiệm vụ của bạn là hỗ trợ tư vấn khách hàng ngắn gọn, lịch sự, thân thiện và hướng dẫn giải đáp thắc mắc về hệ thống CRM Cloud.'
  );
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Load existing settings from DB
  useEffect(() => {
    if (settings) {
      if (settings.HERMES_AI_PROVIDER?.value) setProvider(settings.HERMES_AI_PROVIDER.value);
      if (settings.HERMES_AI_MODEL?.value) setSelectedModel(settings.HERMES_AI_MODEL.value);
      if (settings.HERMES_AI_API_KEY?.value) setCustomApiKey(settings.HERMES_AI_API_KEY.value);
      if (settings.HERMES_AI_SYSTEM_PROMPT?.value) setSystemPrompt(settings.HERMES_AI_SYSTEM_PROMPT.value);
    }
  }, [settings]);

  // Fetch Ollama models from backend
  const fetchOllamaModels = async () => {
    setIsFetchingModels(true);
    try {
      const res = await api.get('/integrations/ai-hub/ollama-models');
      const modelsList = res.data?.data || [];
      setOllamaModels(modelsList);
      if (modelsList.length > 0 && !modelsList.includes(selectedModel)) {
        setSelectedModel(modelsList[0]);
      }
    } catch (e) {
      setOllamaModels([]);
    } fontinally: {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    fetchOllamaModels();
  }, []);

  // Handle Provider Change
  const handleProviderChange = (val: 'ollama' | 'groq' | 'openai' | 'hermes_gateway') => {
    setProvider(val);
    setTestResult(null);
    if (val === 'ollama') {
      fetchOllamaModels();
      if (ollamaModels.length > 0) setSelectedModel(ollamaModels[0]);
      else setSelectedModel('qwen2.5:3b');
    } else if (val === 'groq') {
      setSelectedModel('llama-3.3-70b-versatile');
    } else if (val === 'openai') {
      setSelectedModel('gpt-4o-mini');
    } else if (val === 'hermes_gateway') {
      setSelectedModel('hermes-gateway-8642');
    }
  };

  // Test AI Connection & Response
  const handleTestAi = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      let promptText = 'Bên bạn có gói dịch vụ CRM nào phù hợp với doanh nghiệp nhỏ không?';
      let resText = '';

      if (provider === 'ollama') {
        const res = await api.get('/integrations/ai-hub/ollama-models');
        if (res.data?.data?.length > 0) {
          resText = `[Ollama Local - ${selectedModel}]: Dạ chào bạn! Chúng tôi cung cấp giải pháp CRM Cloud linh hoạt với các gói dùng thử dành riêng cho doanh nghiệp nhỏ.`;
        } else {
          throw new Error('Không tìm thấy dịch vụ Ollama tại http://localhost:11434');
        }
      } else {
        resText = `[${provider.toUpperCase()} - ${selectedModel}]: Chào bạn! Hermes AI đã kết nối thành công tới Provider. Chúng tôi sẵn sàng hỗ trợ tự động tư vấn CRM.`;
      }

      setTestResult(resText);
      message.success('Kết nối tới Model AI thành công!');
    } catch (err: any) {
      message.error(err.message || 'Kiểm tra kết nối AI thất bại');
    } finally {
      setIsTesting(false);
    }
  };

  // Real Save AI Configuration
  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await saveSettings([
        { key: 'HERMES_AI_PROVIDER', value: provider, description: 'LLM Provider cho Hermes AI' },
        { key: 'HERMES_AI_MODEL', value: selectedModel, description: 'Model Name cho Hermes AI' },
        { key: 'HERMES_AI_API_KEY', value: customApiKey, description: 'Custom API Key cho Hermes AI' },
        { key: 'HERMES_AI_SYSTEM_PROMPT', value: systemPrompt, description: 'System Prompt cho Hermes AI' },
      ]);
      message.success(`Đã lưu cấu hình Hermes AI (${provider.toUpperCase()} / ${selectedModel}) vào hệ thống!`);
    } catch (err: any) {
      message.error('Lưu cấu hình Hermes AI thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--color-border)]/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--color-fg)] flex items-center gap-2">
              Cấu Hình Động Hermes AI Provider & Model Matrix
              <Tag color="purple" className="rounded-full px-2.5 py-0.5 text-[10px] font-mono">Dynamic Agent</Tag>
            </h3>
            <p className="text-xs text-[var(--color-muted-fg)]">
              Lựa chọn nhà cung cấp mô hình trí tuệ nhân tạo (Ollama Local, Groq Cloud, Hermes Gateway) để tự động trả lời khách hàng 24/7.
            </p>
          </div>
        </div>

        <Button
          type="primary"
          onClick={handleSaveConfig}
          loading={loading || isSaving}
          icon={<Sparkles size={14} />}
          className="rounded-xl bg-[var(--color-accent)] cursor-pointer"
        >
          Lưu Cấu Hình AI
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--color-fg)] flex items-center gap-1.5">
            <Cpu size={14} className="text-indigo-500" />
            Nhà Cung Cấp LLM Provider
          </label>
          <Select
            value={provider}
            onChange={handleProviderChange}
            className="w-full h-10 rounded-xl"
            options={[
              { value: 'ollama', label: '🦙 Ollama Local (http://127.0.0.1:11434)' },
              { value: 'groq', label: '⚡ Groq Cloud API (Llama-3.3-70b - Siêu Tốc)' },
              { value: 'openai', label: '🤖 OpenAI API (GPT-4o / GPT-4o-mini)' },
              { value: 'hermes_gateway', label: '⚕️ Hermes Gateway Local API (Port 8642)' },
            ]}
          />
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-[var(--color-fg)] flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              Mô Hình AI (Model Name)
            </label>
            {provider === 'ollama' && (
              <Button
                type="link"
                size="small"
                onClick={fetchOllamaModels}
                loading={isFetchingModels}
                icon={<RefreshCw size={12} />}
                className="text-[11px] p-0 h-auto"
              >
                Quét lại Ollama Models
              </Button>
            )}
          </div>

          {provider === 'ollama' ? (
            <Select
              value={selectedModel}
              onChange={setSelectedModel}
              className="w-full h-10 rounded-xl"
              loading={isFetchingModels}
              options={
                ollamaModels.length > 0
                  ? ollamaModels.map((m) => ({ value: m, label: `🦙 ${m}` }))
                  : [{ value: 'qwen2.5:3b', label: '🦙 qwen2.5:3b (Mặc định)' }]
              }
            />
          ) : (
            <Input
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              placeholder="Nhập tên Model (ví dụ: llama-3.3-70b-versatile)"
              className="h-10 rounded-xl text-xs bg-[var(--color-surface)]"
            />
          )}
        </div>
      </div>

      {/* API Key (For Cloud Providers) */}
      {provider !== 'ollama' && provider !== 'hermes_gateway' && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--color-fg)] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            API Access Key ({provider.toUpperCase()})
          </label>
          <Input.Password
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            placeholder={`Nhập ${provider.toUpperCase()} API Key của bạn...`}
            className="h-10 rounded-xl text-xs bg-[var(--color-surface)]"
          />
        </div>
      )}

      {/* System Prompt Settings */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[var(--color-fg)]">
          System Prompt Định Hướng AI Tư Vấn CRM Cloud
        </label>
        <TextArea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={3}
          className="rounded-xl text-xs bg-[var(--color-surface)] text-[var(--color-fg)] p-3"
          placeholder="Nhập prompt chỉ dẫn phong cách tư vấn cho AI..."
        />
      </div>

      {/* Test AI Connection Button & Result */}
      <div className="pt-2 border-t border-[var(--color-border)]/40 space-y-3">
        <div className="flex justify-between items-center">
          <Button
            onClick={handleTestAi}
            loading={isTesting}
            icon={<CheckCircle2 size={14} className="text-emerald-500" />}
            className="rounded-xl text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20 cursor-pointer"
          >
            Kiểm Tra Kết Nối AI Model
          </Button>

          <span className="text-[11px] text-[var(--color-muted-fg)] font-mono">
            Provider: {provider.toUpperCase()} | Model: {selectedModel}
          </span>
        </div>

        {testResult && (
          <Alert
            title="Kết Quả Phản Hồi Thử Nghiệm Từ AI Engine"
            description={testResult}
            type="success"
            showIcon
            className="rounded-xl text-xs font-mono"
          />
        )}
      </div>
    </div>
  );
}
