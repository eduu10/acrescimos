import { ChevronUp, ChevronDown, Minus } from 'lucide-react';

const TABLE_DATA = [
  { pos: 1, team: "Botafogo", pts: 55, games: 24, w: 17, d: 4, l: 3, status: 'up' },
  { pos: 2, team: "Palmeiras", pts: 48, games: 24, w: 14, d: 6, l: 4, status: 'same' },
  { pos: 3, team: "Flamengo", pts: 45, games: 24, w: 13, d: 6, l: 5, status: 'down' },
  { pos: 4, team: "Grêmio", pts: 43, games: 23, w: 13, d: 4, l: 6, status: 'up' },
  { pos: 5, team: "Fluminense", pts: 41, games: 24, w: 12, d: 5, l: 7, status: 'down' },
  { pos: 6, team: "Athletico-PR", pts: 37, games: 24, w: 10, d: 7, l: 7, status: 'same' },
  { pos: 7, team: "Bragantino", pts: 36, games: 24, w: 9, d: 9, l: 6, status: 'up' },
  { pos: 8, team: "Fortaleza", pts: 35, games: 24, w: 10, d: 5, l: 9, status: 'down' },
];

export function LeagueTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#1B2436] p-4 flex items-center justify-between">
        <h3 className="text-white font-oswald font-bold text-lg uppercase">Brasileirão Série A</h3>
        <span className="text-[#F2E205] text-xs font-bold uppercase border border-[#F2E205] px-2 py-0.5 rounded">2026</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-3 py-3 font-medium text-center">Pos</th>
              <th className="px-3 py-3 font-medium">Time</th>
              <th className="px-3 py-3 font-medium text-center">Pts</th>
              <th className="px-3 py-3 font-medium text-center hidden sm:table-cell">J</th>
              <th className="px-3 py-3 font-medium text-center hidden sm:table-cell">V</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_DATA.map((row, index) => (
              <tr key={row.team} className={`border-b border-gray-50 hover:bg-gray-50 ${index < 4 ? 'bg-blue-50/10' : ''}`}>
                <td className="px-3 py-3 text-center font-bold text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    {row.pos}º
                    {row.status === 'up' && <ChevronUp className="w-3 h-3 text-green-500" />}
                    {row.status === 'down' && <ChevronDown className="w-3 h-3 text-red-500" />}
                    {row.status === 'same' && <Minus className="w-3 h-3 text-gray-300" />}
                  </div>
                </td>
                <td className="px-3 py-3 font-bold text-gray-900">
                  {row.team}
                </td>
                <td className="px-3 py-3 text-center font-bold text-[#1B2436]">
                  {row.pts}
                </td>
                <td className="px-3 py-3 text-center text-gray-500 hidden sm:table-cell">
                  {row.games}
                </td>
                <td className="px-3 py-3 text-center text-gray-500 hidden sm:table-cell">
                  {row.w}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
        <a href="#" className="text-xs font-bold text-[#1B2436] hover:text-[#F2E205] transition-colors uppercase">
          Ver tabela completa
        </a>
      </div>
    </div>
  );
}
