import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Reply, Trash2, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id: string | null;
  user_name: string;
  replies?: Comment[];
}

interface BlogCommentsProps {
  blogPostId: string;
}

export const BlogComments = ({ blogPostId }: BlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    
    // Subscribe to comment changes
    const channel = supabase
      .channel('blog-comments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'blog_comments',
        filter: `blog_post_id=eq.${blogPostId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [blogPostId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        parent_comment_id,
        profiles:user_id (name)
      `)
      .eq('blog_post_id', blogPostId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    // Transform data and organize into threaded structure
    const commentsWithNames = data.map((comment: any) => ({
      ...comment,
      user_name: comment.profiles?.name || 'Anonymous',
    }));

    // Organize into parent-child structure
    const parentComments = commentsWithNames.filter(c => !c.parent_comment_id);
    const organized = parentComments.map(parent => ({
      ...parent,
      replies: commentsWithNames.filter(c => c.parent_comment_id === parent.id),
    }));

    setComments(organized);
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: t("loginRequired") || "Login required",
        description: t("loginToComment") || "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('blog_comments')
      .insert({
        blog_post_id: blogPostId,
        user_id: user.id,
        content: newComment,
      });

    setLoading(false);

    if (error) {
      toast({
        title: t("error") || "Error",
        description: t("commentError") || "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setNewComment("");
    toast({
      title: t("success") || "Success",
      description: t("commentPosted") || "Your comment has been posted.",
    });
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('blog_comments')
      .insert({
        blog_post_id: blogPostId,
        user_id: user.id,
        content: replyContent,
        parent_comment_id: parentId,
      });

    setLoading(false);

    if (error) {
      toast({
        title: t("error") || "Error",
        description: t("replyError") || "Failed to post reply. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setReplyTo(null);
    setReplyContent("");
    toast({
      title: t("success") || "Success",
      description: t("replyPosted") || "Your reply has been posted.",
    });
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('blog_comments')
      .update({ content: editContent })
      .eq('id', commentId);

    setLoading(false);

    if (error) {
      toast({
        title: t("error") || "Error",
        description: t("updateError") || "Failed to update comment.",
        variant: "destructive",
      });
      return;
    }

    setEditingId(null);
    setEditContent("");
    toast({
      title: t("success") || "Success",
      description: t("commentUpdated") || "Your comment has been updated.",
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t("confirmDelete") || "Are you sure you want to delete this comment?")) return;

    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast({
        title: t("error") || "Error",
        description: t("deleteError") || "Failed to delete comment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("success") || "Success",
      description: t("commentDeleted") || "Comment has been deleted.",
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 mt-4' : 'mt-4'} border-l-2 border-border pl-4`}>
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback>{comment.user_name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-foreground">{comment.user_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {editingId === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdateComment(comment.id)} disabled={loading}>
                  {t("save") || "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  {t("cancel") || "Cancel"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground mb-2">{comment.content}</p>
              <div className="flex gap-2">
                {user && !isReply && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyTo(comment.id)}
                    className="h-7 gap-1 text-xs"
                  >
                    <Reply className="w-3 h-3" />
                    {t("reply") || "Reply"}
                  </Button>
                )}
                {user?.id === comment.user_id && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="h-7 gap-1 text-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      {t("edit") || "Edit"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="h-7 gap-1 text-xs text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t("delete") || "Delete"}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}

          {replyTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t("writeReply") || "Write your reply..."}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={loading}>
                  {t("postReply") || "Post Reply"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyTo(null)}>
                  {t("cancel") || "Cancel"}
                </Button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="border-t border-border pt-8 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">
          {t("comments") || "Comments"} ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {user ? (
        <div className="mb-6 space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("writeComment") || "Write a comment..."}
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmitComment} disabled={loading || !newComment.trim()}>
            {t("postComment") || "Post Comment"}
          </Button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">
            {t("loginToComment") || "Please log in to leave a comment."}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t("noComments") || "No comments yet. Be the first to comment!"}
          </p>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </div>
    </div>
  );
};
