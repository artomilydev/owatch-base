"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useTheme } from "../../context/ThemeContext";
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Clock,
  DollarSign,
} from "lucide-react";

interface Video {
  id: number;
  title: string;
  duration: string;
  reward: number; // Now represents points instead of tokens
  thumbnail: string;
  category: string;
  watched: boolean;
  progress: number;
  description: string;
}

// Dummy videos - rewards are now points instead of direct tokens
const dummyVideos: Video[] = [
  {
    id: 1,
    title: "Introduction to Web3 & Blockchain",
    duration: "5:30",
    reward: 50, // 50 points
    thumbnail: "/api/placeholder/400/225",
    category: "Education",
    watched: false,
    progress: 0,
    description: "Learn the basics of Web3 technology and how blockchain works",
  },
  {
    id: 2,
    title: "Base Chain Deep Dive",
    duration: "8:15",
    reward: 75, // 75 points
    thumbnail: "/api/placeholder/400/225",
    category: "Technology",
    watched: false,
    progress: 0,
    description: "Explore Base Chain's Layer 2 architecture and features",
  },
  {
    id: 3,
    title: "DeFi Fundamentals",
    duration: "6:45",
    reward: 60, // 60 points
    thumbnail: "/api/placeholder/400/225",
    category: "Finance",
    watched: false,
    progress: 0,
    description: "Understanding Decentralized Finance and its applications",
  },
  {
    id: 4,
    title: "NFT Marketplace Guide",
    duration: "7:20",
    reward: 70, // 70 points
    thumbnail: "/api/placeholder/400/225",
    category: "NFT",
    watched: false,
    progress: 0,
    description: "Complete guide to buying, selling, and creating NFTs",
  },
  {
    id: 5,
    title: "Crypto Trading Strategies",
    duration: "9:10",
    reward: 90, // 90 points
    thumbnail: "/api/placeholder/400/225",
    category: "Trading",
    watched: false,
    progress: 0,
    description: "Advanced trading strategies for cryptocurrency markets",
  },
  {
    id: 6,
    title: "Smart Contracts Explained",
    duration: "11:25",
    reward: 20,
    thumbnail: "/api/placeholder/400/225",
    category: "Development",
    watched: false,
    progress: 0,
    description: "How smart contracts work and their real-world applications",
  },
];

