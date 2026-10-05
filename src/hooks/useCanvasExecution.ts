'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { message } from 'antd';
import {
  useGenerateSocialPostContent,
  useCreateSocialPost,
  useApproveSocialPost,
  usePublishSocialPost,
} from './api/useMessagingConfig';
import { GeneratedPostData } from '@/components/content/canvas/ExecutionResultDrawer';

export function useCanvasExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPhase, setExecutionPhase] = useState<
    'idle' | 'generating' | 'streaming' | 'completed' | 'failed'
  >('idle');
  const [generatedPost, setGeneratedPost] = useState<GeneratedPostData | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const generateContentMutation = useGenerateSocialPostContent();
  const createPostMutation = useCreateSocialPost();
  const approvePostMutation = useApproveSocialPost();
  const publishPostMutation = usePublishSocialPost();

  // Timer loop
  useEffect(() => {
    if (isExecuting) {
      setElapsedSeconds(0);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExecuting]);

  // Trigger Hermes Pipeline
  const triggerExecution = useCallback(
    async (
      prompt: string,
      options: {
        autoPublish?: boolean;
        autonomous?: boolean;
        framework?: 'PAS' | 'AIDA' | 'BAB' | '4P' | 'StoryBrand' | 'auto';
        targetAudience?: string;
        tone?: string;
      } = {}
    ) => {
      try {
        setIsExecuting(true);
        setExecutionPhase('generating');
        setExecutionError(null);
        message.loading({
          content: 'Hermes Master Gateway đang kích hoạt Framework Copywriting & điều phối các Sub-Agents...',
          key: 'execution-status',
          duration: 3,
        });

        // 1. Call AI content generation with copywriting framework
        const result = await generateContentMutation.mutateAsync({
          prompt,
          framework: options.framework,
          targetAudience: options.targetAudience,
          tone: options.tone as any,
          includeVisualPrompt: true,
        });
        const duration = Date.now() - startTimeRef.current;

        const postTitle = result?.title || 'Bài viết truyền thông Xantivation CRM';
        const postContent = result?.content || prompt;
        const hashtags = result?.hashtags || ['#XantivationCRM', '#CRMCloud'];

        // 2. Persist post into database as pending_approval
        const savedPost = await createPostMutation.mutateAsync({
          title: postTitle,
          content: postContent,
          platform: 'facebook_post',
          channelName: 'Hermes Auto Content',
          status: options.autoPublish ? 'approved' : 'pending_approval',
          copywritingFramework: result?.copywritingFramework || options.framework,
          targetAudience: result?.targetAudience || options.targetAudience,
          hashtags,
        });

        const newPostData: GeneratedPostData = {
          postId: savedPost?.id,
          title: postTitle,
          content: postContent,
          hashtags,
          platform: 'facebook_post',
          durationMs: duration,
          copywritingFramework: result?.copywritingFramework || options.framework,
          visualPrompt: result?.visualPrompt,
          targetAudience: result?.targetAudience || options.targetAudience,
          estimatedReadingTime: result?.estimatedReadingTime,
        };

        setGeneratedPost(newPostData);
        setExecutionPhase('completed');
        setIsExecuting(false);

        message.success({
          content: `Hermes Pipeline (${result?.copywritingFramework || 'AIDA'}) hoàn tất xuất sắc trong ${(duration / 1000).toFixed(1)}s!`,
          key: 'execution-status',
        });

        // 3. If autoPublish option is checked, trigger publish
        if (options.autoPublish && savedPost?.id) {
          try {
            await publishPostMutation.mutateAsync(savedPost.id);
            message.success('Đã tự động đăng bài viết lên Facebook thành công!');
          } catch (pubErr: any) {
            message.warning(
              pubErr?.response?.data?.message ||
                'Bài viết đã lưu, nhưng chưa đăng được Facebook (Vui lòng kiểm tra Access Token).'
            );
          }
        }
      } catch (err: any) {
        setIsExecuting(false);
        setExecutionPhase('failed');
        const errMsg =
          err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi thực thi Hermes Pipeline';
        setExecutionError(errMsg);
        message.error({ content: errMsg, key: 'execution-status' });
      }
    },
    [generateContentMutation, createPostMutation, publishPostMutation]
  );

  // Approve Post
  const approvePost = useCallback(
    async (
      action: 'approve' | 'approve_and_publish',
      edits?: { title: string; content: string }
    ) => {
      if (!generatedPost?.postId) {
        message.error('Không tìm thấy mã bài viết để duyệt');
        return;
      }

      try {
        await approvePostMutation.mutateAsync({
          id: generatedPost.postId,
          payload: {
            action,
            editedTitle: edits?.title,
            editedContent: edits?.content,
          },
        });
        message.success(
          action === 'approve_and_publish'
            ? 'Đã duyệt và đăng bài viết thành công!'
            : 'Đã duyệt và lưu bài viết vào danh sách nháp!'
        );
      } catch (err: any) {
        const errMsg = err?.response?.data?.message || err?.message || 'Không thể duyệt bài viết';
        message.error(errMsg);
        throw err;
      }
    },
    [generatedPost, approvePostMutation]
  );

  // Regenerate with feedback
  const regeneratePost = useCallback(
    async (feedback: string) => {
      if (!generatedPost) return;
      const revisedPrompt = `Chỉnh sửa bài viết "${generatedPost.title}" theo yêu cầu: ${feedback}. Nội dung gốc: ${generatedPost.content}`;
      await triggerExecution(revisedPrompt);
    },
    [generatedPost, triggerExecution]
  );

  const resetExecution = useCallback(() => {
    setIsExecuting(false);
    setExecutionPhase('idle');
    setGeneratedPost(null);
    setElapsedSeconds(0);
    setExecutionError(null);
  }, []);

  return {
    isExecuting,
    executionPhase,
    generatedPost,
    elapsedSeconds,
    executionError,
    triggerExecution,
    approvePost,
    regeneratePost,
    resetExecution,
  };
}
