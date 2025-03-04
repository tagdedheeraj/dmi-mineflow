
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Telegram, Youtube, Instagram, Twitter, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SocialMediaTasksProps {
  completedTasks: string[];
  onCompleteTask: (taskId: string, data?: any) => Promise<void>;
}

const SocialMediaTasks: React.FC<SocialMediaTasksProps> = ({ 
  completedTasks,
  onCompleteTask
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [youtubeLink, setYoutubeLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState({
    telegram: false,
    telegramShare: false,
    youtube: false,
    instagram: false,
    twitter: false
  });

  const handleTelegramJoin = async () => {
    if (!user) return;
    
    setIsSubmitting(prev => ({ ...prev, telegram: true }));
    
    try {
      // Open Telegram channel in a new tab
      window.open('https://t.me/dminetwork', '_blank');
      
      await onCompleteTask('telegram_join');
      
      toast({
        title: "Task Completed!",
        description: "You've earned 10 DMI coins for joining our Telegram channel.",
      });
    } catch (error) {
      console.error('Error completing Telegram task:', error);
      toast({
        title: "Error",
        description: "Failed to complete the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(prev => ({ ...prev, telegram: false }));
    }
  };

  const handleTelegramShare = async () => {
    if (!user) return;
    
    setIsSubmitting(prev => ({ ...prev, telegramShare: true }));
    
    try {
      await onCompleteTask('telegram_share');
      
      toast({
        title: "Task Completed!",
        description: "You've earned 10 DMI coins for sharing our pinned post.",
      });
    } catch (error) {
      console.error('Error completing Telegram share task:', error);
      toast({
        title: "Error",
        description: "Failed to complete the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(prev => ({ ...prev, telegramShare: false }));
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!user) return;
    if (!youtubeLink) {
      toast({
        title: "Link Required",
        description: "Please enter your YouTube video link.",
        variant: "destructive"
      });
      return;
    }
    
    if (!youtubeLink.includes('youtube.com') && !youtubeLink.includes('youtu.be')) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid YouTube video link.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(prev => ({ ...prev, youtube: true }));
    
    try {
      await onCompleteTask('youtube_video', { link: youtubeLink });
      
      setYoutubeLink('');
      toast({
        title: "Task Submitted!",
        description: "Your YouTube video has been submitted for verification. You'll receive 500 DMI coins once verified.",
      });
    } catch (error) {
      console.error('Error submitting YouTube task:', error);
      toast({
        title: "Error",
        description: "Failed to submit the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(prev => ({ ...prev, youtube: false }));
    }
  };

  const handleInstagramSubmit = async () => {
    if (!user) return;
    if (!instagramLink) {
      toast({
        title: "Link Required",
        description: "Please enter your Instagram post link.",
        variant: "destructive"
      });
      return;
    }
    
    if (!instagramLink.includes('instagram.com')) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid Instagram post link.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(prev => ({ ...prev, instagram: true }));
    
    try {
      await onCompleteTask('instagram_post', { link: instagramLink });
      
      setInstagramLink('');
      toast({
        title: "Task Submitted!",
        description: "Your Instagram post has been submitted for verification. You'll receive 100 DMI coins once verified.",
      });
    } catch (error) {
      console.error('Error submitting Instagram task:', error);
      toast({
        title: "Error",
        description: "Failed to submit the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(prev => ({ ...prev, instagram: false }));
    }
  };

  const handleTwitterSubmit = async () => {
    if (!user) return;
    if (!twitterLink) {
      toast({
        title: "Link Required",
        description: "Please enter your Twitter post link.",
        variant: "destructive"
      });
      return;
    }
    
    if (!twitterLink.includes('twitter.com') && !twitterLink.includes('x.com')) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid Twitter post link.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(prev => ({ ...prev, twitter: true }));
    
    try {
      await onCompleteTask('twitter_post', { link: twitterLink });
      
      setTwitterLink('');
      toast({
        title: "Task Submitted!",
        description: "Your Twitter post has been submitted for verification. You'll receive 50 DMI coins once verified.",
      });
    } catch (error) {
      console.error('Error submitting Twitter task:', error);
      toast({
        title: "Error",
        description: "Failed to submit the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(prev => ({ ...prev, twitter: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <Card className="border-red-300 bg-red-50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <strong>IMPORTANT:</strong> Any user found attempting to cheat or abuse the rewards system will have their account permanently deleted without warning. DMI Network maintains a strict zero-tolerance policy for fraudulent activity.
          </p>
        </CardContent>
      </Card>

      {/* Telegram Join Task */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Telegram className="h-5 w-5 text-blue-500" />
              Join Our Telegram Channel
            </CardTitle>
            <div className="text-sm font-semibold bg-blue-100 text-blue-700 py-1 px-2 rounded">
              +10 DMI
            </div>
          </div>
          <CardDescription>
            Join our official Telegram channel to stay updated
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          {completedTasks.includes('telegram_join') ? (
            <Button disabled className="w-full bg-green-500 hover:bg-green-600">
              <Check className="mr-2 h-4 w-4" /> Completed
            </Button>
          ) : (
            <Button 
              onClick={handleTelegramJoin} 
              disabled={isSubmitting.telegram}
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {isSubmitting.telegram ? 'Processing...' : 'Join Telegram Channel'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Telegram Share Pinned Post Task */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Telegram className="h-5 w-5 text-blue-500" />
              Share Pinned Post
            </CardTitle>
            <div className="text-sm font-semibold bg-blue-100 text-blue-700 py-1 px-2 rounded">
              +10 DMI
            </div>
          </div>
          <CardDescription>
            Share our pinned post from the Telegram channel
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          {completedTasks.includes('telegram_share') ? (
            <Button disabled className="w-full bg-green-500 hover:bg-green-600">
              <Check className="mr-2 h-4 w-4" /> Completed
            </Button>
          ) : (
            <Button 
              onClick={handleTelegramShare} 
              disabled={isSubmitting.telegramShare || !completedTasks.includes('telegram_join')}
              className="w-full"
            >
              {completedTasks.includes('telegram_join') ? 
                (isSubmitting.telegramShare ? 'Processing...' : 'Confirm Share') : 
                'Join Telegram First'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* YouTube Task */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Create YouTube Video
            </CardTitle>
            <div className="text-sm font-semibold bg-red-100 text-red-700 py-1 px-2 rounded">
              +500 DMI
            </div>
          </div>
          <CardDescription>
            Create and upload a video about DMI Network on YouTube
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter YouTube video link"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              disabled={completedTasks.includes('youtube_video')}
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          {completedTasks.includes('youtube_video') ? (
            <Button disabled className="w-full bg-green-500 hover:bg-green-600">
              <Check className="mr-2 h-4 w-4" /> Completed
            </Button>
          ) : (
            <Button 
              onClick={handleYoutubeSubmit} 
              disabled={isSubmitting.youtube}
              className="w-full"
            >
              {isSubmitting.youtube ? 'Processing...' : 'Verify YouTube Video'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Instagram Task */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Instagram className="h-5 w-5 text-purple-500" />
              Instagram Post
            </CardTitle>
            <div className="text-sm font-semibold bg-purple-100 text-purple-700 py-1 px-2 rounded">
              +100 DMI
            </div>
          </div>
          <CardDescription>
            Create and share a post about DMI Network on Instagram
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Instagram post link"
              value={instagramLink}
              onChange={(e) => setInstagramLink(e.target.value)}
              disabled={completedTasks.includes('instagram_post')}
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          {completedTasks.includes('instagram_post') ? (
            <Button disabled className="w-full bg-green-500 hover:bg-green-600">
              <Check className="mr-2 h-4 w-4" /> Completed
            </Button>
          ) : (
            <Button 
              onClick={handleInstagramSubmit} 
              disabled={isSubmitting.instagram}
              className="w-full"
            >
              {isSubmitting.instagram ? 'Processing...' : 'Verify Instagram Post'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Twitter Task */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-400" />
              Twitter Share
            </CardTitle>
            <div className="text-sm font-semibold bg-blue-100 text-blue-700 py-1 px-2 rounded">
              +50 DMI
            </div>
          </div>
          <CardDescription>
            Share about DMI Network on Twitter
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Twitter post link"
              value={twitterLink}
              onChange={(e) => setTwitterLink(e.target.value)}
              disabled={completedTasks.includes('twitter_post')}
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          {completedTasks.includes('twitter_post') ? (
            <Button disabled className="w-full bg-green-500 hover:bg-green-600">
              <Check className="mr-2 h-4 w-4" /> Completed
            </Button>
          ) : (
            <Button 
              onClick={handleTwitterSubmit} 
              disabled={isSubmitting.twitter}
              className="w-full"
            >
              {isSubmitting.twitter ? 'Processing...' : 'Verify Twitter Post'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SocialMediaTasks;