export function VideoContent(): JSX.Element {
  const { address, isConnected } = useAccount();
  const { theme } = useTheme();
  const [videos, setVideos] = useState<Video[]>(dummyVideos);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [watchTime, setWatchTime] = useState<number>(0);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0); // Changed from balance to points
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Load points from localStorage on mount
  useEffect(() => {
    if (isConnected && address) {
      // Load points from localStorage using wallet address as key
      const savedPoints = parseInt(
        localStorage.getItem(`owatch_points_${address}`) || "0"
      );
      setPoints(savedPoints);
    }
  }, [isConnected, address]);

  // Timer untuk tracking watch time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedVideo) {
      interval = setInterval(() => {
        setWatchTime((prev) => {
          const newTime = prev + 1;
          const totalSeconds = getSecondsFromDuration(selectedVideo.duration);

          // Update progress
          const progress = (newTime / totalSeconds) * 100;
          updateVideoProgress(selectedVideo.id, Math.min(progress, 100));

          // Jika sudah selesai 80% atau lebih, bisa claim reward
          if (progress >= 80 && !claimedRewards.includes(selectedVideo.id)) {
            setShowClaimModal(true);
          }

          return newTime >= totalSeconds ? 0 : newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedVideo, claimedRewards]);

  const getSecondsFromDuration = (duration: string): number => {
    const [minutes, seconds] = duration.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  const updateVideoProgress = (videoId: number, progress: number) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId ? { ...video, progress } : video
      )
    );
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    setWatchTime(0);
  };

  const handlePauseVideo = () => {
    setIsPlaying(false);
  };

  const handleResetVideo = () => {
    setWatchTime(0);
    setIsPlaying(false);
    if (selectedVideo) {
      updateVideoProgress(selectedVideo.id, 0);
    }
  };

  const handleClaimReward = (videoId: number, reward: number) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }

    // Simulasi claim reward
    setClaimedRewards((prev) => [...prev, videoId]);
    setShowClaimModal(false);

    // Update points using wallet address as key
    const newPoints = points + reward;
    setPoints(newPoints);
    localStorage.setItem(`owatch_points_${address}`, newPoints.toString());

    // Update video status
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId ? { ...video, watched: true } : video
      )
    );

    // Show success message
    alert(`🎉 Successfully claimed ${reward} points!`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getFilteredVideos = () => {
    return videos.filter((video) => {
      const matchesFilter =
        filter === "all" ||
        video.category.toLowerCase() === filter.toLowerCase();
      const matchesSearch =
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const categories = [
    "all",
    ...Array.from(new Set(videos.map((v) => v.category.toLowerCase()))),
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
            Watch & Earn
          </h1>
          <p className="dark:text-slate-300 text-gray-600">
            {isConnected
              ? "Watch videos and earn points"
              : "Connect your wallet to start earning"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="flex items-center space-x-2 dark:bg-white/10 dark:backdrop-blur-md dark:border dark:border-white/20 bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <span className="dark:text-white text-gray-900 font-semibold">
                {points} Points
              </span>
            </div>
          )}
          {!isConnected && (
            <div className="bg-yellow-500 dark:text-yellow-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
              ⚠️ Wallet not connected
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-purple-500 dark:focus:border-purple-500 bg-gray-50 text-gray-900 border border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg focus:ring-2"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-purple-500 dark:focus:border-purple-500 bg-gray-50 text-gray-900 border border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg focus:ring-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all"
                  ? "All Categories"
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video List */}
        <div className="lg:col-span-2 space-y-4">
          {getFilteredVideos().map((video) => (
            <div
              key={video.id}
              className="dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:hover:bg-white/10 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-300 cursor-pointer shadow-sm group"
              onClick={() => handlePlayVideo(video)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-32 h-20 dark:bg-slate-600 bg-gray-200 rounded flex items-center justify-center relative">
                  <span className="dark:text-slate-300 text-gray-600 text-xs">
                    Video
                  </span>
                  {video.watched && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="dark:text-white text-gray-900 font-semibold mb-1">
                    {video.title}
                  </h3>
                  <p className="dark:text-slate-300 text-gray-600 text-sm mb-2">
                    {video.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm dark:text-slate-400 text-gray-500 mb-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{video.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">
                        {video.reward} OWATCH
                      </span>
                    </span>
                    <span className="px-2 py-1 dark:bg-slate-700 bg-gray-100 rounded text-xs">
                      {video.category}
                    </span>
                  </div>
                  <div className="w-full dark:bg-slate-700 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${video.progress}%` }}
                    ></div>
                  </div>
                  {video.progress > 0 && (
                    <p className="text-xs dark:text-slate-400 text-gray-500 mt-1">
                      {video.progress.toFixed(0)}% watched
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {video.watched ? (
                    <span className="text-green-400 text-sm flex items-center space-x-1">
                      <Trophy className="w-3 h-3" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <button
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1 rounded text-sm transition-all duration-300 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVideo(video);
                      }}
                    >
                      Watch
                    </button>
                  )}
                  {video.progress >= 80 &&
                    !claimedRewards.includes(video.id) && (
                      <button
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-1 rounded text-sm transition-all duration-300 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaimReward(video.id, video.reward);
                        }}
                      >
                        Claim {video.reward} OWATCH
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Player */}
        <div className="lg:col-span-1">
          <div className="dark:bg-white/5 dark:backdrop-blur-md bg-white border dark:border-white/20 border-gray-200 rounded-xl p-6 sticky top-6">
            <h3 className="dark:text-white text-gray-900 font-semibold mb-4">
              Now Playing
            </h3>
            {selectedVideo ? (
              <div>
                <div className="w-full h-48 dark:bg-gray-700 bg-gray-100 rounded-lg mb-4 flex flex-col items-center justify-center relative">
                  <div className="text-center">
                    {isPlaying ? (
                      <Play className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    ) : (
                      <Pause className="w-12 h-12 dark:text-gray-400 text-gray-500 mx-auto mb-2" />
                    )}
                    <span className="dark:text-white text-gray-900 text-sm">
                      {selectedVideo.title}
                    </span>
                  </div>
                  {selectedVideo.watched && (
                    <div className="absolute top-2 right-2">
                      <Trophy className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-2 mb-4">
                  <button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="dark:bg-gray-600 dark:hover:bg-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-white text-gray-700 px-4 py-2 rounded-lg transition-all duration-300"
                    onClick={handleResetVideo}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between dark:text-gray-400 text-gray-600">
                    <span>Watch Time:</span>
                    <span>
                      {formatTime(watchTime)} / {selectedVideo.duration}
                    </span>
                  </div>
                  <div className="flex justify-between dark:text-gray-400 text-gray-600">
                    <span>Progress:</span>
                    <span>{selectedVideo.progress.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between dark:text-gray-400 text-gray-600">
                    <span>Reward:</span>
                    <span className="text-green-400">
                      {selectedVideo.reward} OWATCH
                    </span>
                  </div>
                  <div className="w-full dark:bg-gray-700 bg-gray-300 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedVideo.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 dark:bg-gray-700 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center dark:text-gray-400 text-gray-500">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <span>Select a video to start watching</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="dark:bg-white/10 dark:backdrop-blur-md bg-white border dark:border-white/20 border-gray-200 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
              <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                🎉 Reward Available!
              </h3>
            </div>
            <p className="dark:text-gray-300 text-gray-600 mb-4 text-center">
              You've watched{" "}
              <strong>{selectedVideo.progress.toFixed(0)}%</strong> of "
              {selectedVideo.title}". Claim your{" "}
              <strong className="text-green-400">
                {selectedVideo.reward} OWATCH
              </strong>{" "}
              tokens!
            </p>
            <div className="flex justify-center space-x-3">
              <button
                className="dark:bg-gray-600 dark:hover:bg-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-white text-gray-700 px-4 py-2 rounded-lg transition-all duration-300"
                onClick={() => setShowClaimModal(false)}
              >
                Watch More
              </button>
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                onClick={() =>
                  handleClaimReward(selectedVideo.id, selectedVideo.reward)
                }
              >
                Claim {selectedVideo.reward} OWATCH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
