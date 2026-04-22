import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { AreaChartComponent } from '../components/charts/AreaChart';
import { StatsCard } from '../components/charts/StatsCard';
import { FiUsers, FiCheckCircle, FiHelpCircle, FiList } from 'react-icons/fi';

const mockChartData = [
  { date: 'Jun 29 6am', count: 0 },
  { date: 'Jun 29 8am', count: 5 },
  { date: 'Jun 29 10am', count: 12 },
  { date: 'Jun 29 12pm', count: 8 },
  { date: 'Jun 29 2pm', count: 3 },
  { date: 'Jun 29 4pm', count: 7 },
  { date: 'Jun 29 6pm', count: 15 },
];

export const Overview: React.FC = () => {
  return (
    <MainLayout title="(PHASE_3) MMDU INTERNATIONAL STUDENTS LEADERSHIP ELECTION-2024" status="completed">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li className="text-gray-500">Overview</li>
          </ol>
        </nav>

        {/* Success Banner */}
        <div className="bg-green-500 text-white rounded-lg p-4 mb-8">
          <p className="font-medium">
            This election ended on 6/29/24, 12:30 PM.{' '}
            <a href="/results" className="underline font-semibold">
              View Results »
            </a>
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Ballots Submitted By Date
          </h2>
          <AreaChartComponent data={mockChartData} height={300} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Participation"
            value="75%"
            subtitle="(15 Voters)"
            icon={FiCheckCircle}
            color="green"
          />
          <StatsCard
            title="Voters"
            value="20"
            icon={FiUsers}
            color="orange"
          />
          <StatsCard
            title="Ballot Questions"
            value="2"
            icon={FiHelpCircle}
            color="pink"
          />
          <StatsCard
            title="Options"
            value="4"
            icon={FiList}
            color="purple"
          />
        </div>
      </div>
    </MainLayout>
  );
};