import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  MessageCircle,
  ChevronRight,
  Search,
  Filter,
  User as UserIcon,
  Clock,
  Tag,
  ArrowLeft,
  Send,
  LogIn,
  Trash2,
} from "lucide-react";
import {
  db,
  auth,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
  signInWithGoogle,
  FirebaseUser,
  handleFirestoreError,
  OperationType,
} from "../firebase";
import { TRANSLATIONS } from "../constants";
import { Badge } from "../App";

interface ForumProps {
  lang: "en" | "fr" | "tn";
  user: FirebaseUser | null;
  isAuthReady: boolean;
  userProfile: any;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: any;
  likes: number;
}

interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: any;
}

export default function Forum({
  lang,
  user,
  isAuthReady,
  userProfile,
}: ForumProps) {
  const t = TRANSLATIONS[lang];
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("general");
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    {
      id: "all",
      label: lang === "tn" ? "الكل" : lang === "fr" ? "Tout" : "All",
      icon: <Filter className="w-4 h-4" />,
    },
    {
      id: "olive",
      label: t.forumCategoryOlive,
      icon: <div className="w-2 h-2 bg-green-600 rounded-full" />,
    },
    {
      id: "citrus",
      label: t.forumCategoryCitrus,
      icon: <div className="w-2 h-2 bg-orange-500 rounded-full" />,
    },
    {
      id: "cereal",
      label: t.forumCategoryCereal,
      icon: <div className="w-2 h-2 bg-yellow-600 rounded-full" />,
    },
    {
      id: "general",
      label: t.forumCategoryGeneral,
      icon: <div className="w-2 h-2 bg-blue-500 rounded-full" />,
    },
  ];

  useEffect(() => {
    let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    if (activeCategory !== "all") {
      q = query(
        collection(db, "posts"),
        where("category", "==", activeCategory),
        orderBy("createdAt", "desc"),
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Post,
        );
        setPosts(postsData);
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "posts");
      },
    );

    return () => unsubscribe();
  }, [activeCategory]);

  useEffect(() => {
    if (selectedPost) {
      const q = query(
        collection(db, "posts", selectedPost.id, "comments"),
        orderBy("createdAt", "asc"),
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const commentsData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Comment,
          );
          setComments(commentsData);
        },
        (error) => {
          handleFirestoreError(
            error,
            OperationType.LIST,
            `posts/${selectedPost.id}/comments`,
          );
        },
      );
      return () => unsubscribe();
    }
  }, [selectedPost]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      await addDoc(collection(db, "posts"), {
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        authorId: user.uid,
        authorName: user.displayName || "Farmer",
        authorPhoto: user.photoURL || "",
        createdAt: Timestamp.now(),
        likes: 0,
      });
      setIsNewPostModalOpen(false);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("general");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "posts");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPost || !newComment.trim()) return;

    try {
      await addDoc(collection(db, "posts", selectedPost.id, "comments"), {
        postId: selectedPost.id,
        content: newComment,
        authorId: user.uid,
        authorName: user.displayName || "Farmer",
        authorPhoto: user.photoURL || "",
        createdAt: Timestamp.now(),
      });
      setNewComment("");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `posts/${selectedPost.id}/comments`,
      );
    }
  };

  const handleLikePost = async (post: Post) => {
    if (!user) return;
    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        likes: (post.likes || 0) + 1,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}`);
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (!user) return;
    const isAdmin =
      userProfile?.role === "admin" ||
      user.email === "youssefbenamor1234@gmail.com";
    if (post.authorId !== user.uid && !isAdmin) return;

    if (
      window.confirm(
        lang === "tn"
          ? "بش تفسخ المنشور؟"
          : lang === "fr"
            ? "Supprimer ce post ?"
            : "Delete this post?",
      )
    ) {
      try {
        await deleteDoc(doc(db, "posts", post.id));
        setSelectedPost(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `posts/${post.id}`);
      }
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!user) return;
    const isAdmin =
      userProfile?.role === "admin" ||
      user.email === "youssefbenamor1234@gmail.com";
    if (comment.authorId !== user.uid && !isAdmin) return;

    if (
      window.confirm(
        lang === "tn"
          ? "بش تفسخ التعليق؟"
          : lang === "fr"
            ? "Supprimer ce commentaire ?"
            : "Delete this comment?",
      )
    ) {
      try {
        await deleteDoc(
          doc(db, "posts", selectedPost!.id, "comments", comment.id),
        );
      } catch (error) {
        handleFirestoreError(
          error,
          OperationType.DELETE,
          `posts/${selectedPost!.id}/comments/${comment.id}`,
        );
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString(
      lang === "tn" ? "ar-TN" : lang === "fr" ? "fr-FR" : "en-US",
      {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-earth-50 selection:bg-olive-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-serif font-bold text-olive-900 mb-4">
              {t.forum}
            </h1>
            <p className="text-lg text-olive-800/60 max-w-2xl">
              {t.forumSubtitle}
            </p>
          </div>
          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNewPostModalOpen(true)}
              className="px-8 py-4 bg-olive-900 text-white rounded-2xl font-bold shadow-xl shadow-olive-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t.forumNewPost}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signInWithGoogle()}
              className="px-8 py-4 bg-white text-olive-900 border border-earth-200 rounded-2xl font-bold shadow-sm flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {t.forumLoginBtn}
            </motion.button>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-olive-400 mb-6">
                {t.forumCategories}
              </h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSelectedPost(null);
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                      activeCategory === cat.id
                        ? "bg-olive-900 text-white shadow-lg shadow-olive-100"
                        : "bg-white text-olive-900/60 hover:bg-earth-100"
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-olive-50 p-8 rounded-[32px] border border-olive-100">
              <h4 className="font-serif font-bold text-olive-900 mb-4">
                Community Guidelines
              </h4>
              <ul className="text-sm text-olive-800/60 space-y-3 list-disc pl-4">
                <li>Be respectful to fellow farmers.</li>
                <li>Share verified agricultural advice.</li>
                <li>No spam or self-promotion.</li>
                <li>Use appropriate categories.</li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedPost ? (
                <motion.div
                  key="post-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center gap-2 text-olive-400 hover:text-olive-900 transition-colors font-bold uppercase text-[10px] tracking-widest"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Forum
                  </button>

                  <div className="bg-white rounded-[40px] p-10 shadow-xl border border-earth-100">
                    <div className="flex items-center gap-4 mb-8">
                      <img
                        src={
                          selectedPost.authorPhoto ||
                          `https://ui-avatars.com/api/?name=${selectedPost.authorName}`
                        }
                        alt={selectedPost.authorName}
                        className="w-12 h-12 rounded-2xl object-cover border border-earth-100"
                      />
                      <div>
                        <div className="font-serif font-bold text-olive-900">
                          {selectedPost.authorName}
                        </div>
                        <div className="text-xs text-olive-400 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {formatDate(selectedPost.createdAt)}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <Badge>{selectedPost.category}</Badge>
                      </div>
                    </div>

                    <h2 className="text-4xl font-serif font-bold text-olive-900 mb-6">
                      {selectedPost.title}
                    </h2>
                    <div className="text-lg text-olive-800/70 leading-relaxed whitespace-pre-wrap mb-10">
                      {selectedPost.content}
                    </div>

                    <div className="flex items-center gap-6 pt-8 border-t border-earth-100">
                      <button
                        onClick={() => handleLikePost(selectedPost)}
                        className="flex items-center gap-2 text-olive-400 hover:text-olive-600 transition-colors"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-bold">
                          {selectedPost.likes || 0}
                        </span>
                      </button>
                      <div className="flex items-center gap-2 text-olive-400">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-bold">{comments.length}</span>
                      </div>

                      {(user?.uid === selectedPost.authorId ||
                        userProfile?.role === "admin" ||
                        user?.email === "youssefbenamor1234@gmail.com") && (
                        <button
                          onClick={() => handleDeletePost(selectedPost)}
                          className="ml-auto flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="font-bold text-xs uppercase tracking-widest">
                            Delete
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-serif font-bold text-olive-900 px-4">
                      {t.forumComments}
                    </h3>

                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={comment.id}
                          className="bg-white/60 rounded-3xl p-6 border border-earth-100"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={
                                comment.authorPhoto ||
                                `https://ui-avatars.com/api/?name=${comment.authorName}`
                              }
                              alt={comment.authorName}
                              className="w-8 h-8 rounded-xl object-cover"
                            />
                            <div>
                              <div className="text-sm font-bold text-olive-900">
                                {comment.authorName}
                              </div>
                              <div className="text-[10px] text-olive-400">
                                {formatDate(comment.createdAt)}
                              </div>
                            </div>

                            {(user?.uid === comment.authorId ||
                              userProfile?.role === "admin" ||
                              user?.email ===
                                "youssefbenamor1234@gmail.com") && (
                              <button
                                onClick={() => handleDeleteComment(comment)}
                                className="ml-auto text-red-400 hover:text-red-600 transition-colors p-2"
                                title="Delete Comment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-olive-800/70 leading-relaxed">
                            {comment.content}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {user ? (
                      <form
                        onSubmit={handleAddComment}
                        className="bg-white rounded-3xl p-4 shadow-lg border border-earth-100 flex gap-3"
                      >
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={t.forumCommentPlaceholder}
                          className="flex-grow px-6 py-3 bg-earth-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-olive-500 transition-all"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="p-3 bg-olive-900 text-white rounded-xl shadow-lg shadow-olive-100"
                        >
                          <Send className="w-5 h-5" />
                        </motion.button>
                      </form>
                    ) : (
                      <div className="bg-olive-50 p-6 rounded-3xl text-center border border-olive-100">
                        <p className="text-sm text-olive-800/60 mb-4">
                          {t.forumLoginRequired}
                        </p>
                        <button
                          onClick={() => signInWithGoogle()}
                          className="text-olive-900 font-bold uppercase text-[10px] tracking-widest hover:underline"
                        >
                          {t.forumLoginBtn}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="post-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "linear",
                        }}
                        className="w-12 h-12 border-4 border-olive-200 border-t-olive-600 rounded-full"
                      />
                      <p className="text-olive-400 font-bold uppercase tracking-widest text-[10px]">
                        Loading Discussions...
                      </p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-earth-300">
                      <MessageSquare className="w-16 h-16 text-earth-200 mx-auto mb-6" />
                      <h3 className="text-2xl font-serif font-bold text-olive-900 mb-2">
                        {t.forumNoPosts}
                      </h3>
                      <p className="text-olive-800/40">
                        Be the first to start a conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {posts.map((post) => (
                        <motion.div
                          layoutId={post.id}
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="group bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl border border-earth-100 transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  post.authorPhoto ||
                                  `https://ui-avatars.com/api/?name=${post.authorName}`
                                }
                                alt={post.authorName}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                              <div>
                                <div className="text-sm font-bold text-olive-900">
                                  {post.authorName}
                                </div>
                                <div className="text-[10px] text-olive-400">
                                  {formatDate(post.createdAt)}
                                </div>
                              </div>
                            </div>
                            <Badge>{post.category}</Badge>
                          </div>

                          <h3 className="text-2xl font-serif font-bold text-olive-900 mb-4 group-hover:text-olive-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-olive-800/60 line-clamp-2 mb-8 leading-relaxed">
                            {post.content}
                          </p>

                          <div className="flex items-center justify-between pt-6 border-t border-earth-50">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-olive-400">
                                <ThumbsUp className="w-4 h-4" />
                                <span className="text-xs font-bold">
                                  {post.likes || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-olive-400">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs font-bold">
                                  View Comments
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-olive-200 group-hover:text-olive-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {isNewPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewPostModalOpen(false)}
              className="absolute inset-0 bg-olive-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl"
            >
              <h2 className="text-3xl font-serif font-bold text-olive-900 mb-8">
                {t.forumNewPost}
              </h2>
              <form onSubmit={handleCreatePost} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-3 block">
                    {t.forumPostTitle}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="e.g. Best irrigation for olive trees?"
                    className="w-full p-4 bg-earth-50 border-none rounded-2xl text-sm font-bold text-olive-900 focus:ring-2 focus:ring-olive-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-3 block">
                    {t.forumPostCategory}
                  </label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full p-4 bg-earth-50 border-none rounded-2xl text-sm font-bold text-olive-900 focus:ring-2 focus:ring-olive-500"
                  >
                    <option value="general">{t.forumCategoryGeneral}</option>
                    <option value="olive">{t.forumCategoryOlive}</option>
                    <option value="citrus">{t.forumCategoryCitrus}</option>
                    <option value="cereal">{t.forumCategoryCereal}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-3 block">
                    {t.forumPostContent}
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your experience or ask a question..."
                    className="w-full p-4 bg-earth-50 border-none rounded-2xl text-sm font-medium text-olive-900 focus:ring-2 focus:ring-olive-500 resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewPostModalOpen(false)}
                    className="flex-grow py-4 bg-earth-100 text-olive-900 rounded-2xl font-bold hover:bg-earth-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-4 bg-olive-900 text-white rounded-2xl font-bold shadow-xl shadow-olive-100 hover:bg-olive-800 transition-all"
                  >
                    {t.forumPostSubmit}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
