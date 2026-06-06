"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Star } from "lucide-react";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("allTime");

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${type}`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Medal className="w-6 h-6 text-[#FBBF24]" />; // Gold
    if (rank === 1) return <Medal className="w-6 h-6 text-[#CBD5E1]" />; // Silver
    if (rank === 2) return <Medal className="w-6 h-6 text-[#C08457]" />; // Bronze
    return <span className="text-gray-400 font-bold">#{rank + 1}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Global Leaderboard</h1>
          <p className="text-gray-500">See how you stack up against the best engineers.</p>
        </div>

        <Tabs defaultValue="allTime" className="w-full" onValueChange={setType}>
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/50 backdrop-blur-md border border-gray-200 p-1 rounded-2xl h-12">
              <TabsTrigger value="weekly" className="rounded-xl px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="rounded-xl px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Monthly</TabsTrigger>
              <TabsTrigger value="allTime" className="rounded-xl px-8 data-[state=active]:bg-blue-600 data-[state=active]:text-white">All Time</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={type} className="mt-0">
            <Card className="rounded-[32px] border-none shadow-lg bg-white/72 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider w-24">Rank</th>
                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Points</th>
                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Badges</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td className="px-8 py-6"><Skeleton className="h-4 w-8" /></td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                            <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                          </tr>
                        ))
                      ) : (
                        users.map((user, i) => (
                          <tr key={user._id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-center w-8">
                                {getRankIcon(i)}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border border-gray-100">
                                  <AvatarImage src={user.image} />
                                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-gray-900">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="font-black text-blue-600">{user.totalPoints}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-1">
                                {user.badges.slice(0, 3).map((badge: string, j: number) => (
                                  <div key={j} className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center" title={badge}>
                                    <Star className="w-3 h-3 text-blue-600 fill-blue-600" />
                                  </div>
                                ))}
                                {user.badges.length > 3 && (
                                  <span className="text-[10px] font-bold text-gray-400 ml-1">+{user.badges.length - 3}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
