import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronRight, 
  Users, 
  Lightbulb, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  List,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

// Sample data from our app
const customersData = [
  { id: "1", name: "Acme Corp", revenue: "$250,000", status: "active", idea_count: 3, feedback_count: 2 },
  { id: "2", name: "TechStart Ltd", revenue: "$120,000", status: "active", idea_count: 1, feedback_count: 3 },
  { id: "3", name: "Enterprise Solutions Inc", revenue: "$500,000", status: "active", idea_count: 5, feedback_count: 4 },
  { id: "4", name: "Startup Ventures", revenue: "$50,000", status: "prospect", idea_count: 0, feedback_count: 1 },
  { id: "5", name: "Global Industries", revenue: "$750,000", status: "inactive", idea_count: 2, feedback_count: 0 },
  { id: "6", name: "Local Business LLC", revenue: "$80,000", status: "active", idea_count: 1, feedback_count: 2 },
  { id: "7", name: "Innovative Tech", revenue: "$320,000", status: "prospect", idea_count: 0, feedback_count: 0 },
  { id: "8", name: "Strategic Partners Co", revenue: "$420,000", status: "active", idea_count: 4, feedback_count: 3 }
];

const ideasData = [
  { status: "new", count: 3 },
  { status: "planned", count: 4 },
  { status: "completed", count: 1 },
  { status: "rejected", count: 0 }
];

const ideasByPriority = [
  { priority: "urgent", count: 1 },
  { priority: "high", count: 4 },
  { priority: "medium", count: 3 },
  { priority: "low", count: 1 }
];

const feedbackBySentiment = [
  { sentiment: "positive", count: 4 },
  { sentiment: "neutral", count: 3 },
  { sentiment: "negative", count: 2 }
];

const revenueByStatus = [
  { status: "active", revenue: 1370000 },
  { status: "prospect", revenue: 370000 },
  { status: "inactive", revenue: 750000 }
];

const customerActivityData = [
  { month: 'Jan', ideas: 2, feedback: 3 },
  { month: 'Feb', ideas: 1, feedback: 2 },
  { month: 'Mar', ideas: 3, feedback: 3 },
  { month: 'Apr', ideas: 3, feedback: 4 },
  { month: 'May', ideas: 2, feedback: 3 },
  { month: 'Jun', ideas: 4, feedback: 5 }
];

// Define colors for charts
const COLORS: Record<string, string> = {
  active: '#22c55e', // Green
  inactive: '#6b7280', // Gray
  prospect: '#3b82f6', // Blue
  new: '#a855f7', // Purple
  planned: '#3b82f6', // Blue
  completed: '#22c55e', // Green
  rejected: '#6b7280', // Gray
  urgent: '#ef4444', // Red
  high: '#f97316', // Orange
  medium: '#3b82f6', // Blue
  low: '#22c55e', // Green
  positive: '#22c55e', // Green
  neutral: '#6b7280', // Gray
  negative: '#ef4444', // Red
};

// Type definitions for chart data
type FeedbackSentimentItem = {
  sentiment: string;
  count: number;
};

type IdeaStatusItem = {
  status: string;
  count: number;
};

type CustomerStatusRevenue = {
  status: string;
  revenue: number;
};

const Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Calculate some metrics
  const totalCustomers = customersData.length;
  const activeCustomers = customersData.filter(c => c.status === 'active').length;
  const totalIdeas = ideasData.reduce((sum, item) => sum + item.count, 0);
  const totalFeedback = feedbackBySentiment.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = customersData.reduce((sum, c) => sum + parseInt(c.revenue.replace(/[^0-9]/g, '')), 0);
  
  // Growth indicators (these would be calculated from real data in a production app)
  const customerGrowth = 8.2; // percent
  const revenueGrowth = 12.7; // percent
  const ideaGrowth = -3.4; // percent
  const feedbackGrowth = 6.1; // percent

  return (
    <div>
      {/* Header with breadcrumb and improved styling */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-muted-foreground mb-1">
            <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">Home</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-foreground">Home</h1>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Overview of your business performance and customer insights.</p>
        </div>
        <div>
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)} className="mb-0">
            <TabsList className="bg-white dark:bg-card border dark:border-border">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Customer Metric Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">{activeCustomers} active</p>
              </div>
              <div className={`flex items-center ${customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {customerGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(customerGrowth)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue Metric Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-muted-foreground flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}k</div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">Total revenue</p>
              </div>
              <div className={`flex items-center ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(revenueGrowth)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Ideas Metric Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-muted-foreground flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold">{totalIdeas}</div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">{ideasData.find(i => i.status === 'new')?.count || 0} new</p>
              </div>
              <div className={`flex items-center ${ideaGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ideaGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(ideaGrowth)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Feedback Metric Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-muted-foreground flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold">{totalFeedback}</div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">
                  {feedbackBySentiment.find(f => f.sentiment === 'positive')?.count || 0} positive
                </p>
              </div>
              <div className={`flex items-center ${feedbackGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {feedbackGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(feedbackGrowth)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Feedback by Sentiment Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feedback Sentiment</CardTitle>
            <CardDescription>Distribution of customer feedback by sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPieChart>
                  <Pie
                    data={feedbackBySentiment}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ sentiment, count, percent }: any) => `${sentiment}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {feedbackBySentiment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment] || '#cccccc'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Ideas by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ideas by Status</CardTitle>
            <CardDescription>Current status of product ideas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ideasData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Ideas">
                    {ideasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#cccccc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue by Customer Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Customer Status</CardTitle>
            <CardDescription>Revenue breakdown by customer status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueByStatus}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value: any) => [`$${(value as number).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" name="Revenue">
                    {revenueByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#cccccc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Customer Activity Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Activity</CardTitle>
            <CardDescription>Ideas and feedback over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={customerActivityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ideas" stroke={COLORS.high} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="feedback" stroke={COLORS.positive} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Customers</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customersData
                .sort((a, b) => parseInt(b.revenue.replace(/[^0-9]/g, '')) - parseInt(a.revenue.replace(/[^0-9]/g, '')))
                .slice(0, 5)
                .map(customer => (
                  <div key={customer.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-4 h-8 w-8 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{customer.name}</div>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground">{customer.idea_count} ideas, {customer.feedback_count} feedback</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{customer.revenue}</div>
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Customers
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strategic Goals</CardTitle>
            <CardDescription>Progress on key objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Goal 1 */}
              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium">Increase Customer Retention</div>
                  <div className="text-sm font-medium">75%</div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-muted rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">3 initiatives</div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">Target: Dec 31</div>
                </div>
              </div>
              
              {/* Goal 2 */}
              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium">Launch Mobile Application</div>
                  <div className="text-sm font-medium">45%</div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-muted rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">2 initiatives</div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">Target: Mar 15</div>
                </div>
              </div>
              
              {/* Goal 3 */}
              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium">Expand to European Market</div>
                  <div className="text-sm font-medium">20%</div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-muted rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">1 initiative</div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">Target: Jun 30</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 