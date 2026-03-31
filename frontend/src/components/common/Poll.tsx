import { useState } from 'react';
import axios from 'axios';
import { FiBarChart2 } from 'react-icons/fi';

interface PollOption {
  _id?: string;
  text: string;
  votes: string[];
}

interface PollData {
  options: PollOption[];
  expiresAt?: string;
}

interface PollProps {
  topicId: string;
  poll: PollData;
  userId?: string;
  onVoteSuccess?: () => void;
}

/**
 * Poll Component for voting in forum polls
 * Displays poll options, vote counts, and voting interaction
 */
function Poll({ topicId, poll, userId, onVoteSuccess }: PollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(
    poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
  );

  // Check if user has already voted
  const userHasVoted = userId && poll.options.some(opt => opt.votes.includes(userId));

  // Check if poll has expired
  const isPollExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  const handleVote = async (optionIndex: number) => {
    if (!userId || isPollExpired || userHasVoted) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/forum/${topicId}/poll/vote`,
        { optionIndex },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setSelectedOption(poll.options[optionIndex].text);
        setHasVoted(true);
        setTotalVotes(totalVotes + 1);
        if (onVoteSuccess) {
          onVoteSuccess();
        }
      }
    } catch (error) {
      console.error('Error voting in poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-6 border border-amber-200 dark:border-amber-800 my-4">
      <div className="flex items-center gap-2 mb-4">
        <FiBarChart2 className="w-5 h-5 text-amber-700 dark:text-amber-300" />
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          Polling
        </h3>
      </div>

      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option.votes.length);
          const isSelected = selectedOption === option.text;

          return (
            <div key={index} className="space-y-1">
              <button
                onClick={() => !isPollExpired && !userHasVoted && handleVote(index)}
                disabled={isPollExpired || userHasVoted || loading || !userId}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-amber-600 dark:border-amber-400 bg-amber-100 dark:bg-amber-900'
                    : 'border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-950 hover:border-amber-400 dark:hover:border-amber-600'
                } ${
                  isPollExpired || userHasVoted || !userId
                    ? 'cursor-not-allowed opacity-75'
                    : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        isSelected
                          ? 'border-amber-600 dark:border-amber-400 bg-amber-600 dark:bg-amber-400'
                          : 'border-amber-400 dark:border-amber-600'
                      }`}
                    />
                    <span className="text-amber-900 dark:text-amber-100 font-medium">
                      {option.text}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {percentage}%
                  </span>
                </div>
              </button>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Vote Count */}
              <div className="text-xs text-amber-700 dark:text-amber-300">
                {option.votes.length} {option.votes.length === 1 ? 'suara' : 'suara'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Poll Info */}
      <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800 flex justify-between items-center text-sm">
        <span className="text-amber-700 dark:text-amber-300">
          Total: <strong>{totalVotes}</strong> {totalVotes === 1 ? 'suara' : 'suara'}
        </span>

        {isPollExpired && (
          <span className="text-red-600 dark:text-red-400 font-semibold">
            📅 Poll berakhir
          </span>
        )}

        {!isPollExpired && userHasVoted && (
          <span className="text-green-600 dark:text-green-400 font-semibold">
            ✓ Sudah memilih
          </span>
        )}

        {!isPollExpired && !userHasVoted && !userId && (
          <span className="text-orange-600 dark:text-orange-400 text-xs">
            Login untuk memilih
          </span>
        )}

        {!isPollExpired && poll.expiresAt && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Berakhir: {new Date(poll.expiresAt).toLocaleDateString('id-ID')}
          </span>
        )}
      </div>
    </div>
  );
}

export default Poll;
