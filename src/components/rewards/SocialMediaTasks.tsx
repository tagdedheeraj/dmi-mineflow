
import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Share2,
  Youtube,
  Instagram,
  Twitter,
  AlertTriangle,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getTaskRewardAmounts } from '@/lib/rewards';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SocialMediaTasksProps {
  completedTasks: string[];
  onCompleteTask: (taskId: string, data?: any) => Promise<void>;
}

const SocialMediaTasks: React.FC<SocialMediaTasksProps> = ({
  completedTasks,
  onCompleteTask
}) => {
  const [videoLink, setVideoLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [rewardAmounts, setRewardAmounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load reward amounts
  useEffect(() => {
    const loadRewards = async () => {
      try {
        const rewards = await getTaskRewardAmounts();
        setRewardAmounts(rewards);
      } catch (error) {
        console.error("Error loading reward amounts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRewards();
  }, []);
  
  const handleSubmitVideo = async () => {
    if (!videoLink || !currentTask) return;
    
    setIsSubmitting(true);
    try {
      await onCompleteTask(currentTask, { link: videoLink });
      setVideoLink('');
      setCurrentTask(null);
    } catch (error) {
      console.error('Error submitting video:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTelegramTask = async (taskId: string) => {
    const telegramUrl = 'https://t.me/dminetwork';
    
    try {
      // Complete the task in the background
      await onCompleteTask(taskId);
      
      // Then redirect to Telegram
      window.open(telegramUrl, '_blank');
    } catch (error) {
      console.error(`Error completing ${taskId}:`, error);
      toast({
        title: "Error",
        description: "Could not complete task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-dmi" />
        <span className="ml-2 text-gray-600">Loading rewards...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">Anti-Fraud Warning</h3>
            <p className="text-sm text-amber-700 mt-1">
              Any attempt to cheat or submit fraudulent tasks will result in immediate account termination without warning. All submissions are manually verified.
            </p>
          </div>
        </div>
      </div>
      
      {/* Telegram Join Task */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <MessageCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Join our Telegram Channel</h2>
              <p className="text-sm text-gray-500">Get {rewardAmounts['telegram_join'] || 0} DMI coins for joining our official Telegram channel</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <a 
              href="https://t.me/dminetwork" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
            >
              View Channel <ExternalLink className="h-4 w-4 ml-1" />
            </a>
            
            <Button
              onClick={() => handleTelegramTask('telegram_join')}
              disabled={completedTasks.includes('telegram_join')}
              variant={completedTasks.includes('telegram_join') ? "outline" : "default"}
            >
              {completedTasks.includes('telegram_join') ? 'Completed' : 'Complete Task'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Telegram Share Task */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <Share2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Share our Pinned Post</h2>
              <p className="text-sm text-gray-500">Get {rewardAmounts['telegram_share'] || 0} DMI coins for sharing our pinned post on Telegram</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <a 
              href="https://t.me/dminetwork" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
            >
              View Pinned Post <ExternalLink className="h-4 w-4 ml-1" />
            </a>
            
            <Button
              onClick={() => handleTelegramTask('telegram_share')}
              disabled={completedTasks.includes('telegram_share')}
              variant={completedTasks.includes('telegram_share') ? "outline" : "default"}
            >
              {completedTasks.includes('telegram_share') ? 'Completed' : 'Complete Task'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* YouTube Task */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <Youtube className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Create YouTube Video</h2>
              <p className="text-sm text-gray-500">Get {rewardAmounts['youtube_video'] || 0} DMI coins for creating and posting a video about DMI Network</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Create a video explaining the benefits of DMI Network
            </span>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  disabled={completedTasks.includes('youtube_video')}
                  variant={completedTasks.includes('youtube_video') ? "outline" : "default"}
                  onClick={() => setCurrentTask('youtube_video')}
                >
                  {completedTasks.includes('youtube_video') ? 'Submitted' : 'Verify Video'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit YouTube Video</DialogTitle>
                  <DialogDescription>
                    Enter the URL of your YouTube video about DMI Network. This will be manually verified.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSubmitVideo} 
                    disabled={!videoLink || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Instagram Task */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
              <Instagram className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Share on Instagram</h2>
              <p className="text-sm text-gray-500">Get {rewardAmounts['instagram_post'] || 0} DMI coins for posting about DMI Network on Instagram</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Post a reel or story about DMI Network
            </span>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  disabled={completedTasks.includes('instagram_post')}
                  variant={completedTasks.includes('instagram_post') ? "outline" : "default"}
                  onClick={() => setCurrentTask('instagram_post')}
                >
                  {completedTasks.includes('instagram_post') ? 'Submitted' : 'Verify Post'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Instagram Post</DialogTitle>
                  <DialogDescription>
                    Enter the URL of your Instagram post about DMI Network. This will be manually verified.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    placeholder="https://instagram.com/p/..." 
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSubmitVideo} 
                    disabled={!videoLink || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Twitter Task */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <Twitter className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Share on Twitter</h2>
              <p className="text-sm text-gray-500">Get {rewardAmounts['twitter_post'] || 0} DMI coins for tweeting about DMI Network</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Tweet about your experience with DMI Network
            </span>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  disabled={completedTasks.includes('twitter_post')}
                  variant={completedTasks.includes('twitter_post') ? "outline" : "default"}
                  onClick={() => setCurrentTask('twitter_post')}
                >
                  {completedTasks.includes('twitter_post') ? 'Submitted' : 'Verify Tweet'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Tweet</DialogTitle>
                  <DialogDescription>
                    Enter the URL of your tweet about DMI Network. This will be manually verified.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    placeholder="https://twitter.com/user/status/..." 
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSubmitVideo} 
                    disabled={!videoLink || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaTasks;
