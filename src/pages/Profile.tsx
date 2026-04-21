import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Award, 
  MessageSquare, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Sprout
} from 'lucide-react';
import { db, collection, query, where, orderBy, onSnapshot, updateDoc, doc, FirebaseUser, handleFirestoreError, OperationType } from '../firebase';
import { TRANSLATIONS } from '../constants';
import { Badge } from '../App';
import { Link } from 'react-router-dom';

interface ProfileProps {
  lang: 'en' | 'fr' | 'tn';
  user: FirebaseUser | null;
  isAuthReady: boolean;
  userProfile: any;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: any;
  likes: number;
}

export default function Profile({ lang, user, isAuthReady, userProfile }: ProfileProps) {
  const t = TRANSLATIONS[lang];
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(userProfile?.bio || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'posts'), 
        where('authorId', '==', user.uid), 
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        setMyPosts(postsData);
        setIsLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleUpdateBio = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        bio: newBio
      });
      setIsEditingBio(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(lang === 'tn' ? 'ar-TN' : lang === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isAuthReady) return null;

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-earth-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-olive-100 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-olive-600">
            <UserIcon className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-olive-900 mb-4">{t.forumLoginRequired}</h2>
          <p className="text-olive-800/60 mb-8">Join our community of Tunisian farmers to share knowledge and track your progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-earth-50 selection:bg-olive-200 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[48px] p-10 shadow-xl border border-earth-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-32 bg-olive-900" />
              
              <div className="relative mt-8 mb-6">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt={user.displayName || 'User'} 
                  className="w-32 h-32 rounded-[40px] border-4 border-white shadow-2xl mx-auto object-cover"
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <h2 className="text-3xl font-serif font-bold text-olive-900 mb-2">{user.displayName}</h2>
              <p className="text-xs font-bold text-olive-400 uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Verified Farmer
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-earth-50 p-4 rounded-3xl">
                  <div className="text-2xl font-serif font-bold text-olive-900">{userProfile?.reputation || 0}</div>
                  <div className="text-[10px] font-bold text-olive-400 uppercase tracking-widest">{t.forumReputation}</div>
                </div>
                <div className="bg-earth-50 p-4 rounded-3xl">
                  <div className="text-2xl font-serif font-bold text-olive-900">{myPosts.length}</div>
                  <div className="text-[10px] font-bold text-olive-400 uppercase tracking-widest">{t.forumMyPosts}</div>
                </div>
              </div>

              <div className="text-left space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-olive-400">Biography</h4>
                    <button 
                      onClick={() => setIsEditingBio(!isEditingBio)}
                      className="text-olive-600 hover:text-olive-900 transition-colors"
                    >
                      {isEditingBio ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {isEditingBio ? (
                    <div className="space-y-3">
                      <textarea 
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        className="w-full p-4 bg-earth-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-olive-500 resize-none"
                        rows={4}
                        placeholder="Tell us about your farm..."
                      />
                      <button 
                        onClick={handleUpdateBio}
                        className="w-full py-3 bg-olive-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Bio
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-olive-800/70 leading-relaxed italic">
                      {userProfile?.bio || "No bio added yet. Share your farming journey!"}
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-earth-100">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-2">Member Since</div>
                  <div className="text-sm font-bold text-olive-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-olive-400" />
                    {formatDate(userProfile?.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-olive-900 rounded-[40px] p-10 text-white shadow-2xl shadow-olive-200">
              <Sprout className="w-10 h-10 text-olive-400 mb-6" />
              <h3 className="text-2xl font-serif font-bold mb-4">Farmer Rank</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">Your reputation grows as you help others and share insights in the community.</p>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>Level 1: Novice</span>
                  <span className="text-olive-400">0 - 100 Rep</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((userProfile?.reputation || 0), 100)}%` }}
                    className="h-full bg-olive-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h3 className="text-4xl font-serif font-bold text-olive-900 mb-8">{t.forumMyPosts}</h3>
              
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-12 h-12 border-4 border-olive-200 border-t-olive-600 rounded-full"
                  />
                </div>
              ) : myPosts.length === 0 ? (
                <div className="bg-white rounded-[40px] p-16 text-center border border-dashed border-earth-300">
                  <MessageSquare className="w-16 h-16 text-earth-200 mx-auto mb-6" />
                  <h4 className="text-xl font-serif font-bold text-olive-900 mb-2">No posts yet</h4>
                  <p className="text-olive-800/40 mb-8">Start your first discussion in the community forum.</p>
                  <Link 
                    to="/forum"
                    className="px-8 py-4 bg-olive-900 text-white rounded-2xl font-bold shadow-xl shadow-olive-100 inline-block"
                  >
                    Go to Forum
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {myPosts.map((post) => (
                    <Link 
                      to="/forum" 
                      key={post.id}
                      className="group bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl border border-earth-100 transition-all flex justify-between items-center"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge>{post.category}</Badge>
                          <span className="text-[10px] font-bold text-olive-400 uppercase tracking-widest">{formatDate(post.createdAt)}</span>
                        </div>
                        <h4 className="text-2xl font-serif font-bold text-olive-900 group-hover:text-olive-600 transition-colors">{post.title}</h4>
                        <div className="flex items-center gap-4 text-olive-400">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-bold">{post.likes || 0} Likes</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-olive-200 group-hover:text-olive-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
