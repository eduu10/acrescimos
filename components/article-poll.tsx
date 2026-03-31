'use client';

import { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
}

export function ArticlePoll({ articleId }: { articleId: number }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch(`/api/polls?article_id=${articleId}`)
      .then(r => r.json())
      .then(data => {
        if (data?.id) {
          setPoll(data);
          const stored = localStorage.getItem(`poll_voted_${data.id}`);
          if (stored) setVoted(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleVote = async (optionId: number) => {
    if (!poll || voted || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/polls/${poll.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPoll(updated);
        setVoted(true);
        localStorage.setItem(`poll_voted_${poll.id}`, '1');
      }
    } catch { /* ignore */ } finally {
      setVoting(false);
    }
  };

  if (loading || !poll) return null;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="bg-[#1B2436] rounded-xl p-5 my-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-[#F2E205]" />
        <span className="text-xs text-[#F2E205] font-bold uppercase tracking-wide">Enquete</span>
      </div>
      <p className="text-white font-bold text-base mb-4">{poll.question}</p>
      <div className="flex flex-col gap-2">
        {poll.options.map(option => {
          const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return voted ? (
            <div key={option.id} className="relative">
              <div className="flex items-center justify-between text-sm text-white mb-1">
                <span>{option.text}</span>
                <span className="font-bold text-[#F2E205]">{pct}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-[#F2E205] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={voting}
              className="w-full text-left px-4 py-2.5 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 hover:border-[#F2E205] transition-colors disabled:opacity-50"
            >
              {option.text}
            </button>
          );
        })}
      </div>
      {voted && (
        <p className="text-xs text-white/40 mt-3 text-right">{totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}</p>
      )}
    </div>
  );
}
