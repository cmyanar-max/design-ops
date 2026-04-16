import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Users, CreditCard } from "lucide-react";

interface StatCardData {
  label: string;
  value: string | number;
  trend?: {
    percentage: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

interface StatsCardsProps {
  cards: StatCardData[];
}

export const StatsCards = ({ cards }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-6">

            <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent className="px-6 pb-2">
            <div className="text-2xl font-bold">{card.value}</div>
            {card.trend && (
              <div className={`flex items-center pt-3 text-xs ${card.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                <ArrowUpRight className="mr-1 h-3 w-3" />
                <span>{card.trend.percentage}% from last period</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Demo component
export const Component = () => {
  return (
    <div className="grid grid-cols-2 gap-6 w-full mx-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <div className="flex items-center pt-1 text-xs text-green-600">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            <span>+20.1% from last month</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2,350</div>
          <div className="flex items-center pt-1 text-xs text-green-600">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            <span>+18.2% from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
